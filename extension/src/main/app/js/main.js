import ApplicatorProvider from './ui_selection/applicator-provider';
import UIModListener from './ui_selection/uimod-listener';

class Main {
  constructor() {
    this.applicators = new ApplicatorProvider().getApplicators();
  }
  sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  log = (m) => {
    console.log('Motif-client:', m);
  }

  run() {
    this.sleep(3000).then((r) => {
      // update once before changes are realized
      this.updateUI();

      // explictly defining lambda instead of using method reference is needed to bind 'this'
      new UIModListener().listen(() => this.sleep(3000).then(_ => this.updateUI()));
    });
  }

  updateUI() {
    this.log("Updating UI")
    this.applicators.forEach((a) => a());
  }
}

export default Main;
