class Modifer {
    constructor(modifierFn, condition = (selection) => true) {
        this.modifierFn = modifierFn;
        this.condition = condition;
    }

    modify(selection) {
        this.condition(selection) && this.modifierFn(selection);
    }
}

export default Modifer;