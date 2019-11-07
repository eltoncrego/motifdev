import $ from '../../../lib/jquery-min';
import SPOTIFY_ACTIONS from './helpers';

class App {
  run() {
    this.changeSpotify();
    return true;
  }

  sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async changeSpotify() {
    // Need to wait for spotifies dom structure to load... happens through react so it
    // may not available when this script gets originally run on the document.ready
    // event... we can probably do a better check by doing shorter polls
    // and retrying every 500 ms or something like that until we find
    // some element we are looking for that is guaranteed to be there eventually

    // eslint-disable-next-line no-unused-vars
    this.sleep(3000).then((_r) => {
      $('.tracklist').children().after("<button id='test'/>");
      $('button#test').html('Get Info').on('click', () => {
        const body = {
          action: SPOTIFY_ACTIONS.ADD_PLAYLIST,
          playlistInfo: {
            name: 'My MANNN',
            tracks: [],
            isPublic: true,
            isCollaborative: false,
          },
        };

        // eslint-disable-next-line no-undef
        chrome.runtime.sendMessage(body, (resp) => `Playlist created ${resp.uri}`);
      });
    });
    this.updateLogo();
  }

  // eslint-disable-next-line no-unused-vars
  updateLogo = () => setTimeout((resolve) => {
    // eslint-disable-next-line no-undef
    const ourSVGURL = chrome.extension.getURL('assets/img/main-logo.svg');
    $.get(ourSVGURL, (response) => {
      let spotifySVG = document.getElementsByClassName('spotify-logo--text');
      if (spotifySVG && spotifySVG[0] && spotifySVG[0].parentElement) {
        spotifySVG[0].style.opacity = 0;
        setTimeout(() => {
          spotifySVG[0].parentElement.innerHTML = response;
          setTimeout(() => {
            spotifySVG = document.getElementsByClassName('spotify-logo--text');
            spotifySVG[0].style.opacity = 1;
          }, 300);
        }, 500);
      }
    }, 'html');
  }, 3000);
}

export default App;
