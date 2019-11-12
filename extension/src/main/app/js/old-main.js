import $ from '../../../lib/jquery-min';
import AccessorProvider from './ui_selection/applicatorProvider';
import SPOTIFY_CLASSES from './constants/spotify_classes';
import FILEPATHS from './constants/filepaths';
// import SPOTIFY_ACTIONS from './spotify_actions';

class Main {
  sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  run() {
    this.changeSpotify();

    // (function(ns, fetch){
    //   if(typeof fetch !== 'function') return;
      
    //   ns.fetch = function() {
    //     var out = fetch.apply(this, arguments);
    //     out.then((resp) => {
    //     resp2 = resp.clone()		
    //     resp2.json().then(console.log)
    //     })
        
    //     return out;
    //   }
      
    // }(window, window.fetch))
    return true;
  }


  async changeSpotify() {
    // Need to wait for spotifies dom structure to load... happens through react so it
    // may not available when this script gets originally run on the document.ready
    // event... we can probably do a better check by doing shorter polls
    // and retrying every 500 ms or something like that until we find
    // some element we are looking for that is guaranteed to be there eventually

    // eslint-disable-next-line no-unused-vars
    this.sleep(3000).then((r) => {
      const accessors = new AccessorProvider().getAccessors();
      // Apply all accessors on startup
      accessors.forEach((a) => a.build()()); // change this cause iz weird
      // $(".tracklist").children().after("<button id='test'/>");
      // $("button#test").html("Get Info").on("click", () => {
      //     var body = {
      //         action : SPOTIFY_ACTIONS.ADD_PLAYLIST,
      //         playlistInfo : {
      //             name : "My MANNN",
      //             tracks : [],
      //             isPublic : true,
      //             isCollaborative : false
      //         }
      //     }

      //     chrome.runtime.sendMessage(body, resp => alert(`Playlist created ${resp.uri}`));
      // })
    });
    this.updateLogo();
  }

  // eslint-disable-next-line no-unused-vars
  updateLogo = () => setTimeout((resolve) => {
    // eslint-disable-next-line no-undef
    const ourSVGURL = chrome.extension.getURL(FILEPATHS.MAIN_LOGO_SVG);
    $.get(ourSVGURL, (response) => {
      let spotifySVG = document.getElementsByClassName(SPOTIFY_CLASSES.MAIN_LOGO);
      if (spotifySVG && spotifySVG[0] && spotifySVG[0].parentElement) {
        spotifySVG[0].style.opacity = 0;
        setTimeout(() => {
          spotifySVG[0].parentElement.innerHTML = response;
          setTimeout(() => {
            spotifySVG = document.getElementsByClassName(SPOTIFY_CLASSES.MAIN_LOGO);
            spotifySVG[0].style.opacity = 1;
          }, 300);
        }, 500);
      }
    }, 'html');
  }, 3000);
}

export default Main;


//     accessor = (modifier) => () => modifier($(".tracklist").children());
//     modify = (selection) => selection.after("<p id='ours'>hey friend ;)</p>");
//     loadedAccessor = accessor(modify);

//     await changeSpotify(loadedAccessor);
//     sleep(3000).then(_ => {
//         var observer = new MutationObserver(function(mutations) {
//             mutations.forEach(function(mutation) {
//                 var node = mutation.addedNodes && mutation.addedNodes[0];
//                 if (node && $(".tracklist-row", node).length > 0) {
//                     modify($(".tracklist-row", node));
//                 }
//             });
//         });

//         var observerConfig = {
//             childList: true,
//             subtree: true,
//         };

//         var targetNode = $("#main")[0]
//         observer.observe(targetNode, observerConfig);
//     })
