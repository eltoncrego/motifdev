import $ from '../../../../lib/jquery-min';
import MOTIF_CLASSES from '../constants/motif_classes';
import SPOTIFY_CLASSES from '../constants/spotify_classes';
import logo from '../components/logo';
import tagList from '../components/tag-list';

function addTag(r, trackNameToId){
  var trackName = r.target.parentNode.parentElement.parentElement.parentElement.parentElement.getElementsByClassName("tracklist-name")[0].textContent;
  alert("Add tag for " + trackNameToId[trackName]);
}

class UserInterface {
  init(trackNameToMetadata) {
    this.trackNameToId = trackNameToMetadata;
    this.handleLogo();
    this.initTaglists();
  }

  handleLogo() {
    this.mainLogo = this.mainLogo || $(SPOTIFY_CLASSES.MAIN_LOGO);
    if (this.mainLogo.attr('id') !== MOTIF_CLASSES.MAIN_LOGO_ID) {
      this.updateLogo();
    }
  }

  updateLogo() {
    setTimeout(() => {
      new logo().init().then((response) => {
        if (this.mainLogo.length > 0) {
          this.mainLogo.css('opacity', '0');
          setTimeout(() => {
            this.mainLogo.replaceWith(response);
            setTimeout(() => {
              this.mainLogo = $(SPOTIFY_CLASSES.MAIN_LOGO);
              this.mainLogo.css('opacity', '1');
            }, 300);
          }, 500);
        }
      });
    }, 100);
  }

  initTaglists() {
    setTimeout(() => {
      const tracklistColumns = $(SPOTIFY_CLASSES.TRACK_TEXT_COLUMN);
      new tagList().init().then((response) => {
        if (tracklistColumns.length > 0 && tracklistColumns.find(MOTIF_CLASSES.TAGLIST_CLASS).length === 0) {
          const spotifyUICol = $(SPOTIFY_CLASSES.TRACK_UI_COLUMN);
          const spotifyUITracks = $(SPOTIFY_CLASSES.TRACK);
          spotifyUITracks.css('transition', 'opacity 300ms ease-in-out');
          spotifyUITracks.css('opacity', '0');
          setTimeout(() => {
            spotifyUICol.css('height', 'auto');
            spotifyUITracks.css('height', 'auto');
            tracklistColumns.children().after(response);
            $(MOTIF_CLASSES.TAGLIST_CLASS).css('opacity', '1')
            spotifyUITracks.css('opacity', '1');

            var tags = $(".motif-taglist-addTag");
            tags.click((r) => {
              addTag(r, this.trackNameToId);
            });
          }, 400);
        }
      });
    }, 1500);
  }
}

export default UserInterface;
