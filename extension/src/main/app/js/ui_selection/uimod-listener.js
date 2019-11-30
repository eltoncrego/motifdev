import $ from '../../../../lib/jquery-min';
import SPOTIFY_CLASSES from '../constants/spotify_classes';
import SPOTIFY_ACTIONS from '../constants/spotify_actions';

class UIModListener {
  constructor() {
    this.currentHref = document.location.href;
    this.update;
  }

  listen(update) {
    const config = { childList: true, subtree: true };
    this.update = update;
    this.observer = new MutationObserver((mutations) => mutations.forEach(() => {
      if (document.location.href != this.currentHref) {
        this.currentHref = document.location.href;
        this.fire();
      }
    }));
    this.observer.observe($(SPOTIFY_CLASSES.MAIN_APP_ID)[0], config);
  }

  disconnect() {
    this.observer.disconnect();
  }

  // Can't be called before listen
  fire() {
      this.fetchPageInfo().then((resp) => this.update(resp));
  }

  // TODO extract this logic into some other class... this is merely a test
  // also think about all this extracting all this parsing logic into some other class... I'm sure this can
  // be used here and in the background.js process as well
  fetchPageInfo() {
    const splitUrl = this.currentHref.split('/');
    const rootIndex = splitUrl.indexOf('open.spotify.com');
    const type = splitUrl[rootIndex + 1];
    let responseTransform = (r) => r;
    let action;
    if (type === 'playlist') {
      action = SPOTIFY_ACTIONS.GET_PLAYLIST_TRACKS;
      responseTransform = (pageInfo) => (
        {
          trackNameToId: pageInfo.items.map((item) => item.track).reduce((currentMap, track) => ({[track.name]: track.id, ...currentMap}), {}),
          pageType: "playlist"
      });
    } else if (type === 'album') {
      action = SPOTIFY_ACTIONS.GET_ALBUM_TRACKS;
      responseTransform = (pageInfo) => (
        {
          trackNameToId: pageInfo.items.reduce((currentMap, track) => ({[track.name]: track.id, ...currentMap}), {}),
          pageType: "album"
      });
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

    return this.sendMessagePromise(body, responseTransform);
  }

  /**
   * Promise wrapper for chrome.tabs.sendMessage
   * @param tabId
   * @param item
   * @returns {Promise<any>}
   */
  sendMessagePromise(body, responseTransform = (r) => r) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(body, response => {
            if(response.complete) {
                resolve(responseTransform(response));
            } else {
                reject('Something wrong');
            }
        });
    });
  }
}

export default UIModListener;
