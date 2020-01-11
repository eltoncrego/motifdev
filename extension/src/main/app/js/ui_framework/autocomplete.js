import MOTIF_CLASSES from "../constants/motif_classes";
import { formatAsHTMLClass } from "../ext/helpers";

class AutoComplete {
    constructor() {}

    init(existingData, availableDataGetter, containingElement, selectionCallback) {
        // TODO make this more efficient? 
        return function onInputChange() {
            const dataToShow = availableDataGetter().filter(datum => existingData.indexOf(datum) === -1);
            const data = containingElement.find(MOTIF_CLASSES.AUTOCOMPLETE_DATA);
            data.empty();
            const prefix = this.value;
            if (prefix === "") {
                return;
            }
            const matchingData = dataToShow.filter(datum => datum.toLowerCase().startsWith(prefix.toLowerCase()));
            matchingData.forEach(datum => data.append(`<input class='${formatAsHTMLClass(MOTIF_CLASSES.AUTOCOMPLETE_OPTION)}' type='button' value='${datum}'/>`));
            data.find("input").on("click", selectionCallback);
        }
    }
}

export default AutoComplete;