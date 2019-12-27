import Applicator from './ui_selection/applicator';
import ApplicatorProvider from './ui_selection/applicator-provider';
import UIModListener from './ui_selection/uimod-listener';
import SPOTIFY_ACTIONS from './constants/spotify_actions';
import UserInterface from './ui_framework/user-interface';
import MotifApi from './apis/motif_api';
import {Tag} from './apis/motif_types';
class Main {
  // applicators: Applicator[]; 
  applicators: any; 
  ui: any;
  motifApi: MotifApi;
  constructor() {
    this.applicators = new ApplicatorProvider().getApplicators();
    this.motifApi = new MotifApi();
  }

  sleep = async (ms : number) => new Promise((resolve) => setTimeout(resolve, ms));

  log = (m : any) => {
    console.log('Motif-client:', m);
  }

  run() {
    this.sleep(3000).then((r) => {
      this.initMe().then(_ => this.initTags()).then(_ => console.log(localStorage.getItem("tags")));
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
    // TODO make this pattern ^ into composition and make each component address a certain page... can trigger based on pageInfo.pageType
    const trackNameToMetadata = pageInfo.trackNameToMetadata;
    this.ui.init(trackNameToMetadata);
    return;
  }

  initMe(): Promise<any> {
    let body: Object = {action: SPOTIFY_ACTIONS.ME, options: {}};
    return new Promise((resolve, reject) => {
        // @ts-ignore
        chrome.runtime.sendMessage(body, (response: any) => {
          localStorage.setItem("userId", response.id);
          resolve("SUCCESS");
        });
    });
  }

  initTags(): Promise<any> { 
    return this.motifApi.getTags(localStorage.getItem("userId")).then((tags: Tag[]) => {
      localStorage.setItem("tags", JSON.stringify({tags}));
    });
  }
}

export default Main;
