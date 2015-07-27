getPrototypeOf = require 'inherits-ex/lib/getPrototypeOf'

# has the additional ability on parent?
module.exports = (aClass, aName) ->
  # result = false
  # while !result and aClass and aClass::
  #   if aClass::hasOwnProperty('$abilities') and aClass::$abilities.hasOwnProperty '$'+aName
  #     result = true
  #   aClass = aClass.super_
  # result
  result = false
  if aClass
    vPrototype = aClass::
  while vPrototype
    if vPrototype.hasOwnProperty('$abilities') and vPrototype.$abilities.hasOwnProperty aName
      result = true
      break
    vPrototype = getPrototypeOf vPrototype
  result
