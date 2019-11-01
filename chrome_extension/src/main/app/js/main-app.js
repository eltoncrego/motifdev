$(async function() {
    await changeSpotify();
});

async function changeSpotify() {
    // Need to wait for spotifies dom structure to load... happens through react so it
    // may not available when this script gets originally run on the document.ready
    // event... we can probably do a better check by doing shorter polls
    // and retrying every 500 ms or something like that until we find
    // some element we are looking for that is guaranteed to be there eventually
    setTimeout(function (resolve) {
      console.log("Motif for Spotify is running!");
      var ourSVGURL = chrome.extension.getURL("../../../../assets/img/main-logo.svg");
      $.get(ourSVGURL, function(response) {
        var spotifySVG = document.getElementsByClassName("spotify-logo--text");
        if (spotifySVG && spotifySVG[0] && spotifySVG[0].parentElement) {
          spotifySVG[0].style.opacity = 0;
          setTimeout(function() {
            spotifySVG[0].parentElement.innerHTML = response;
            setTimeout(function() {
              spotifySVG[0].style.opacity = 1;
            }, 300);
          }, 500);
        }
      }, 'html');
    }, 3000);
}
