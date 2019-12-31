import $ from '../../../../lib/jquery-min';
import MOTIF_CLASSES from '../constants/motif_classes';
import SPOTIFY_CLASSES from '../constants/spotify_classes';
import HtmlLoader from '../components/html-loader';
import FILEPATHS from '../constants/filepaths';
import MotifApi from '../apis/motif_api';
import AutoComplete from './autocomplete';
import QueryValidator from '../ext/query-validator';

class UserInterface {
  constructor() {
    this.motifApi = new MotifApi();
    this.autoComplete = new AutoComplete();
    this.queryValidator = new QueryValidator();
  }

  init() {
    this.updateLogo();
    this.initModal();
  }

  update(trackNameToMetadata) {
    this.trackNameToMetadata = trackNameToMetadata;
    this.initTaglists();
  }

  initModal() {
    const classRef = this;
    new HtmlLoader(FILEPATHS.SEARCH_MODAL).getHtml().then((response) => {
      $("body").append(response);

      // Initial stuff
      $(".motif-search-query-text").find(".motif-error-icon-container").on("mouseenter", function() {
        $(this).find(".motif-error-tooltip").css("display", "block");
      }).on("mouseleave", function() {
        $(this).find(".motif-error-tooltip").css("display", "none");
      });

      const container = $(".motif-search-container");
      const chosenTags = [];

      container.find(".motif-tag-autocomplete-input")
        .blur(function(e) {
              this.value = ''; 
              // ignore blur and let option on click handle this
              if (e.relatedTarget && e.relatedTarget.getAttribute("class") === 'motif-tag-autocomplete-option') { 
                return;
              }
              container.find(".motif-tag-autocomplete-data").empty();
            })
        .on("input", this.autoComplete.init(chosenTags, () => JSON.parse(localStorage.getItem("tags")).tags.map(tag => tag.name), container, 
          function() {
            container.find(".motif-autocomplete-search-li").before(classRef.buildTagDiv(this.value));
            chosenTags.push(this.value)
            container.find(".motif-tag-autocomplete-data").empty();
            container.find(".motif-tag-delete-container").on("hover", function() {
                $(this).find(".motif-tag-delete").hover();
              }).on("click", function() {
                var p = $(this);
                while (p.attr("class") !== "motif-taglist-songtag") {
                  p = p.parent();
                }
                const tag = p.find("span").html();
                chosenTags.splice(chosenTags.indexOf(tag), 1);
                p.remove()
                classRef.updateModalSearchText();
              });

            classRef.updateModalSearchText();
          }))
        .on("keypress", function(e) {
          if(e.which !== 13) {
            return;
          }  
          const operators = ["and", "or", "(", ")"];
          
          if (operators.indexOf(this.value) !== -1) {
            container.find(".motif-autocomplete-search-li").before(classRef.buildTagDiv(this.value, true));
            container.find(".motif-tag-delete-container").on("hover", function() {
              $(this).find(".motif-tag-delete").hover();
            }).on("click", function() {
              var p = $(this);
              while (p.attr("class") !== "motif-taglist-songtag") {
                p = p.parent();
              }
              p.remove()
              classRef.updateModalSearchText();
            });
            container.find(".motif-tag-autocomplete-input")[0].value = "";
            classRef.updateModalSearchText();
          }
        }); 
    });

    new HtmlLoader(FILEPATHS.MENU_LOGO).getHtml().then((response) => {
      $(SPOTIFY_CLASSES.MAIN_HEADER).append(response);
      $(".motif-menu-button").on("click", function() {
        $(".motif-modal").css("display", "flex");
      });

      $(".motif-modal").on("click", function(e) {
        if (e.target.className === "motif-modal") {
          $(this).css("display", "none");
        }
      });
    });
  }

  updateModalSearchText() {
    var text = [];
    $(".motif-search-query > .motif-taglist-songtag").find("span").each((i, e) => text.push(e.textContent));
    const searchQueryText = $(".motif-search-query-text")
    if (text.length !== 0) {
      const validityQuery = this.queryValidator.validateQuery(text);
      if (!validityQuery.valid) {
        searchQueryText.find(".motif-success-icon").css("display", "none");
        searchQueryText.find(".motif-error-icon").css("display", "block");
        searchQueryText.find(".motif-error-tooltip > div").text(validityQuery.error);
      } else {
        searchQueryText.find(".motif-success-icon").css("display", "block");
        searchQueryText.find(".motif-error-icon").css("display", "none");
        this.onValidQuery(text);
      }
    } else {
        searchQueryText.find(".motif-success-icon").css("display", "none");
        searchQueryText.find(".motif-error-icon").css("display", "none");
    }

    searchQueryText.find("span").text(text.join(" "));
  }

