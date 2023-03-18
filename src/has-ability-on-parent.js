const getPrototypeOf = require('inherits-ex/lib/getPrototypeOf');

module.exports = function hasAbilityOnParent(aClass, aName) {
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

