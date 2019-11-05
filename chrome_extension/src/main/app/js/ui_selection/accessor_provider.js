import Accessor from "./accessor";
import Selector from "./selector";
import Modifier from "./modifier";
import $ from '../../../../lib/jquery-min';

class AccessorProvider {
    constructor() {
        this.accessors;
    }

    _init() {
        this.accessors = []
        // Selectors
        var tracklistSelector = new Selector(() => $(".tracklist").children());

        // Modifiers
        var songRowModifer = new Modifier((selection) => selection.after("<p id='ours'>hey friend ;)</p>"));

        // Accessors
        // This applies to album, playlist
        var defaultAccessor = new Accessor(tracklistSelector, songRowModifer);

        this.accessors.push(defaultAccessor);
    }

    getAccessors() {
        if (!this.accessors) {
            this._init()
        }
        return this.accessors;
    }
}

export default AccessorProvider;