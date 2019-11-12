class Modifer {
  // eslint-disable-next-line no-unused-vars
  constructor(modifierFn, condition = (selection) => true) {
    this.modifierFn = modifierFn;
    this.condition = condition;
  }

  modify(selection) {
    return this.condition(selection) && this.modifierFn(selection);
  }
}

export default Modifer;
