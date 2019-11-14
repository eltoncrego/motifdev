import FILEPATHS from '../constants/filepaths.js';

class logo {
  async init() {
    this.logoSVG = null;
    const logoSVGURL = chrome.extension.getURL(FILEPATHS.MAIN_LOGO_SVG);
    await $.get(logoSVGURL, (data) => {
      this.logoSVG = data;
    }, 'html');
    return this.logoSVG;
  }

  async getLogo() {
    return this.logoSVG ? this.logoSVG : await this.init();
  }
}

export default logo;
