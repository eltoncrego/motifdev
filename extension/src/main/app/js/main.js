import ApplicatorProvider from './ui_selection/applicator-provider';
import UIModListener from './ui_selection/uimod-listener';
import UserInterface from './ui_framework/user-interface';

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
      this.updateUI();
      new UIModListener().listen(() => {
        this.sleep(3000).then((_) => this.updateUI());
        return true;
      });
    });
  }

  updateUI() {
    this.ui = this.ui || new UserInterface();
    this.log('Updating UI');
    this.ui.init();
  }
}

export default Main;