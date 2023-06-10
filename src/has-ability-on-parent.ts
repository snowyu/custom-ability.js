import {getOwnPropValue, getPrototypeOf} from 'inherits-ex';

export function hasAbilityOnParent(aClass: Function, aName: string) {
  let result, vPrototype;
  result = false;
  if (aClass) {
    vPrototype = aClass.prototype;
  }
  while (vPrototype) {
    if (vPrototype.hasOwnProperty('$abilities') && vPrototype.$abilities.hasOwnProperty(aName)) {
      result = getOwnPropValue(vPrototype, 'Class') || vPrototype.constructor;
      break;
    }
    vPrototype = getPrototypeOf(vPrototype);
  }
  return result;
};

export default hasAbilityOnParent
