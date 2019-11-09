import $ from '../../../lib/jquery-min';
import UserInterface from './ui-framework';
import SPOTIFY_ACTIONS from './constants/spotify_actions';

class Motif {
  run() {
    console.log("Motif: Extension is running.")
    var ui = new UserInterface();
    ui.updateLogo();
    return true;
  }
}

export default Motif;
