import $ from '../../../lib/jquery-min';
import SPOTIFY_CLASSES from './constants/spotify_classes';
import ASSET_FILEPATHS from './constants/asset_filepaths';
import MOTIF_CLASSES from './constants/motif_classes';

class UserInterface {

  handleLogo() {
    var mainLogo = $(SPOTIFY_CLASSES.MAIN_LOGO);
    if ((mainLogo).attr('id') !== MOTIF_CLASSES.MAIN_LOGO_ID) {
      this.updateLogo(mainLogo);
    }
  }
  
  updateLogo(mainLogo) {
    setTimeout((resolve) => { 
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
    setTimeout((resolve) => {
      const tagListURL = chrome.extension.getURL(ASSET_FILEPATHS.TAG_LIST_HTML);
      $.get(tagListURL, (response) => {
        $(SPOTIFY_CLASSES.TRACK_UI_COLUMN).css('height', 'auto');
        $(SPOTIFY_CLASSES.TRACK).css('height', 'auto');
        $(SPOTIFY_CLASSES.TRACK_TEXT_COLUMN).children().after(response);
      }, 'html');
    }, 3000);
  }
}

export default UserInterface;