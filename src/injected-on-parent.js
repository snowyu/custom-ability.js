const hasAbilityOnParent = require('./has-ability-on-parent');

module.exports = function injectedOnParent(aClass, aName) {
  return hasAbilityOnParent(aClass, '$' + aName);
};

