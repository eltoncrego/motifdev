import Applicator from './applicator';
import Selector from './selector';
import Modifier from './modifier';
import $ from '../../../../lib/jquery-min';
import SPOTIFY_CLASSES from '../constants/spotify_classes';
import UserInterface from '../ui_framework/user-interface';

class ApplicatorProvider {
  init() {
    this.applicators = [];
    this.ui = new UserInterface();
    const tracklistSelector = new Selector(() => $(SPOTIFY_CLASSES.TRACK_TEXT_COLUMN).children());
    const logoSelector = new Selector(() => $(SPOTIFY_CLASSES.MAIN_LOGO));
    const logoModifier = new Modifier((selection) => {
      this.ui.handleLogo(selection);
    });
    const songRowModifer = new Modifier((selection) => {
      selection.after("<p id='ours'>hey friend ;)</p>");
    });
    const defaultApplicator = new Applicator(tracklistSelector, songRowModifer);
    const logoApplicator = new Applicator(logoSelector, logoModifier);
    this.applicators.push(defaultApplicator.build(), logoApplicator.build());
  }

  getApplicators() {
    if (!this.applicators) {
      this.init();
    }
    return this.applicators;
  }
}

export default ApplicatorProvider;
