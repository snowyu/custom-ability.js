hasAbilityOnParent = require './has-ability-on-parent'

module.exports = (aClass, aName) -> hasAbilityOnParent aClass, '$'+aName
