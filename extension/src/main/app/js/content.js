import $ from '../../../lib/jquery-min';
import 'babel-polyfill';
import '../styles/main.css';
import UserInterface from './ui-framework';
import SPOTIFY_CLASSES from './constants/spotify_classes';

var ui = new UserInterface
var target = document.querySelector('#main');
var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        console.log(mutation.type);
    });
});
var config = { attributes: true, childList: true, characterData: true }
observer.observe(target, config);

  // ui.handleLogo();
  // ui.updateTagLists();


// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   switch (request) {
//     case "reloadUI":
//       sendResponse("Motif-client: reloading UI");
//       
//       
//       break;
//     default:
//       sendResponse("Motif-client: message not supported");
//   }
// });