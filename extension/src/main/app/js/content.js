import 'babel-polyfill';
import '../styles/main.css';
import Motif from './main';

var motifapp = new Motif();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.greeting === "reloadUI")
    motifapp.run();
    sendResponse("Motif: reloaded UI");
});