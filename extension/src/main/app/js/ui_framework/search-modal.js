import $ from '../../../../lib/jquery-min';
import HtmlLoader from '../components/html-loader';
import UIExt from './ui-ext';
import QueryValidator from '../ext/query-validator';
import MotifApi from '../apis/motif_api';
import AutoComplete from './autocomplete';
import SPOTIFY_CLASSES from '../constants/spotify_classes';
import FILEPATHS from '../constants/filepaths';
import SPOTIFY_ACTIONS from '../constants/spotify_actions';

class SearchModal {
    constructor() {
        this.uiExt = new UIExt();
        this.queryValidator = new QueryValidator();
        this.motifApi = new MotifApi();
        this.autoComplete = new AutoComplete();
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

            this.initPlaylistCreate();

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
                    container.find(".motif-autocomplete-search-li").before(classRef.uiExt.buildTagDiv(this.value));
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
                    container.find(".motif-autocomplete-search-li").before(classRef.uiExt.buildTagDiv(this.value, true));
                    container.find(".motif-tag-autocomplete-data").empty();
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
                $(".motif-playlist-create-modal").css("display", "flex");
            });
            $(".motif-playlist-create-modal").on("click", function(e) {
                if (e.target.className.indexOf("motif-playlist-create-modal") !== -1) {
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
            $(".motif-search-results").empty();
        }

        searchQueryText.find("span").text(text.join(" "));
    }

    onValidQuery(query) {
        this.motifApi.executeQuery(localStorage.getItem("userId"), query).then(resp => {
            const searchResultsUl = $(".motif-search-results").empty();
            resp.data.forEach(matchingSong => {
                searchResultsUl.append(`<li>${matchingSong.songName} - ${matchingSong.artist}</li>`);
            });
        });
    }

    initPlaylistCreate() {
        const classRef = this;

        // TODO set up onclick for continue / cancel here... make sure it's not a nested on click

        $(".motif-create-playlist-confirm, motif-cancel")
            .on("click", function(e) {
                if (e.target.className.indexOf("motif-create-playlist-confirm") !== -1 || 
                        e.target.className.indexOf("motif-cancel") !== -1) {
                    $(this).css("display", "none");
                }
            });

        $(".motif-confirm").on("click", function(e) {
            classRef.confirmPlaylistCreate();
        });

        $(".motif-create-playlist-btn").on("click", function() {
            $(".motif-search-footer").find(".motif-playlist-create-error").remove();
            var text = [];
            $(".motif-search-query > .motif-taglist-songtag").find("span").each((i, e) => text.push(e.textContent));
            const validityQuery = classRef.queryValidator.validateQuery(text);
            if (!validityQuery.valid) {
                $(".motif-search-footer").append(`<div class='motif-playlist-create-error'>${validityQuery.error}</div>`)
            } else { 
                $(".motif-create-playlist-confirm").css("display", "flex")
            }
        });
    }

    confirmPlaylistCreate() {
        var text = [];
        $(".motif-search-query > .motif-taglist-songtag").find("span").each((i, e) => text.push(e.textContent));

        this.motifApi.executeQuery(localStorage.getItem("userId"), query).then(resp => {
            const songIds = resp.data.map(matchingSong.songId);
            const options = {}
            let body= {action: SPOTIFY_ACTIONS.ADD_PLAYLIST, options: {}};
            // @ts-ignore
            chrome.runtime.sendMessage(body, (response) => {});
        });



    }
}


export default SearchModal;