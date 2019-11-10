import 'babel-polyfill';
import '../styles/main.css';
import UserInterface from './ui-framework';

var ui = new UserInterface
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request) {
    case "reloadUI":
      ui.handleLogo();
      sendResponse("Motif-client: reloaded UI");
      break;
    default:
      sendResponse("Motif-client: message not supported");
  }
});