import $ from '../../../../lib/jquery-min';

class UIModListener {
  constructor() {
    this.currentHref = document.location.href;
  }

  listen(update) {
    const config = { childList: true, subtree: true };
    this.observer = new MutationObserver((mutations) => mutations.forEach(() => {
      if (document.location.href != this.currentHref) {
        this.currentHref = document.location.href;
        update();
      }
    }));
    this.observer.observe($("#main")[0], config)
  }

  disconnect() {
    this.observer.disconnect();
  }
}

export default UIModListener;
