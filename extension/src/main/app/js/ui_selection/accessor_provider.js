import Accessor from './accessor';
import Selector from './selector';
import Modifier from './modifier';
import $ from '../../../../lib/jquery-min';

class AccessorProvider {
  init() {
    this.accessors = [];
    // Selectors
    const tracklistSelector = new Selector(() => $('.tracklist').children());

    // Modifiers
    const songRowModifer = new Modifier((selection) => selection.after("<p id='ours'>hey friend ;)</p>"));

    // Accessors
    // This applies to album, playlist
    const defaultAccessor = new Accessor(tracklistSelector, songRowModifer);

    this.accessors.push(defaultAccessor);
  }

  getAccessors() {
    if (!this.accessors) {
      this.init();
    }
    return this.accessors;
  }
}

export default AccessorProvider;
