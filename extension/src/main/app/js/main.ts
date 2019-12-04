import Applicator from './ui_selection/applicator';
import ApplicatorProvider from './ui_selection/applicator-provider';
import UIModListener from './ui_selection/uimod-listener';
import SPOTIFY_ACTIONS from './constants/spotify_actions';
import UserInterface from './ui_framework/user-interface';
class Main {
  // applicators: Applicator[]; 
  applicators: any; 
  ui: any;
  constructor() {
    this.applicators = new ApplicatorProvider().getApplicators();
  }

  sleep = async (ms : number) => new Promise((resolve) => setTimeout(resolve, ms));

  log = (m : any) => {
    console.log('Motif-client:', m);
  }

  run() {
    this.sleep(3000).then((r) => {
      this.initMe();
      var listner = new UIModListener(); 
      listner.listen((pageInfo: any) => {
        this.sleep(3000).then((_) => this.updateUI(pageInfo));
        return true;
      });
      // fire once manually when first attached
      listner.fire();
    });
  }

  updateUI(pageInfo: any) {
    this.ui = this.ui || new UserInterface();
    const trackNameToMetadata = pageInfo.trackNameToMetadata;
    console.log(pageInfo);
    this.ui.init(trackNameToMetadata);
    return;
  }

  initMe() {
    let body: Object = {action: SPOTIFY_ACTIONS.ME, options: {}};
    // @ts-ignore
    chrome.runtime.sendMessage(body, (response: any) => {
      localStorage.setItem("userId", response.id)
    });
  }
}

export default Main;
