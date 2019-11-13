import 'babel-polyfill';
import SPOTIFY_ACTIONS from './constants/spotify_actions';

// eslint-disable-next-line no-undef
const redirectUri = chrome.identity.getRedirectURL('oauth2');
const clientId = '6ffaf918d8124705b1d013e475a3af03';

const buildQueryString = (params) => Object.keys(params)
  .map((key) => [key, params[key]].map(encodeURIComponent).join('='))
  .join('&').replace(/%20/g, '+');

const randomState = () => {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return String(array[0]);
};

// eslint-disable-next-line no-unused-vars
const authorize = () => new Promise((resolve, reject) => { // TODO handle reject
  const state = randomState();

  // eslint-disable-next-line no-undef
  chrome.identity.launchWebAuthFlow({
    url: `https://accounts.spotify.com/authorize?${buildQueryString({
      clientId,
      redirectUri,
      response_type: 'token',
      scope: ['playlist-modify-private', 'playlist-modify-public'],
      state,
    })}`,
    interactive: true,
  }, (redirectURL) => {
    const params = new URLSearchParams(redirectURL.split('#')[1]);

    if (params.get('state') !== state) {
      throw new Error('Invalid state');
    }

    const accessToken = params.get('access_token');

    // eslint-disable-next-line no-undef
    chrome.storage.local.set({ accessToken }, () => {
      resolve(accessToken);
    });
  });
});

// eslint-disable-next-line no-unused-vars
const getToken = () => new Promise((resolve, reject) => { // TODO handle reject
  // eslint-disable-next-line no-undef
  chrome.storage.local.get('accessToken', (result) => {
    resolve(result.accessToken || authorize());
  });
});

const api = (url, options = {}) => new Promise((resolve, reject) => {
  getToken().then((token) => {
    // eslint-disable-next-line no-param-reassign
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    fetch(`https://api.spotify.com/v1${url}`, options)
      .then((response) => response.json().then((data) => {
        if (data.error) {
          if (data.error.status === 401) {
            authorize();
            return api(url, options); // todo add retries... would this ever infinite loop?
          }
          return reject(data);
        }
        return resolve(data);
      }));
  });
});

async function handleAddPlaylist(playlistInfo, callback) {
  const body = {
    name: playlistInfo.name,
    public: playlistInfo.isPublic || false,
    collaborative: playlistInfo.isCollaborative || false,
  };
  const data = await api(`/users/${playlistInfo.userId}/playlists`,
    {
      method: 'post',
      body: JSON.stringify(body),
    });
  callback(data);
}

async function handleGetPlaylistOrAlbumTracks(options, callback) {
  const data = await api(`/${options.type}/${options.id}/tracks`,
    {
      method: 'get',
    });
  callback(data);
}

async function handleRequest(request, callback) {
  const { action } = request;
  if (action === SPOTIFY_ACTIONS.ADD_PLAYLIST) {
    const userInfo = await api('/me');
    handleAddPlaylist({
      ...request.options,
      userId: userInfo.id,
    }, callback);
  } else if (action === SPOTIFY_ACTIONS.GET_PLAYLIST_TRACKS) {
    handleGetPlaylistOrAlbumTracks({
      ...request.options,
      type: 'playlists',
    }, callback);
  } else if (action === SPOTIFY_ACTIONS.GET_ALBUM_TRACKS) {
    handleGetPlaylistOrAlbumTracks({
      ...request.options,
      type: 'albums',
    }, callback);
  }
  return true;
}

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, callback) => {
  handleRequest(request, callback);
  return true;
});

// TODO finish up handlers to make all the requests....
// probably good to make an external class and delegate to that?
