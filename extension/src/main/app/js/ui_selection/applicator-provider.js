import Applicator from './applicator';
import Selector from './selector';
import Modifier from './modifier';
import $ from '../../../../lib/jquery-min';
import SPOTIFY_CLASSES from '../constants/spotify_classes';

class ApplicatorProvider {
  init() {
    this.accessors = [];
    const tracklistSelector = new Selector(() => $(SPOTIFY_CLASSES.TRACK_TEXT_COLUMN).children());
    const songRowModifer = new Modifier((selection) => {
      selection.after("<p id='ours'>hey friend ;)</p>");
    });
    const defaultAccessor = new Applicator(tracklistSelector, songRowModifer);
    this.accessors.push(defaultAccessor.build());
  }

  getApplicators() {
    if (!this.accessors) {
      this.init();
    }
    return this.accessors;
  }
}

export default ApplicatorProvider;