  onValidQuery(query) {
    this.motifApi.executeQuery(localStorage.getItem("userId"), query).then(resp => {
      const searchResultsUl = $(".motif-search-results").empty();
      resp.data.forEach(matchingSong => {
        searchResultsUl.append(`<li>${matchingSong.songName}</li>`);
      });
    });
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
    const classRef = this;
    setTimeout(() => {
      // Limit songs retrieved to avoid dealing with recommended songs (have same selector)
      const tracklistColumns = $(".tracklist").first().find(SPOTIFY_CLASSES.TRACK_CONTEXT_WRAPPER);
      const classRef = this;
      new HtmlLoader(FILEPATHS.TAG_LIST_HTML).getHtml().then((tagListDivString) => {
        if (tracklistColumns.length > 0 && tracklistColumns.find(MOTIF_CLASSES.TAGLIST_CLASS).length === 0) {
          const spotifyUITracks = $(SPOTIFY_CLASSES.TRACK);
          spotifyUITracks.css('transition', 'opacity 300ms ease-in-out');
          spotifyUITracks.css('opacity', '0'); 
          // PROCESS SHOULD BE AS FOLLOWS
          // 1. load html as string
          // 2. add in parameterized information... e.g song tags to a text version of the html
          // 3. convert string to html
          // 4. add in the right callbacks 
          setTimeout(() => {
            tracklistColumns.append(function(index) { 
              // We're relying on the fact that the order of songs in playlist view should be the same as that returned by api
              const trackMetadata = classRef.trackNameToMetadata.get(Array.from(classRef.trackNameToMetadata.keys())[index]);
              let tagsText = "";
              trackMetadata.tags.forEach(tag => {
                tagsText += classRef.buildTagDiv(tag); // TODO need onclicks for this to remove
              });
              const elem = $.parseHTML(tagListDivString.replace("{content}", tagsText))[0] // todo make into a smarter regex... e.g strip whitespace

              $(elem).find(".motif-tag-delete-container").on("hover", function() {
                $(this).find(".motif-tag-delete").hover();
              }).on("click", function() {classRef.handleDelete(this, trackMetadata)});
              return elem;
            });

            $(MOTIF_CLASSES.TAGLIST_CLASS).css('opacity', '1')
            spotifyUITracks.css('opacity', '1');

            $(".motif-taglist-addTag").on("click", function() {
              const index = $(".motif-taglist-addTag").index(this);
              const trackMetadata = classRef.trackNameToMetadata.get(Array.from(classRef.trackNameToMetadata.keys())[index]);
              classRef.showAutoComplete(this, trackMetadata, $(this).parent());
            });
          }, 1000);
        }
      });
    }, 300);
  }
  
  showAutoComplete(tagElem, trackMetadata, tagListUl) {
    const autoCompleteDiv = $(tagElem).parent().find(".motif-taglist-autocomplete");
    autoCompleteDiv.css({"visibility": "visible", "position": "relative"});
    $(tagElem).css({"visibility": "hidden", "position": "absolute"});
    const classRef = this;

    autoCompleteDiv.find(".motif-tag-autocomplete-input")
      .off() 
      .focus()
      .blur(function(e) {
        this.value = ''; 
        // ignore blur and let option on click handle this
        if (e.relatedTarget && e.relatedTarget.getAttribute("class") === 'motif-tag-autocomplete-option') { 
          return;
        }
        tagListUl.find(".motif-tag-autocomplete-data").empty();
        autoCompleteDiv.css({"visibility": "hidden", "position": "absolute"});
        $(tagElem).css({"visibility": "visible", "position": "relative"})
      })
      .on("input", this.autoComplete.init(trackMetadata.tags, () => JSON.parse(localStorage.getItem("tags")).tags.map(tag => tag.name),
                tagListUl, function() {
                  classRef.motifApi.addTagToSong(localStorage.getItem("userId"), this.value, trackMetadata.id, trackMetadata.name)
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
      const data = tagListUl.find(".motif-tag-autocomplete-data");
      data.empty();
      const prefix = this.value;
      if (prefix === "") {
        return;
      }
      const matchingTags = tagsToShow.filter(tag => tag.toLowerCase().startsWith(prefix.toLowerCase()));
      matchingTags.forEach(tag => data.append(`<input class='motif-tag-autocomplete-option' type='button' value='${tag}'/>`));
      data.find("input").on("click", function() {
        classRef.motifApi.addTagToSong(localStorage.getItem("userId"), this.value, trackMetadata.id, trackMetadata.name)
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
    while (p.attr("class") !== "motif-taglist") {
      p = p.parent();
    }
    p.find(".motif-taglist-addTag")
      .css({"visibility": "visible", "position": "relative"})
      .before(() => this.buildTagDiv(childElem.value)); 

    p.find(".motif-tag-delete-container").on("hover", function() {
      $(this).find(".motif-tag-delete").hover();
    }).on("click", function() {classRef.handleDelete(this, trackMetadata)});

    p.find(".motif-tag-autocomplete-data").empty();
    p.find(".motif-taglist-autocomplete").css({"visibility": "hidden", "position": "absolute"});
  }

  handleEnter(inputElem, trackMetadata) {
    const existingTags = trackMetadata.tags;
    if (existingTags.map(s => s.toLowerCase()).indexOf(inputElem.value.toLowerCase()) !== -1) {
      return;
    }
    this.motifApi.addTagToSong(localStorage.getItem("userId"), inputElem.value, trackMetadata.id, trackMetadata.name)
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
    while (p.attr("class") !== "motif-taglist-songtag") {
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

  buildTagDiv(tag, isOperator = false) {
    return  `<li class="motif-taglist-songtag">
          <div class="motif-tag motif-tag-song ${isOperator ? "motif-operator" : ""}">
            <span>${tag}</span>
            <div class="motif-tag-delete-container">
              <svg viewBox="0 0 8 8" class="motif-tag-delete"><polygon points="8 1.01818182 6.98181818 0 4 2.98181818 1.01818182 0 0 1.01818182 2.98181818 4 0 6.98181818 1.01818182 8 4 5.01818182 6.98181818 8 8 6.98181818 5.01818182 4"></polygon></svg>
            </div>
          </div>
        </li>`;
  }
}

export default UserInterface;
