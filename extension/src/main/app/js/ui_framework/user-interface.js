import $ from '../../../../lib/jquery-min';
import MOTIF_CLASSES from '../constants/motif_classes';
import SPOTIFY_CLASSES from '../constants/spotify_classes';
import HtmlLoader from '../components/html-loader';
import FILEPATHS from '../constants/filepaths';
import MotifApi from '../apis/motif_api';
import SearchModal from './search-modal';
import AutoComplete from './autocomplete';
import UIExt from './ui-ext';
import { formatAsHTMLClass } from '../ext/helpers';
// import UISongs from './ui-songs';

class UserInterface {
  constructor() {
    this.motifApi = new MotifApi();
    this.autoComplete = new AutoComplete();
    this.searchModal = new SearchModal();
    this.uiExt = new UIExt();
    // this.uiSongs = new UISongs();
  }

  init() {
    this.updateLogo();
    this.searchModal.initModal();
  }

  update(trackNameToMetadata, pageType) {
    this.trackNameToMetadata = trackNameToMetadata;
    this.pageType = pageType;
    this.initTaglists();
    // this.uiSongs.update();
  }
  
  updateLogo() {
    this.mainLogo = $(SPOTIFY_CLASSES.MAIN_LOGO);
    setTimeout(() => {
      new HtmlLoader(FILEPATHS.MAIN_LOGO_SVG).getHtml().then((response) => {
        this.mainLogo.css('opacity', '0');
        setTimeout(() => {
          this.mainLogo.replaceWith(response);
          setTimeout(() => {
            this.mainLogo = $(SPOTIFY_CLASSES.MAIN_LOGO)
            this.mainLogo.css('opacity', '1');
          }, 300);
        }, 500);
      });
    }, 100);
  }

  initTaglists() {
    if (this.pageType !== "album" && this.pageType !== "playlist") {
      return;
    }

    setTimeout(() => {
      // Limit songs retrieved to avoid dealing with recommended songs (have same selector)
      const tracklistColumns = $(".tracklist").first().find(SPOTIFY_CLASSES.TRACK_CONTEXT_WRAPPER);
      const classRef = this;
      new HtmlLoader(FILEPATHS.TAG_LIST_HTML).getHtml().then((tagListDivString) => {
        if (tracklistColumns.length > 0 && tracklistColumns.find(MOTIF_CLASSES.TAGLIST).length === 0) {
          const spotifyUITracks = $(SPOTIFY_CLASSES.TRACK);
          spotifyUITracks.css('transition', 'opacity 300ms ease-in-out');
          spotifyUITracks.css('opacity', '0'); 
          setTimeout(() => {
            tracklistColumns.append(function(index) { 
              const trackMetadata = classRef.trackNameToMetadata.get(Array.from(classRef.trackNameToMetadata.keys())[index]);
              let tagsText = "";
              if (trackMetadata) {
                trackMetadata.tags.forEach(tag => {
                  tagsText += classRef.uiExt.buildTagDiv(tag); // TODO need onclicks for this to remove
                });
              }
              const elem = $.parseHTML(tagListDivString.replace("{content}", tagsText))[0] // todo make into a smarter regex... e.g strip whitespace

              $(elem).find(MOTIF_CLASSES.DELETE_CONTAINER).on("hover", function() {
                $(this).find(MOTIF_CLASSES.DELETE).hover();
              }).on("click", function() {classRef.handleDelete(this, trackMetadata)});
              return elem;
            });

            $(MOTIF_CLASSES.TAGLIST).css('opacity', '1')
            spotifyUITracks.css('opacity', '1');

            $(MOTIF_CLASSES.ADD_TAG).on("click", function() {
              const index = $(MOTIF_CLASSES.ADD_TAG).index(this);
              const trackMetadata = classRef.trackNameToMetadata.get(Array.from(classRef.trackNameToMetadata.keys())[index]);
              classRef.showAutoComplete(this, trackMetadata, $(this).parent());
            });
          }, 1000);
        }
      });
    }, 300);
  }
  
