
class AutoComplete {
    constructor() {}

    init(existingData, availableDataGetter, containingElement, selectionCallback) {
        // TODO make this more efficient? 
        return function onInputChange() {
            const dataToShow = availableDataGetter().filter(datum => existingData.indexOf(datum) === -1);
            const data = containingElement.find(".motif-tag-autocomplete-data");
            data.empty();
            const prefix = this.value;
            if (prefix === "") {
                return;
            }
            const matchingData = dataToShow.filter(datum => datum.toLowerCase().startsWith(prefix.toLowerCase()));
            matchingData.forEach(datum => data.append(`<input class='motif-tag-autocomplete-option' type='button' value='${datum}'/>`));
            data.find("input").on("click", selectionCallback);
        }
    }
}

export default AutoComplete;