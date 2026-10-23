/* Explicit IANA zones keep both clocks correct regardless of the TV's zone. */
var HomeClocks = (function () {
  function formatter(zone, options) {
    options.timeZone = zone;
    return new Intl.DateTimeFormat('en-AU', options);
  }
  var clocks = {}, dates = {};
  ['Australia/Sydney', 'Asia/Kathmandu'].forEach(function (zone) {
    clocks[zone] = formatter(zone, {hour: 'numeric', minute: '2-digit', hour12: true});
    dates[zone] = formatter(zone, {weekday: 'short', day: 'numeric', month: 'short'});
  });
  return {
    time: function (now, zone) { return clocks[zone].format(new Date(now)); },
    date: function (now, zone) { return dates[zone].format(new Date(now)); }
  };
})();
