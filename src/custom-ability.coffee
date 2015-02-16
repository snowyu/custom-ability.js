"use strict"

isArray         = require("util-ex/lib/is/type/array")
extend          = require("util-ex/lib/_extend")
extendFilter    = require("util-ex/lib/extend")
injectMethods   = require("util-ex/lib/injectMethods")

module.exports = (abilityClass, aCoreMethod, isGetClassFunc)->
  return (aClass, aOptions)->
    AbilityClass = abilityClass
    AbilityClass = abilityClass(aClass, aOptions) if isGetClassFunc is true
    if not aClass?
      aClass = AbilityClass
    else if not (aClass::[aCoreMethod])
      if not aOptions? or not (aOptions.include or aOptions.exclude)
        extend aClass, AbilityClass
        extend aClass::, AbilityClass::
      else
        vIncludes = aOptions.include
        if vIncludes
          vIncludes = [vIncludes] if not isArray vIncludes
        else
          vIncludes = []
        vIncludes.push aCoreMethod if aOptions.includeAlways isnt false
        vExcludes = aOptions.exclude
        if vExcludes
          vExcludes = [vExcludes] if not isArray vExcludes
        else
          vExcludes = []
        filter = (k)->
          result = vIncludes.length
          if result
            result = k in vIncludes
            result = not (k in vExcludes) if not result and vExcludes.length
          else if vExcludes.length
            result = not (k in vExcludes)
          else
            result = true
          result
        extendFilter aClass, AbilityClass, filter
        extendFilter aClass::, AbilityClass::, filter
      if aOptions?
        injectMethods(aClass::, aOptions.methods) if aOptions.methods instanceof Object
        injectMethods(aClass, aOptions.classMethods) if aOptions.classMethods instanceof Object
    aClass
