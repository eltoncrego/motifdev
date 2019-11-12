import FILEPATHS from './constants/filepaths.js';

class tagList {
  async init() {
    this.tagList = null;
    const tagListURL = chrome.extension.getURL(FILEPATHS.TAG_LIST_HTML);
    await $.get(tagListURL, (data) => {
      this.tagList = data;
    }, 'html');
    return this.tagList;
  }

  getTagList() {
    return this.tagList ? this.tagList : this.init();
  }
}

export default tagList;