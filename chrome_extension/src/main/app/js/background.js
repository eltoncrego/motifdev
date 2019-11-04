import { SPOTIFY_ACTIONS } from './helpers';

var client_id = '6ffaf918d8124705b1d013e475a3af03';
chrome.runtime.onMessage.addListener((request, sender, callback) => {
    handleRequest(request, callback)
    return true 
})

const redirect_uri = chrome.identity.getRedirectURL('oauth2')

const buildQueryString = params => Object.keys(params)
    .map(key => [key, params[key]].map(encodeURIComponent).join('='))
    .join('&').replace(/%20/g, '+');

const randomState = () => {
    let array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    return String(array[0])
}

const authorize = () => new Promise((resolve, reject) => {
    const state = randomState()
    console.log(redirect_uri);

    chrome.identity.launchWebAuthFlow({
        url: 'https://accounts.spotify.com/authorize?' + buildQueryString({
            client_id,
            redirect_uri,
            response_type: 'token',
            scope: ['playlist-modify-private', 'playlist-modify-public'],
            state
        }),
        interactive: true,
     }, redirectURL => {
        const params = new URLSearchParams(redirectURL.split('#')[1])

        if (params.get('state') !== state) {
            throw new Error('Invalid state')
        }

        const accessToken = params.get('access_token')

        chrome.storage.local.set({ accessToken }, () => {
            resolve(accessToken)
        })
    })
})

const getToken = () => new Promise((resolve, reject) => {
    chrome.storage.local.get('accessToken', result => {
        resolve(result.accessToken || authorize())
    })
})

async function api (url, options = {}) {
    const accessToken = await getToken()

    options.headers = {
        ...options.headers,
        Authorization: 'Bearer ' + accessToken,
    }

    console.log(options);

    const response = await fetch('https://api.spotify.com/v1' + url, options)

    const data = await response.json()
    console.log(data);

    if (data.error) {
        console.error(data.error)

        if (data.error.status === 401) {
            console.log("Retrying auth")
            authorize();
            return api(url, options); // todo add retries?
        }

        return
    }

    return data
    // TODO return promise
}

async function handleRequest(request, callback) {
    var userInfo = await api("/me");
    var action = request.action;
    if (action === SPOTIFY_ACTIONS.ADD_PLAYLIST) {
        handleAddPlaylist({
            ...request.playlistInfo,
            userId : userInfo.id
        }, callback);
    }
    return true;
}

// class SpotifyController {
//     constructor(request) {
//         this.request = request;
//     }

// }

async function handleAddPlaylist(playlistInfo, callback) {
    var body = {
        name : playlistInfo.name,
        public : playlistInfo.isPublic || false,
        collaborative : playlistInfo.isCollaborative || false,
    }
    var data = await api(`/users/${playlistInfo.userId}/playlists`, 
        {
            "method": "post", 
            "body": JSON.stringify(body)
        }
    );
    callback(data);
}

// TODO finish up handlers to make all the requests.... 
// probably good to make an external class and delegate to that?
