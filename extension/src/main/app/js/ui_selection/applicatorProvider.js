import Applicator from './applicator';
import Selector from './selector';
import Modifier from './modifier';
import $ from '../../../../lib/jquery-min';

class ApplicatorProvider {
  init() {
    this.accessors = [];
    const tracklistSelector = new Selector(() => $('.tracklist-col.name').children());
    const songRowModifer = new Modifier((selection) => {
      selection.after("<p id='ours'>hey friend ;)</p>")}
    );
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