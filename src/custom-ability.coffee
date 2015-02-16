'use strict'

isArray         = require('util-ex/lib/is/type/array')
isFunction      = require('util-ex/lib/is/type/function')
isBoolean       = require('util-ex/lib/is/type/boolean')
extend          = require('util-ex/lib/_extend')
extendFilter    = require('util-ex/lib/extend')
injectMethods   = require('util-ex/lib/injectMethods')
defineProperty  = require('util-ex/lib/defineProperty')

module.exports = (abilityClass, aCoreMethod, isGetClassFunc)->
  if isBoolean aCoreMethod
    isGetClassFunc = aCoreMethod
    aCoreMethod = undefined
  abilityFn = (aClass, aOptions)->
    AbilityClass = abilityClass
    AbilityClass = abilityClass(aClass, aOptions) if isGetClassFunc is true
    throw new TypeError('no abilityClass') unless AbilityClass
    vName = AbilityClass.name # '$'vName means already injected.
    vCoreMethod = if isArray(aCoreMethod) then aCoreMethod[0] else aCoreMethod

    if not aClass?
      aClass = AbilityClass
    else if not ((vCoreMethod and aClass::[vCoreMethod]) or
    (vName and aClass::$abilities and aClass::$abilities['$'+vName]))
      # check whether additinal ability is exists.
      if not (aOptions and aOptions.inited) and vName and
        aClass::$abilities and (vAbility = aClass::$abilities[vName.toLowerCase()])
          if aOptions
            aOptions.inited = true
          else
            aOptions = inited: true
          return vAbility aClass, aOptions
      if vName
        defineProperty aClass::, '$abilities', {} unless aClass::$abilities
        aClass::$abilities['$'+vName] = abilityFn
      if not aOptions? or not (aOptions.include or aOptions.exclude)
        extend aClass, AbilityClass
        extend aClass::, AbilityClass::
      else
        vIncludes = aOptions.include
        if vIncludes
          vIncludes = [vIncludes] if not isArray vIncludes
        else
          vIncludes = []
        if aCoreMethod
          if isArray aCoreMethod
            vIncludes = vIncludes.concat aCoreMethod
          else
            vIncludes.push aCoreMethod
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
        filterMethods = (methods)->
          if methods instanceof Object
            for k of methods
              delete methods[k] unless filter(k)
          return

        extendFilter aClass, AbilityClass, filter
        extendFilter aClass::, AbilityClass::, filter
        filterMethods aOptions.methods
        filterMethods aOptions.classMethods
      if aOptions?
        injectMethods(aClass::, aOptions.methods) if aOptions.methods instanceof Object
        injectMethods(aClass, aOptions.classMethods) if aOptions.classMethods instanceof Object
    aClass
  return abilityFn
