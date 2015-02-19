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
    vhasCoreMethod = aClass::[(if isArray(aCoreMethod) then aCoreMethod[0] else aCoreMethod)]
    $abilities = aClass::$abilities if vName and aClass::$abilities
    vHasAddtionalAbility = vName and $abilities and $abilities[vName]

    if not aClass?
      aClass = AbilityClass
    else if not (vhasCoreMethod or ($abilities and $abilities['$'+vName]))
      if vName
        defineProperty aClass::, '$abilities', $abilities={} unless $abilities
        $abilities['$'+vName] = abilityFn
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
        vFilter = (k)-> filter k, vIncludes, vExcludes
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
              injectMethods(aClass::, vOptions.methods, vOptions) if vOptions.methods instanceof Object
              injectMethods(aClass, vOptions.classMethods, vOptions) if vOptions.classMethods instanceof Object

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
            injectMethods(aClass::, vOptions.methods, vOptions) if vOptions.methods instanceof Object
            injectMethods(aClass, vOptions.classMethods, vOptions) if vOptions.classMethods instanceof Object
      if aOptions?
        injectMethods(aClass::, aOptions.methods, aOptions) if aOptions.methods instanceof Object
        injectMethods(aClass, aOptions.classMethods, aOptions) if aOptions.classMethods instanceof Object
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
