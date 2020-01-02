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
    client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: ['playlist-modify-private', 'playlist-modify-public'],
      state,
    })}`,
    interactive: true,
  }, (redirectURL) => {
    console.log(redirectURL);
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
  // TODO add pagination for > 100 track playlist 
  getMotifPlaylistId(playlistInfo.userId).then(playlistId => {
    const body = {
      uris: playlistInfo.songIds.map(songId => `spotify:track:${songId}`)
    }
    api(`/playlists/${playlistId}/tracks`, {
      method: 'put',
      body: JSON.stringify(body)
    }).then(resp => callback({complete: true, ...resp}));
  });
}

async function getMotifPlaylistId(userId) {
  return api('/me/playlists', {method: 'get'}).then((playlists) => {
    const playlistItems = playlists.items;
    const motifPlaylistIndex = playlistItems.map(playlist => playlist.name).indexOf("Motif Playlist");

    if (motifPlaylistIndex !== -1) {
      return new Promise((resolve, reject) => {
        resolve(playlistItems[motifPlaylistIndex].id);
      });
    } else {
      const body = {
        name: "Motif Playlist",
        public: false,
        collaborative: false,
      };
      return api(`/users/${userId}/playlists`,
        {
          method: 'post',
          body: JSON.stringify(body),
        }).then(playlistMetadata => {return new Promise((resolve, reject) => resolve(playlistMetadata.id))});
    }
  });
}

async function handleGetPlaylistOrAlbumTracks(options, callback) {
  const data = await api(`/${options.type}/${options.id}/tracks`,
    {
      method: 'get',
    });
  callback({complete: true, ...data});
}

async function handleGetMe(options, callback) {
  const data = await api(`/me`,
    {
      method: 'get',
    });
  callback({complete: true, ...data});
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
  } else if (action === SPOTIFY_ACTIONS.ME) {
    handleGetMe(request.options, callback);
  }
  return true;
}
// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, callback) => {
  handleRequest(request, callback);
  return true;
});