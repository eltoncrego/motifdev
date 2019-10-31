console.log("Motif for Spotify is running!");
var ourSVGURL = chrome.extension.getURL("../../../../assets/img/main-logo.svg");
$.get(ourSVGURL, function(response) {
  var spotifySVG = document.getElementsByClassName('spotify-logo--text');
  spotifySVG[0].parentElement.innerHTML = response;
}, 'html');
