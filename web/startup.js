var Startup = (function () {
  var service = 'FreeMyTVio.Startup';
  function enabled() {
    try { return !tizen.preference.exists('startup.enabled') || tizen.preference.getValue('startup.enabled') !== false; }
    catch (e) { return localStorage.getItem('fmtv.startup') !== 'off'; }
  }
  function toggle() {
    var value = !enabled();
    try { tizen.preference.setValue('startup.enabled', value); }
    catch (e) { localStorage.setItem('fmtv.startup', value ? 'on' : 'off'); }
  }
  function start() {
    try { tizen.application.launch(service, function () {}, function () {}); } catch (e) {}
  }
  return {enabled: enabled, toggle: toggle, start: start};
})();
