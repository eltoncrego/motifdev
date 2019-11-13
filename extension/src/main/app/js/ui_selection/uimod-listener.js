import $ from '../../../../lib/jquery-min';
import SPOTIFY_CLASSES from '../constants/spotify_classes';
import SPOTIFY_ACTIONS from '../constants/spotify_actions';

class UIModListener {
  constructor() {
    this.currentHref = document.location.href;
  }

  listen(update) {
    const config = { childList: true, subtree: true };
    this.observer = new MutationObserver((mutations) => mutations.forEach(() => {
      if (document.location.href != this.currentHref) {
        this.currentHref = document.location.href;
        update();
        this.fetchPageInfo();
      }
    }));
    this.observer.observe($(SPOTIFY_CLASSES.MAIN_APP_ID)[0], config);
  }

  disconnect() {
    this.observer.disconnect();
  }

  // TODO extract this logic into some other class... this is merely a test
  // also think about all this extracting all this parsing logic into some other class... I'm sure this can
  // be used here and in the background.js process as well
  fetchPageInfo() {
    const splitUrl = this.currentHref.split('/');
    const rootIndex = splitUrl.indexOf('open.spotify.com');
    const type = splitUrl[rootIndex + 1];
    let action;
    if (type === 'playlist') {
      action = SPOTIFY_ACTIONS.GET_PLAYLIST_TRACKS;
    } else if (type === 'album') {
      action = SPOTIFY_ACTIONS.GET_ALBUM_TRACKS;
    } else {
      console.log(`Fetching page type ${type} currently not supported.`);
      return;
    }

    const body = {
      action,
      options: {
        id: splitUrl[rootIndex + 2],
      },
    };

    chrome.runtime.sendMessage(body, (resp) => console.log(`Songs fetched: ${JSON.stringify(resp)}`));
  }
}

export default UIModListener;
