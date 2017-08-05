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

isInjectedOnParent  = require('./injected-on-parent')


injectMethodsFromNonEnum = (aTargetClass, aObject, filter, isStatic)->
  nonEnumNames = getNonEnumNames aObject
  result = []
  nonEnumNames.forEach (k)->
    if k[0] is '$' and isFunction(v = aObject[k])
      k = k.substr(1) # get rid of the first char '$'
      vK = if isStatic then '@'+k else k
      if !filter or filter(vK)
        if isFunction aTargetClass[k]
          injectMethod aTargetClass, k, v
        else if aTargetClass[k]?
          throw new TypeError('the same non-null name is not function:'+k)
        else
          aTargetClass[k] = v
        delete aObject[k]
        result.push vK
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
      aClassPrototype = aClass::
      vhasCoreMethod = if isArray(aCoreMethod) then aCoreMethod[0] else aCoreMethod
      if vhasCoreMethod
        if vhasCoreMethod[0] isnt '@'
          vhasCoreMethod = aClass::hasOwnProperty(vhasCoreMethod)
        else
          vhasCoreMethod = vhasCoreMethod.substr(1)
          vhasCoreMethod = aClass.hasOwnProperty(vhasCoreMethod)
      if vName
        #vHasAddtionalAbility = hasAdditionalAbility aClass, vName
        # how to judge whether injected??
        $abilities = aClass::$abilities
        vInjectedOnParent = isInjectedOnParent aClass, vName
        $abilities = null unless aClass::hasOwnProperty '$abilities'
      # inject the ability:
      if not (vhasCoreMethod or ($abilities and $abilities['$'+vName]))
        # if vName
        #   # flag this ability is already injected on the aClass.
        #   defineProperty aClass::, '$abilities', $abilities={} unless $abilities
        #   $abilities['$'+vName] = abilityFn
        if not aOptions? or not (aOptions.include or aOptions.exclude)
          if vName
            vAddtionalAbilityInjected = injectAdditionalAbility aClass, vName, filterMethods
          vExcludes = injectMethodsFromNonEnum aClass, AbilityClass, null, true
          extendFilter aClass, AbilityClass, (k)-> not (k in vExcludes)
          if vAddtionalAbilityInjected
            aClassPrototype = vAddtionalAbilityInjected::
          if !vInjectedOnParent
            vExcludes = injectMethodsFromNonEnum aClassPrototype, AbilityClass::
            extend aClassPrototype, AbilityClass::, (k)-> not (k in vExcludes)
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
          vFilter = (isStatic)-> (k)-> filter k, vIncludes, vExcludes, isStatic
          vAbilities = injectMethodsFromNonEnum aClass, AbilityClass, vFilter(true), true
          vAbilities = vAbilities.concat injectMethodsFromNonEnum aClass::, AbilityClass::, vFilter()
          vExcludes = vExcludes.concat vAbilities
          vAbilities = undefined
          filterMethods = (methods)->
            if methods instanceof Object
              for k of methods
                delete methods[k] unless vFilter(k)
            return
          # check whether additinal ability is exists.
          if vName
            vAddtionalAbilityInjected = injectAdditionalAbility aClass, vName, filterMethods

          extendFilter aClass, AbilityClass, vFilter(true)
          if vAddtionalAbilityInjected
            aClassPrototype = vAddtionalAbilityInjected::
          if !vInjectedOnParent
            extendFilter aClassPrototype, AbilityClass::, vFilter()
          filterMethods aOptions.methods
          filterMethods aOptions.classMethods
        if aOptions?
          if !vInjectedOnParent and aOptions.methods instanceof Object
            injectMethods(aClassPrototype, aOptions.methods, aOptions)
          if aOptions.classMethods instanceof Object
            injectMethods(aClass, aOptions.classMethods, aOptions)
        if vName #and !vHasAddtionalAbility
          # flag this ability is already injected on the aClass.
          if aClassPrototype != aClass::
            aClassPrototype = aClass:: #restore the class prototype.
          unless aClassPrototype.hasOwnProperty '$abilities'
            $abilities = {}
            defineProperty aClassPrototype, '$abilities', $abilities
          $abilities['$'+vName] = abilityFn
      #END inject the ability
    else
      aClass = AbilityClass
    aClass
  # return true to pass, return false to refuse.
  abilityFn.filter = filter = (k, aIncludes, aExcludes, aIsStatic)->
    k = '@'+k if aIsStatic
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
      if aClass::hasOwnProperty('$abilities') and
          !aClass::$abilities['$'+aName] and aClass::$abilities[aName]
        result.push aClass
      aClass = aClass.super_
    result
  injectAdditionalAbility = (aClass, aName, filterMethods) ->
    while aClass and aClass::
      if aClass::hasOwnProperty('$abilities')
        $abilities = aClass::$abilities
        if !$abilities['$'+aName] and (vAbility = $abilities[aName])
          vOptions = vAbility()
          $abilities['$'+aName] = abilityFn
          result = aClass
          if vOptions?
            if filterMethods
              filterMethods vOptions.methods
              filterMethods vOptions.classMethods
            if vOptions.methods instanceof Object
              injectMethods(aClass::, vOptions.methods, vOptions)
            if vOptions.classMethods instanceof Object
              injectMethods(aClass, vOptions.classMethods, vOptions)
      aClass = aClass.super_
    result
  return abilityFn
