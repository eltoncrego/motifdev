import Applicator from './applicator';
import Modifier from './modifier';
import Selector from './selector';

class ApplicatorBuilder {
  modifier: Modifier;
  selector: Selector;
  constructor(selector: any, modifier: any) {
    this.selector = selector;
    this.modifier = modifier;
  }

  build(): Applicator {
    return {
      applyWithInfo: (pageInfo: any) => { 
        this.modifier.modify(this.selector.select(), pageInfo);
      }
    }
  }
}

export default ApplicatorBuilder;
