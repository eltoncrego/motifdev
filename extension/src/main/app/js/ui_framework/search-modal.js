import $ from '../../../../lib/jquery-min';
import HtmlLoader from '../components/html-loader';
import UIExt from './ui-ext';
import QueryValidator from '../ext/query-validator';
import MotifApi from '../apis/motif_api';
import AutoComplete from './autocomplete';
import SPOTIFY_CLASSES from '../constants/spotify_classes';
import FILEPATHS from '../constants/filepaths';
import SPOTIFY_ACTIONS from '../constants/spotify_actions';
import MOTIF_CLASSES from '../constants/motif_classes';
import { formatAsHTMLClass } from '../ext/helpers';

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
            $(MOTIF_CLASSES.SEARCH_TEXT).find(MOTIF_CLASSES.ERROR_ICON_CONTAINER).on("mouseenter", function() {
                $(this).find(MOTIF_CLASSES.ERROR_TOOLTIP).css("display", "block");
            }).on("mouseleave", function() {
                $(this).find(MOTIF_CLASSES.ERROR_TOOLTIP).css("display", "none");
            });

            this.initPlaylistCreate();

            const container = $(MOTIF_CLASSES.SEARCH_CONTAINER);
            const chosenTags = [];

            container.find(MOTIF_CLASSES.AUTOCOMPLETE_INPUT).blur(function(e) {
                this.value = ''; 
                // ignore blur and let option on click handle this
                if (e.relatedTarget && e.relatedTarget.getAttribute("class") === formatAsHTMLClass(MOTIF_CLASSES.AUTOCOMPLETE_OPTION)) { 
                    return;
                }
                container.find(MOTIF_CLASSES.AUTOCOMPLETE_DATA).empty();
            }).on("input", this.autoComplete.init(chosenTags, () => JSON.parse(localStorage.getItem("tags")).tags.map(tag => tag.name), container, 
                function() {
                    container.find(MOTIF_CLASSES.SEARCH_LI).before(classRef.uiExt.buildTagDiv(this.value));
                    chosenTags.push(this.value)
                    container.find(MOTIF_CLASSES.AUTOCOMPLETE_DATA).empty();
                    container.find(MOTIF_CLASSES.DELETE_CONTAINER).on("hover", function() {
                        $(this).find(MOTIF_CLASSES.DELETE).hover();
                    }).on("click", function() {
                        var p = $(this);
                        while (p.attr("class") !== formatAsHTMLClass(MOTIF_CLASSES.SONGTAG)) {
                            p = p.parent();
                        }
                        const tag = p.find("span").html();
                        chosenTags.splice(chosenTags.indexOf(tag), 1);
                        p.remove()
                        classRef.updateModalSearchText();
                    });

                    classRef.updateModalSearchText();
                })).on("keypress", function(e) {
                    if(e.which !== 13) {
                        return;
                    }  
                    const operators = ["and", "or", "(", ")"];
                    
                    if (operators.indexOf(this.value) !== -1) {
                        container.find(MOTIF_CLASSES.SEARCH_LI).before(classRef.uiExt.buildTagDiv(this.value, true));
                        container.find(MOTIF_CLASSES.AUTOCOMPLETE_DATA).empty();
                        container.find(MOTIF_CLASSES.DELETE_CONTAINER).on("hover", function() {
                        $(this).find(MOTIF_CLASSES.DELETE).hover();
                        }).on("click", function() {
                            var p = $(this);
                            while (p.attr("class") !== formatAsHTMLClass(MOTIF_CLASSES.SONGTAG)) {
                                p = p.parent();
                            }
                            p.remove()
                            classRef.updateModalSearchText();
                        });
                        container.find(MOTIF_CLASSES.AUTOCOMPLETE_INPUT)[0].value = "";
                        classRef.updateModalSearchText();
                    }
                }); 
        });

        new HtmlLoader(FILEPATHS.MENU_LOGO).getHtml().then((response) => {
            $(SPOTIFY_CLASSES.MAIN_HEADER).append(response);
            $(MOTIF_CLASSES.MENU_BUTTON).on("click", function() {
                $(MOTIF_CLASSES.PLAYLIST_CREATE_MODAL).css("display", "flex");
                setTimeout(() => {
                    $(MOTIF_CLASSES.SEARCH_WRAPPER).css("transform", "translateX(0vw)");
                }, 100);
            });
            $(MOTIF_CLASSES.PLAYLIST_CREATE_MODAL).on("click", function(e) {
                if (e.target.className.indexOf(formatAsHTMLClass(MOTIF_CLASSES.PLAYLIST_CREATE_MODAL)) !== -1) {
                    $(MOTIF_CLASSES.SEARCH_WRAPPER).css("transform", "translateX(50vw)");
                    setTimeout(() => {
                        $(this).css("display", "none");
                    }, 200);
                }
            });
        });
    }

    updateModalSearchText() {
        var text = [];
        $(MOTIF_CLASSES.SEARCH + " > " + MOTIF_CLASSES.SONGTAG).find("span").each((i, e) => text.push(e.textContent));
        const searchQueryText = $(MOTIF_CLASSES.SEARCH_TEXT)
        if (text.length !== 0) {
            const validityQuery = this.queryValidator.validateQuery(text);
            if (!validityQuery.valid) {
                searchQueryText.find(MOTIF_CLASSES.SUCCESS_ICON).css("display", "none");
                searchQueryText.find(MOTIF_CLASSES.ERROR_ICON).css("display", "block");
                searchQueryText.find(MOTIF_CLASSES.ERROR_TOOLTIP + " > div").text(validityQuery.error);
            } else {
                searchQueryText.find(MOTIF_CLASSES.SUCCESS_ICON).css("display", "block");
                searchQueryText.find(MOTIF_CLASSES.ERROR_ICON).css("display", "none");
                this.onValidQuery(text);
            }
        } else {
            searchQueryText.find(MOTIF_CLASSES.SUCCESS_ICON).css("display", "none");
            searchQueryText.find(MOTIF_CLASSES.ERROR_ICON).css("display", "none");
            this.setSearchResultLi();
        }

        searchQueryText.find("span").text(text.join(" "));
    }

    setSearchResultLi(error) {
        const searchResultsUl = $(MOTIF_CLASSES.SEARCH_RESULTS).empty();
        if (!error) {
            searchResultsUl.append(`<li>You do not have any tags currently selected. Please use the search bar above to create a playlist.</li>`)
        } else {
            searchResultsUl.find(MOTIF_CLASSES.PLAYLIST_CREATE_ERROR).remove();
            searchResultsUl.append(`<li class='${formatAsHTMLClass(MOTIF_CLASSES.PLAYLIST_CREATE_ERROR)}'>${error}</li>`)
        }
    }

    onValidQuery(query) {
        this.motifApi.executeQuery(localStorage.getItem("userId"), query).then(resp => {
            const searchResultsUl = $(MOTIF_CLASSES.SEARCH_RESULTS).empty();
            resp.data.forEach(matchingSong => {
                searchResultsUl.append(`<li>${matchingSong.songName} - ${matchingSong.artist}</li>`);
            });
        });
    }

    initPlaylistCreate() {
        const classRef = this;

        $(MOTIF_CLASSES.PLAYLIST_CREATE_CONFIRM + ", " + formatAsHTMLClass(MOTIF_CLASSES.CANCEL) + ", " + formatAsHTMLClass(MOTIF_CLASSES.CONTINUE))
            .on("click", function(e) {
                if (e.target.className.indexOf(formatAsHTMLClass(MOTIF_CLASSES.PLAYLIST_CREATE_CONFIRM)) !== -1 || 
                        e.target.className.indexOf(formatAsHTMLClass(MOTIF_CLASSES.CANCEL)) !== -1 ||
                        e.target.className.indexOf(formatAsHTMLClass(MOTIF_CLASSES.CONTINUE)) !== -1) {
                    $(this).css("display", "none");
                }
            });

        $(MOTIF_CLASSES.CONTINUE).on("click", function() {
            classRef.confirmPlaylistCreate();
        });

        $(MOTIF_CLASSES.PLAYLIST_CREATE_BTN).on("click", function() {
            $(MOTIF_CLASSES.SEARCH_RESULTS_CONTAINER + " > " + MOTIF_CLASSES.SEARCH_RESULTS).find(MOTIF_CLASSES.PLAYLIST_CREATE_ERROR).remove();
            var text = [];
            $(MOTIF_CLASSES.SEARCH + " > " + MOTIF_CLASSES.SONGTAG).find("span").each((i, e) => text.push(e.textContent));
            const validityQuery = classRef.queryValidator.validateQuery(text);
            if (!validityQuery.valid) {
                classRef.setSearchResultLi(validityQuery.error);
            } else { 
                $(MOTIF_CLASSES.PLAYLIST_CREATE_CONFIRM).css("display", "flex")
            }
        });
    }

    confirmPlaylistCreate() {
        var text = [];
        $(MOTIF_CLASSES.SEARCH + " > " + MOTIF_CLASSES.SONGTAG).find("span").each((i, e) => text.push(e.textContent));

        this.motifApi.executeQuery(localStorage.getItem("userId"), text).then(resp => {
            const songIds = resp.data.map(songs => songs.songId);
            const options = {
                userId: localStorage.getItem("userId"),
                songIds
            }
            let body= {action: SPOTIFY_ACTIONS.ADD_PLAYLIST, options: options};
            // @ts-ignore
            chrome.runtime.sendMessage(body, (response) => {console.log(response)});
        });
    }
}


export default SearchModal;