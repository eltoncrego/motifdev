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
    const logoSelector = new Selector(() => $(SPOTIFY_CLASSES.MAIN_LOGO));
    const logoModifier = new Modifier((selection) => {
      this.ui.handleLogo(selection);
    });
    const logoApplicator = new Applicator(logoSelector, logoModifier);
    this.applicators.push(logoApplicator.build());
  }

  getApplicators() {
    if (!this.applicators) {
      this.init();
    }
    return this.applicators;
  }
}

export default ApplicatorProvider;
