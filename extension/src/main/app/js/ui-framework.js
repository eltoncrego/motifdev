import $ from '../../../lib/jquery-min';
import SPOTIFY_CLASSES from './constants/spotify_classes';
import ASSET_FILEPATHS from './constants/asset_filepaths';
import MOTIF_IDS from './constants/motif_ids';

class UserInterface {

  handleLogo() {
    var mainLogo = $(SPOTIFY_CLASSES.MAIN_LOGO);
    if ((mainLogo).attr('id') !== MOTIF_IDS.MAIN_LOGO_ID) {
      this.updateLogo(mainLogo);
    }
  }
  
  updateLogo(mainLogo) {
    setTimeout(() => {
      const ourSVGURL = chrome.extension.getURL(ASSET_FILEPATHS.MAIN_LOGO_SVG);
      var spotifyMainLogo = mainLogo || $(SPOTIFY_CLASSES.MAIN_LOGO);
      $.get(ourSVGURL, (response) => {
        if (spotifyMainLogo.length > 0) {
          spotifyMainLogo.css('opacity', '0');
          setTimeout(() => {
            spotifyMainLogo.replaceWith(response);
            setTimeout(() => {
              spotifyMainLogo = $(SPOTIFY_CLASSES.MAIN_LOGO);
              spotifyMainLogo.css('opacity', '1');
            }, 300);
          }, 500);
        }
      }, 'html');
    }, 3000);
  }

  updateTagLists(){
    setTimeout(() => {
      const tagListURL = chrome.extension.getURL(ASSET_FILEPATHS.TAG_LIST_HTML);
      $.get(tagListURL, (response) => {
        var tracklistColumns = $(SPOTIFY_CLASSES.TRACK_TEXT_COLUMN);
        if (tracklistColumns.length > 0) {
          var spotifyUICol = $(SPOTIFY_CLASSES.TRACK_UI_COLUMN);
          var spotifyUITracks = $(SPOTIFY_CLASSES.TRACK);
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
      }, 'html');
    }, 3000);
  }
}

export default UserInterface;