import ApplicatorBuilder from './applicator-builder';
import Applicator from './applicator';
import Selector from './selector';
import Modifier from './modifier';
import $ from '../../../../lib/jquery-min';
import SPOTIFY_CLASSES from '../constants/spotify_classes';
import UserInterface from '../ui_framework/user-interface';

class ApplicatorProvider {
  applicators: Applicator[] = [];
  ui: any;
  init() {
    this.ui = new UserInterface();
    const logoSelector = new Selector(() => $(SPOTIFY_CLASSES.MAIN_LOGO));
    const logoModifier = new Modifier((selection, pageInfo) => this.ui.handleLogo(selection, pageInfo));
    const logoApplicator = new ApplicatorBuilder(logoSelector, logoModifier);
    this.applicators.push(logoApplicator.build());

    const trackSelector = new Selector(() => $(SPOTIFY_CLASSES.TRACK))
    const trackModifier = new Modifier((selection, pageInfo) => { 
      selection.after("<p>sup b</p>")
      console.log(pageInfo);
    });
    const trackApplicator = new ApplicatorBuilder(trackSelector, trackModifier);
    this.applicators.push(trackApplicator.build());
  }

  getApplicators(): Applicator[] {
    if (this.applicators.length === 0) {
      this.init();
    }
    return this.applicators;
  }
}

export default ApplicatorProvider;
