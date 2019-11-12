import ApplicatorProvider from './ui_selection/applicatorProvider';

class Main {
  sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  log = (m) => {
    console.log("Motif-client:", m);
  }

  run() {
    this.sleep(3000).then((r) => {
      this.updateUI();
    });
    return;
  }

  async updateUI () {
    const accessors = new ApplicatorProvider().getApplicators();
    accessors.forEach((a) => a());
  }
}

export default Main;