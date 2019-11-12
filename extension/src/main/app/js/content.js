import $ from '../../../lib/jquery-min';
import 'babel-polyfill';
import '../styles/main.css';
import UserInterface from './ui-framework';
import SPOTIFY_CLASSES from './constants/spotify_classes';

var ui = new UserInterface;
var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if ($(mutations.addedNodes)(SPOTIFY_CLASSES.MAIN_LOGO)) {
        console.log(mutation.addedNodes);
      }
    });
});
observer.observe(document.querySelector(SPOTIFY_CLASSES.MAIN_ID), {childList: true, subtree: true});

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