  showAutoComplete(tagElem, trackMetadata, tagListUl) {
    const autoCompleteDiv = $(tagElem).parent().find(MOTIF_CLASSES.AUTOCOMPLETE);
    autoCompleteDiv.css({"visibility": "visible", "position": "relative"});
    $(tagElem).css({"visibility": "hidden", "position": "absolute"});
    const classRef = this;

    autoCompleteDiv.find(MOTIF_CLASSES.AUTOCOMPLETE_INPUT)
      .off() 
      .focus()
      .blur(function(e) {
        this.value = ''; 
        // ignore blur and let option on click handle this
        if (e.relatedTarget && e.relatedTarget.getAttribute("class") === formatAsHTMLClass(MOTIF_CLASSES.AUTOCOMPLETE_OPTION)) { 
          return;
        }
        tagListUl.find(MOTIF_CLASSES.AUTOCOMPLETE_DATA).empty();
        autoCompleteDiv.css({"visibility": "hidden", "position": "absolute"});
        $(tagElem).css({"visibility": "visible", "position": "relative"})
      })
      .on("input", this.autoComplete.init(trackMetadata.tags, () => JSON.parse(localStorage.getItem("tags")).tags.map(tag => tag.name),
                tagListUl, function() {
                  classRef.motifApi.addTagToSong(localStorage.getItem("userId"), this.value, trackMetadata.id, trackMetadata.name, trackMetadata.artist)
                    .then(resp => { // TODO change up error handling? 
                      if (resp.status == "SUCCESS") {
                        classRef.addTagFromChild(this, trackMetadata);
                      }
                    });
                }))
      .on("keypress", function(e) {e.which === 13  && classRef.handleEnter(this, trackMetadata)});
  }

  initAutoComplete(trackMetadata, tagListUl) {
    const existingTags = trackMetadata.tags;
    const availableTags = JSON.parse(localStorage.getItem("tags")).tags.map(tag => tag.name);
    // TODO make this more efficient? 
    const tagsToShow = availableTags.filter(tagName => existingTags.indexOf(tagName) === -1);
    const classRef = this;
    return function onInputChange() {
      const data = tagListUl.find(MOTIF_CLASSES.AUTOCOMPLETE_DATA);
      data.empty();
      const prefix = this.value;
      if (prefix === "") {
        return;
      }
      const matchingTags = tagsToShow.filter(tag => tag.toLowerCase().startsWith(prefix.toLowerCase()));
      matchingTags.forEach(tag => data.append(`<input class='${formatAsHTMLClass(MOTIF_CLASSES.AUTOCOMPLETE_OPTION)}' type='button' value='${tag}'/>`));
      data.find("input").on("click", function() {
        classRef.motifApi.addTagToSong(localStorage.getItem("userId"), this.value, trackMetadata.id, trackMetadata.name, trackMetadata.artist)
          .then(resp => { // TODO change up error handling? 
            if (resp.status == "SUCCESS") {
              classRef.addTagFromChild(this, trackMetadata);
            }
          });
      });
    }
  }

  addTagFromChild(childElem, trackMetadata) {
    const classRef = this;
    const existingTags = trackMetadata.tags;
    existingTags.push(childElem.value);
    var p = $(childElem);
    while (p.attr("class") !== formatAsHTMLClass(MOTIF_CLASSES.TAGLIST)) {
      p = p.parent();
    }
    p.find(MOTIF_CLASSES.ADD_TAG)
      .css({"visibility": "visible", "position": "relative"})
      .before(() => this.uiExt.buildTagDiv(childElem.value)); 

    p.find(MOTIF_CLASSES.DELETE_CONTAINER).on("hover", function() {
      $(this).find(MOTIF_CLASSES.DELETE).hover();
    }).on("click", function() {classRef.handleDelete(this, trackMetadata)});

    p.find(MOTIF_CLASSES.AUTOCOMPLETE_DATA).empty();
    p.find(MOTIF_CLASSES.AUTOCOMPLETE).css({"visibility": "hidden", "position": "absolute"});
  }

  handleEnter(inputElem, trackMetadata) {
    const existingTags = trackMetadata.tags;
    if (existingTags.map(s => s.toLowerCase()).indexOf(inputElem.value.toLowerCase()) !== -1) {
      return;
    }
    this.motifApi.addTagToSong(localStorage.getItem("userId"), inputElem.value, trackMetadata.id, trackMetadata.name, trackMetadata.artist)
      .then(resp => { // TODO change up error handling? 
        if (resp.status == "SUCCESS") {
          this.addTagFromChild(inputElem, trackMetadata);
          const storageTags = JSON.parse(localStorage.getItem("tags"));
          storageTags.tags.push({"name": inputElem.value});
          localStorage.setItem("tags", JSON.stringify(storageTags));
        }
      });
  }

  handleDelete(toDelElem, trackMetadata) { 
    const existingTags = trackMetadata.tags;
    var p = $(toDelElem);
    while (p.attr("class") !== formatAsHTMLClass(MOTIF_CLASSES.SONGTAG)) {
      p = p.parent();
    }
    const tag = p.find("span").html();
    this.motifApi.deleteTagFromSong(localStorage.getItem("userId"), tag, trackMetadata.id)
      .then(resp => { // TODO change up error handling? 
        if (resp.status == "SUCCESS") {
          existingTags.splice(existingTags.indexOf(p.find("span").html()), 1);
          p.remove()
        }
      });
  }
}

export default UserInterface;
