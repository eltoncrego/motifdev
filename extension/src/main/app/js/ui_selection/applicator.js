class Applicator {
  constructor(selector, modifier) {
    this.selector = selector;
    this.modifier = modifier;
  }

  build() {
    return () => this.modifier.modify(this.selector.select());
  }
}

export default Applicator;
