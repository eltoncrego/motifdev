type conditionFn = (selection: any) => boolean
type modifierFn = (selection: any, pageInfo: object) => void

class Modifer {
    modifier: modifierFn;
    condition: conditionFn;
  // eslint-disable-next-line no-unused-vars
  constructor(modifier: modifierFn, condition: conditionFn = (selection) => true) {
    this.modifier = modifier;
    this.condition = condition;
  }

  modify(selection: any, pageInfo: any): void {
    this.condition(selection) && this.modifier(selection, pageInfo);
  }
}

export default Modifer;
