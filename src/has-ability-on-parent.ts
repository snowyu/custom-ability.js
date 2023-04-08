import getPrototypeOf from 'inherits-ex/lib/getPrototypeOf';

export function hasAbilityOnParent(aClass: Function, aName: string) {
  let result, vPrototype;
  result = false;
  if (aClass) {
    vPrototype = aClass.prototype;
  }
  while (vPrototype) {
    if (vPrototype.hasOwnProperty('$abilities') && vPrototype.$abilities.hasOwnProperty(aName)) {
      result = true;
      break;
    }
    vPrototype = getPrototypeOf(vPrototype);
  }
  return result;
};

export default hasAbilityOnParent
