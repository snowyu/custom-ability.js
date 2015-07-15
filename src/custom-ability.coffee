'use strict'

isArray         = require('util-ex/lib/is/type/array')
isFunction      = require('util-ex/lib/is/type/function')
isBoolean       = require('util-ex/lib/is/type/boolean')
extend          = require('util-ex/lib/_extend')
extendFilter    = require('util-ex/lib/extend')
injectMethods   = require('util-ex/lib/injectMethods')
injectMethod    = require('util-ex/lib/injectMethod')
defineProperty  = require('util-ex/lib/defineProperty')
getNonEnumNames = require('util-ex/lib/get-non-enumerable-names')


injectMethodsFromNonEnum = (aTargetClass, aObject, filter)->
  nonEnumNames = getNonEnumNames aObject
  result = []
  nonEnumNames.forEach (k)->
    if k[0] is '$' and isFunction(v = aObject[k])
      k = k.substr(1) # get rid of the first char '$'
      if !filter or filter(k)
        if isFunction aTargetClass[k]
          injectMethod aTargetClass, k, v
        else if aTargetClass[k]?
          throw new TypeError('the same non-null name is not function:'+k)
        else
          aTargetClass[k] = v
        delete aObject[k]
        result.push k
    return
  result

module.exports = (abilityClass, aCoreMethod, isGetClassFunc)->
  if isBoolean aCoreMethod
    isGetClassFunc = aCoreMethod
    aCoreMethod = undefined
  abilityFn = (aClass, aOptions)->
    AbilityClass = abilityClass
    AbilityClass = abilityClass(aClass, aOptions) if isGetClassFunc is true
    throw new TypeError('no abilityClass') unless AbilityClass
    vName = AbilityClass.name # '$'vName means already injected.
    if aClass?
      vhasCoreMethod = aClass::[(if isArray(aCoreMethod) then aCoreMethod[0] else aCoreMethod)]
      $abilities = aClass::$abilities if vName and aClass::$abilities
      vHasAddtionalAbility = vName and $abilities and $abilities[vName]
      # inject the ability:
      if not (vhasCoreMethod or ($abilities and $abilities['$'+vName]))
        if vName
          # flag this ability is already injected on the aClass.
          defineProperty aClass::, '$abilities', $abilities={} unless $abilities
          $abilities['$'+vName] = abilityFn
        if not aOptions? or not (aOptions.include or aOptions.exclude)
          vExcludes = injectMethodsFromNonEnum aClass, AbilityClass
          extendFilter aClass, AbilityClass, (k)-> not (k in vExcludes)
          vExcludes = injectMethodsFromNonEnum aClass::, AbilityClass::
          extend aClass::, AbilityClass::, (k)-> not (k in vExcludes)
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
          vFilter = (k)-> filter k, vIncludes, vExcludes
          vAbilities = injectMethodsFromNonEnum aClass, AbilityClass, vFilter
          vAbilities = vAbilities.concat injectMethodsFromNonEnum aClass::, AbilityClass::, vFilter
          vExcludes = vExcludes.concat vAbilities
          vAbilities = undefined
          filterMethods = (methods)->
            if methods instanceof Object
              for k of methods
                delete methods[k] unless vFilter(k)
            return
          # check whether additinal ability is exists.
          if vHasAddtionalAbility
            vAbilities = getAdditionalAbility aClass, vName
            i = vAbilities.length
            while --i >= 0
              vOptions = vAbilities[i]()
              if vOptions?
                filterMethods vOptions.methods
                filterMethods vOptions.classMethods
                if vOptions.methods instanceof Object
                  injectMethods(aClass::, vOptions.methods, vOptions)
                if vOptions.classMethods instanceof Object
                  injectMethods(aClass, vOptions.classMethods, vOptions)

          extendFilter aClass, AbilityClass, vFilter
          extendFilter aClass::, AbilityClass::, vFilter
          filterMethods aOptions.methods
          filterMethods aOptions.classMethods
        # check whether additinal ability is exists.
        if vHasAddtionalAbility and not vAbilities
          vAbilities = getAdditionalAbility aClass, vName
          i = vAbilities.length
          while --i >= 0
            vOptions = vAbilities[i]()
            if vOptions?
              if vOptions.methods instanceof Object
                injectMethods(aClass::, vOptions.methods, vOptions)
              if vOptions.classMethods instanceof Object
                injectMethods(aClass, vOptions.classMethods, vOptions)
        if aOptions?
          if aOptions.methods instanceof Object
            injectMethods(aClass::, aOptions.methods, aOptions)
          if aOptions.classMethods instanceof Object
            injectMethods(aClass, aOptions.classMethods, aOptions)
      #END inject the ability
    else
      aClass = AbilityClass
    aClass
  # return true to pass, return false to refuse.
  abilityFn.filter = filter = (k, aIncludes, aExcludes)->
    result = aIncludes.length
    if result
      result = k in aIncludes
      result = not (k in aExcludes) if not result and aExcludes.length
    else if aExcludes.length
      result = not (k in aExcludes)
    else
      result = true
    result
  getAdditionalAbility = (aClass, aName) ->
    result = []
    while aClass and aClass::
      if aClass::hasOwnProperty '$abilities'
        result.push vAbility if vAbility = aClass::$abilities[aName]
      aClass = aClass.super_
    result
  return abilityFn
