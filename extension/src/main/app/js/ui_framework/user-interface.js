import tagList from '../components/tag-list';
import logo from '../components/logo';

class UserInterface {
  // handleLogo() {
  //   const mainLogo = $(SPOTIFY_CLASSES.MAIN_LOGO);
  //   if ((mainLogo).attr('id') !== MOTIF_IDS.MAIN_LOGO_ID) {
  //     this.updateLogo(mainLogo);
  //   }
  // }

  updateLogo() {
    var motifLogo = new logo().getLogo();
    console.log(motifLogo);
    // setTimeout(() => {
    //   const ourSVGURL = chrome.extension.getURL(ASSET_FILEPATHS.MAIN_LOGO_SVG);
    //   let spotifyMainLogo = mainLogo || $(SPOTIFY_CLASSES.MAIN_LOGO);
    //   $.get(ourSVGURL, (response) => {
    //     if (spotifyMainLogo.length > 0) {
    //       spotifyMainLogo.css('opacity', '0');
    //       setTimeout(() => {
    //         spotifyMainLogo.replaceWith(response);
    //         setTimeout(() => {
    //           spotifyMainLogo = $(SPOTIFY_CLASSES.MAIN_LOGO);
    //           spotifyMainLogo.css('opacity', '1');
    //         }, 300);
    //       }, 500);
    //     }
    //   }, 'html');
    // }, 100);
  }

  updateTagLists() {
    setTimeout(() => {
      const tracklistColumns = $(SPOTIFY_CLASSES.TRACK_TEXT_COLUMN);
      new tagList.init().then((response) => {
        if (tracklistColumns.length > 0 && tracklistColumns.find('.motif-taglist').length === 0) {
          const spotifyUICol = $(SPOTIFY_CLASSES.TRACK_UI_COLUMN);
          const spotifyUITracks = $(SPOTIFY_CLASSES.TRACK);
          spotifyUITracks.css('transition', 'opacity 300ms ease-in-out');
          spotifyUITracks.css('opacity', '0');
          setTimeout(() => {
            spotifyUICol.css('height', 'auto');
            spotifyUITracks.css('height', 'auto');
            tracklistColumns.children().after(response);
            $(MOTIF_IDS.TAGLIST_CLASS).css('opacity', '1');
            spotifyUITracks.css('opacity', '1');
          }, 400);
        }
      });
    }, 1500);
  }
}

export default UserInterface;
