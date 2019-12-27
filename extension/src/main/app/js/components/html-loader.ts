import $ from '../../../../lib/jquery-min';

class HtmlLoader {
  filepath: string
  html: string
  constructor(filepath: string)  {
    this.filepath = filepath;
    this.html = "";
  }

  async init() {
    // @ts-ignore
    const tagListURL = chrome.extension.getURL(this.filepath);
    // @ts-ignore
    await $.get(tagListURL, (data) => {
      this.html = data;
    }, 'text');
    return this.html;
  }

  async getHtml() {
    return this.html === "" ? this.init() : this.html;
  }
}

export default HtmlLoader;
