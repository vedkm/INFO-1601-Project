console.log(window.navigator.cookieEnabled);
console.log(window.navigator.online);
console.log(navigator.appVersion);
console.log(navigator.userAgent)
console.log(navigator.platform);


console.log(window.location.href);
console.log(window.location.protocol);
console.log(window.location.hostname);

function redirect(url){
  window.location.assign(url);
}

window.onload = function(event){
   console.log("Page has loaded");

}