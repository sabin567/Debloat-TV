/* Public market data only: no account identifiers, quantities or balances. */
var ETFWatch = (function () {
  'use strict';
  var funds = ['DHHF', 'NDQ', 'HACK', 'VGS', 'VTS'];
  var cache = {}, enabled = {}, busy = {}, listeners = [], lastAttempt = {};
  try { enabled = JSON.parse(localStorage.getItem('fmtv.etfs.enabled')) || {}; } catch (e) {}
  try { cache = JSON.parse(localStorage.getItem('fmtv.etfs.cache')) || {}; } catch (e) {}
  funds.forEach(function (ticker) { if (!cache[ticker] && window.ETF_INITIAL) cache[ticker] = window.ETF_INITIAL[ticker]; });
  function notify() { listeners.forEach(function (fn) { fn(); }); }
  function on(ticker) { return enabled[ticker] !== false; }
  function toggle(ticker) {
    enabled[ticker] = !on(ticker);
    try { localStorage.setItem('fmtv.etfs.enabled', JSON.stringify(enabled)); } catch (e) {}
    notify(); refresh();
  }
  function parse(result, now) {
    var bars = [], quotes = result.indicators.quote[0].close;
    var regular = result.meta.currentTradingPeriod && result.meta.currentTradingPeriod.regular;
    for (var i = 0; i < result.timestamp.length; i++) {
      var t = result.timestamp[i];
      if (regular && now / 1000 < regular.end && t >= regular.start) continue;
      if (typeof quotes[i] === 'number' && isFinite(quotes[i])) bars.push({at: t, price: quotes[i]});
    }
    if (bars.length < 6) throw new Error('Insufficient closing prices');
    var latest = bars[bars.length - 1], base = bars[bars.length - 6];
    if (base.price <= 0 || result.meta.currency !== 'AUD') throw new Error('Invalid quote');
    return {price: latest.price, change: latest.price - base.price,
      percent: (latest.price / base.price - 1) * 100, at: latest.at, from: base.at, fetched: now};
  }
  function refresh() {
    funds.forEach(function (ticker) {
      var now = Date.now();
      if (!on(ticker) || busy[ticker] || now - (lastAttempt[ticker] || 0) < 900000) return;
      lastAttempt[ticker] = now; busy[ticker] = true;
      var x = new XMLHttpRequest();
      x.open('GET', 'https://query1.finance.yahoo.com/v8/finance/chart/' + ticker + '.AX?range=1mo&interval=1d', true);
      x.timeout = 15000;
      function finish() { busy[ticker] = false; notify(); }
      x.onload = function () {
        try {
          if (x.status !== 200) throw new Error('Price feed unavailable');
          cache[ticker] = parse(JSON.parse(x.responseText).chart.result[0], now);
          try { localStorage.setItem('fmtv.etfs.cache', JSON.stringify(cache)); } catch (e) {}
        } catch (e) { if (cache[ticker]) cache[ticker].error = true; }
        finish();
      };
      x.onerror = x.ontimeout = function () { if (cache[ticker]) cache[ticker].error = true; finish(); };
      x.send();
    });
  }
  function render() {
    var box = document.getElementById('etfwatch');
    if (!box) return;
    box.innerHTML = '';
    var selected = funds.filter(on);
    box.style.display = selected.length ? 'block' : 'none';
    selected.forEach(function (ticker) {
      var cell = document.createElement('div'); cell.className = 'etf-cell';
      var data = cache[ticker], name = document.createElement('div');
      name.className = 'etf-name'; name.textContent = ticker; cell.appendChild(name);
      var price = document.createElement('div'); price.className = 'etf-price';
      price.textContent = data ? 'A$' + data.price.toFixed(2) : 'Unavailable'; cell.appendChild(price);
      var movement = document.createElement('div'); movement.className = 'etf-move';
      if (data) {
        var sign = data.change >= 0 ? '+' : '';
        movement.textContent = '1W ' + sign + 'A$' + data.change.toFixed(2) + ' (' + sign + data.percent.toFixed(2) + '%)';
        movement.style.color = data.change >= 0 ? '#168447' : '#c43a3a';
      } else movement.textContent = 'Weekly change unavailable';
      cell.appendChild(movement);
      var date = document.createElement('div'); date.className = 'etf-date';
      date.textContent = data ? 'Close ' + HomeClocks.date(data.at * 1000, 'Australia/Sydney') +
        (data.error || Date.now() - data.fetched > 1800000 ? ' · cached' : '') : 'Waiting for market data';
      cell.appendChild(date); box.appendChild(cell);
    });
    var note = document.createElement('div'); note.className = 'etf-note';
    note.textContent = 'ASX · Yahoo Finance · 1W = five trading sessions · price change excludes distributions';
    box.appendChild(note);
  }
  listeners.push(render);
  return {funds: funds, on: on, toggle: toggle, refresh: refresh, render: render, parse: parse};
})();
