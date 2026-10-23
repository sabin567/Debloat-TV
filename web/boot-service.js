/* Starts only Free My TV. No remote commands, shell access or external server. */
'use strict';
var timer = null, poller = null, lastState = null, running = false;
var APP = 'FreeMyTVio.FreeMyTV';
function enabled() {
  try { return !tizen.preference.exists('startup.enabled') || tizen.preference.getValue('startup.enabled') !== false; }
  catch (e) { return true; }
}
function schedule(delay) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(function () {
    timer = null;
    if (!enabled()) return;
    try { tizen.application.launch(APP, function () {}, function () {}); } catch (e) {}
  }, delay);
}
function powerState(state) {
  state = String(state || '').toLowerCase();
  if (state !== 'on' && state !== 'off' && state !== 'standby') return;
  if ((lastState === 'off' || lastState === 'standby') && state === 'on') schedule(1000);
  if (state !== 'on' && timer) { clearTimeout(timer); timer = null; }
  lastState = state;
}
function poll() {
  try {
    var http = require('http');
    var req = http.get({host: '127.0.0.1', port: 8001, path: '/api/v2/'}, function (res) {
      var body = '';
      res.on('data', function (chunk) { if (body.length < 65536) body += chunk; });
      res.on('end', function () { try { powerState(JSON.parse(body).device.PowerState); } catch (e) {} });
    });
    req.on('error', function () {});
    req.setTimeout(2000, function () { req.destroy(); });
  } catch (e) {}
}
module.exports.onStart = function () {
  if (running) return;
  running = true;
  schedule(1000);
  poll();
  poller = setInterval(poll, 1000);
};
module.exports.onRequest = function () {};
module.exports.onStop = function () {
  if (timer) clearTimeout(timer);
  if (poller) clearInterval(poller);
  running = false; timer = poller = null;
};
