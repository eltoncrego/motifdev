import $ from '../../../lib/jquery-min';
import SPOTIFY_CLASSES from './constants/spotify_classes';
import ASSET_FILEPATHS from './constants/asset_filepaths';

class UserInterface {
  
  updateLogo() {
    setTimeout((resolve) => { 
      const ourSVGURL = chrome.extension.getURL(ASSET_FILEPATHS.MAIN_LOGO_SVG);
      $.get(ourSVGURL, (response) => {
        let spotifyMainLogo = $(SPOTIFY_CLASSES.MAIN_LOGO);
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