import * as React from 'react';

import ConstStrings from "../../conststrings";
import InputListField from "./inputlistfield";
import { InputFieldType } from "./inputfield";
import StateData from '../statedata';

export default class InputStateField extends InputListField {
  public type: InputFieldType = InputFieldType.AUTO_SUGGEST;
  public listItems: Array<any> = [];
  public defaultListItemIndex: number = 0;

  constructor (listItems, validations?) {
    super(validations);
    for (var props in StateData) {
      this.listItems.push(StateData[props]);
    }
  }

  getDefaultValue() {
    return '';
  }
}
