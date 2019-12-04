import $ from '../../../../lib/jquery-min';
import SPOTIFY_CLASSES from '../constants/spotify_classes';
import SPOTIFY_ACTIONS from '../constants/spotify_actions';
import MotifApi from '../apis/motif_api';

type UpdateFn = (resp: any) => void;
type NullableObserver = MutationObserver | null;
type InfoMap = {string: string}

class UIModListener {
  currentHref: string;
  update: UpdateFn;
  observer: NullableObserver;
  motifApi: MotifApi;
  constructor() {
    this.currentHref = document.location.href;
    this.update = (_) => {};
    this.observer = null;
    this.motifApi = new MotifApi();
  }

  listen(update: UpdateFn) {
    const config = { childList: true, subtree: true };
    this.update = update;
    this.observer = new MutationObserver((mutations) => mutations.forEach(() => {
      if (document.location.href != this.currentHref) {
        this.currentHref = document.location.href;
        this.fire();
      }
    }));
    this.observer.observe(($(SPOTIFY_CLASSES.MAIN_APP_ID)as any)[0], config);
  }

  disconnect() {
    this.observer && this.observer.disconnect();
  }

  // Can't be called before listen
  fire() {
       this.fetchPageInfo().then((pageInfo: any) => this.motifApi.getTagsFromIds(pageInfo)).then((resp) => this.update(resp)).catch(console.error);
  }

  fetchPageInfo(): Promise<any> {
    const splitUrl = this.currentHref.split('/');
    const rootIndex = splitUrl.indexOf('open.spotify.com');
    const type = splitUrl[rootIndex + 1];
    let responseTransform = (r: any) => r;
    let action;
    if (type === 'playlist') {
      action = SPOTIFY_ACTIONS.GET_PLAYLIST_TRACKS;
      responseTransform = (pageInfo) => (
        {
          trackNameToId: pageInfo.items.map((item: any) => item.track).reduce((currentMap: any, track: any) => ({[track.name]: track.id, ...currentMap}), {}),
          pageType: "playlist"
      });
    } else if (type === 'album') {
      action = SPOTIFY_ACTIONS.GET_ALBUM_TRACKS;
      responseTransform = (pageInfo) => (
        {
          trackNameToId: pageInfo.items.reduce((currentMap: any, track: any) => ({[track.name]: track.id, ...currentMap}), {}),
          pageType: "album"
      });
    } else {
      console.log(`Fetching page type ${type} currently not supported.`);
      return Promise.reject();
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
  sendMessagePromise(body: object, responseTransform = (r: object) => r) {
    return new Promise((resolve, reject) => {
      //@ts-ignore
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
