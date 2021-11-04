function get_browser() {
  var ua = navigator.userAgent,
    tem,
    M =
      ua.match(
        /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
      ) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return { name: "IE", version: tem[1] || "" };
  }
  if (M[1] === "Chrome") {
    tem = ua.match(/\bOPR|Edge\/(\d+)/);
    if (tem != null) {
      return { name: "Edge", version: tem[1] };
    }
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) {
    M.splice(1, 1, tem[1]);
  }
  return {
    name: M[0],
    version: M[1],
  };
}

var browser = get_browser();

function hideContent() {
  $("#browser-warning").removeClass("d-none");
  $(".formio_container").addClass("d-none");
  $("#qg-primary-content .alert-info").addClass("d-none");
  $("#qg-primary-content > p").addClass("d-none");
}

if (browser.name === "Firefox" && browser.version < 68) {
  hideContent();
}

if (browser.name === "IE" && browser.version < 11) {
  hideContent();
}
if (browser.name === "Edge" && browser.version < 17) {
  hideContent();
}
if (
  browser.name === "Chrome" &&
  browser.version < 76 &&
  !navigator.userAgent.match(
    /SAMSUNG|SGH-[I|N|T]|GT-[I|P|N]|SM-[N|P|T|Z|G]|SHV-E|SCH-[I|J|R|S]|SPH-L/i
  )
) {
  hideContent();
}
if (browser.name === "Safari" && browser.version < 11) {
  hideContent();
}

if (navigator.userAgent.indexOf("MSIE") >= 0) {
  hideContent();
}
