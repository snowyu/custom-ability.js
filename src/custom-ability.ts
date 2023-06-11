import isArray from 'util-ex/lib/is/type/array';
import isFunction from 'util-ex/lib/is/type/function';
import extendFilter from 'util-ex/lib/extend';
import injectMethods from 'util-ex/lib/injectMethods';
import injectMethod from 'util-ex/lib/injectMethod';
import defineProperty from 'util-ex/lib/defineProperty';
import {getNonEnumerableNames as getNonEnumNames} from 'util-ex/lib/get-non-enumerable-names';
import { getParentClass, isEmptyFunction } from 'inherits-ex';

import isInjectedOnParent from './injected-on-parent';

const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
const skipStaticNames = ['name', 'arguments', 'prototype', 'super_', '__super__', '__proto__']
const skipProtoNames = ['constructor', '__proto__']

export const abilitiesSym = '$abilities'
export const abilitiesOptSym = '$abilitiesOpt'

export const AdditionalInjectionMode = { inherited: 0, direct: 1}

/**
 * Inject non-enumerable members of the aObject into aTargetClass
 *
 * @internal
 * @param aTargetClass the target class
 * @param aObject the non-enumerable members of the object will be injected into aTargetClass
 * @param filter  It'll be injected only when filter callback function return true, if exists
 * @param isStatic Whether is static members
 * @returns already injected members name list
 */
function injectMembersFromNonEnum(aTargetClass, aObject, filter?: (name:string)=>boolean, isStatic?: boolean) {
  const nonEnumNames = getNonEnumNames(aObject);
  const result = [];
  nonEnumNames.forEach(function(name: string) {
    const vSkipNames = isStatic ? skipStaticNames : skipProtoNames
    if (vSkipNames.includes(name)) {return}

    const desc = getOwnPropertyDescriptor(aObject, name)
    const v = desc.value
    const isFn = isFunction(v)
    const is$ = name[0] === '$';
    // get rid of the first char '$'
    if (is$) {
      name = name.substring(1);
    }
    const vName = isStatic ? '@' + name : name;
    if (filter && !filter(vName)) {return}
    if (desc.get === undefined && desc.set === undefined && v === undefined) {return}

    if (!desc.get && isFn) {
      const vTargetFn = aTargetClass[name]
      if (isFunction(vTargetFn)) {
        if (!isEmptyFunction(vTargetFn)) {
          if (!isEmptyFunction(v)) {
            injectMethod(aTargetClass, name, v);
            result.push(vName);
          }
          return;
        }
      } else if (vTargetFn != null) {
        throw new TypeError('the same non-null name is not function:' + name);
      } else {
        if (is$ && aObject[name]) {
          desc.value = aObject[name];
        }
      }
    }
    defineProperty(aTargetClass, name, undefined, desc)
    result.push(name);
});
  return result;
};

/**
 * The Ability Options
 */
export interface AbilityOptions {
  /**
   * An optional id for AdditionalAbility option
   */
  id?: string;
  /**
   * An optional list of method names to include.
   */
  include?: string|string[]
  /**
   * An optional list of method names to exclude.
   */
  exclude?: string|string[]
  /**
   * An optional object mapping method names to functions to be added to the target class.
   */
  methods?: Record<string, Function>
  /**
   * An optional object mapping method names to static functions to be added to the target class.
   */
  classMethods?: Record<string, Function>
}

export interface AdditionalAbility {
  id?: string; // the AdditionalAbilityOptions ID
  mode?: number;    // the injection mode
  getOpts: (options?: AbilityOptions) => AbilityOptions;
}

export interface AdditionalAbilities {
  // the key is the target ability name
  [key: string]: AdditionalAbility|Array<AdditionalAbility>
}

export interface AbilityInjectorOptions {
  // the optional depends abilities which can work together
  depends?: AdditionalAbilities;
}

/**
 * A function that adds(injects) the ability of a specified ability class to a target class.
 *
 * @param {Function} targetClass - The target class to which the ability will be added.
 * @param {AbilityOptions} [options] - An optional ability configuration object.
 * @returns {Function} - An injected target class that takes a class and adds the ability to it using the specified
 *                       options.
 */
export type AbilityFn = (targetClass: Function, options?: AbilityOptions) => Function;

/**
 * Creates a function that adds(injects) the ability to the target class based on the ability class.
 *
 * @param abilityClass The ability class to inject into the target class.
 * @param isGetClassFunc An optional parameter that indicates whether abilityClass should be invoked
 *                    with aClass and aOptions to get the actual ability class. defaults to false
 * @returns Another function that accepts the target class and options to include or exclude specific
 *                    properties and methods.
 *                    The returned function injects the abilities into the target class and returns the modified class.
 */
export function createAbilityInjector(abilityClass: Function, isGetClassFunc?: boolean, injectorOpts?: AbilityInjectorOptions): AbilityFn;
export function createAbilityInjector(abilityClass: Function, aCoreMethod?: string|string[], isGetClassFunc?: boolean, injectorOpts?: AbilityInjectorOptions): AbilityFn;
export function createAbilityInjector(abilityClass: Function, aCoreMethod?: string|string[], injectorOpts?: AbilityInjectorOptions): AbilityFn;
export function createAbilityInjector(abilityClass: Function, injectorOpts?: AbilityInjectorOptions): AbilityFn;
/**
 * Creates a function that adds(injects) the ability to the target class based on the ability class.
 *
 * @param abilityClass The ability class to inject into the target class.
 * @param aCoreMethod An optional parameter that specifies the core methods that the ability class must have.
 *                    This is a minimum set of methods required for the ability to be considered injected.
 *                    Core methods are defined in the ability class, and can be static or instance methods.
 *                    If a core method is a static method, it must be prefixed with the "@" symbol.
 * @param isGetClassFunc An optional parameter that indicates whether abilityClass should be invoked
 *                    with aClass and aOptions to get the actual ability class. defaults to false
 * @returns Another function that accepts the target class and options to include or exclude specific
 *                    properties and methods.
 *                    The returned function injects the abilities into the target class and returns the modified class.
 */
export function createAbilityInjector(abilityClass: Function, aCoreMethod?: string|string[]|boolean|AbilityInjectorOptions, isGetClassFunc?: boolean|AbilityInjectorOptions, injectorOpts?: AbilityInjectorOptions): AbilityFn {
  if (typeof aCoreMethod === 'boolean') {
    injectorOpts = isGetClassFunc as AbilityInjectorOptions;
    isGetClassFunc = aCoreMethod;
    aCoreMethod = undefined;
  } else if (typeof aCoreMethod === 'object') {
    injectorOpts = aCoreMethod as AbilityInjectorOptions;
    aCoreMethod = undefined;
  }

  if (typeof isGetClassFunc !== 'boolean') {
    injectorOpts = isGetClassFunc;
    isGetClassFunc = undefined;
  }
  const vDepends = injectorOpts && injectorOpts.depends;

  function abilityFn(aClass, aOptions?) {
    let AbilityClass = abilityClass;
    if (isGetClassFunc === true) {
      AbilityClass = abilityClass(aClass, aOptions);
    }
    if (!AbilityClass) {
      throw new TypeError('no abilityClass');
    }
    const vName = AbilityClass.name;

    if (aClass != null) {
      let $abilities, vAdditionalAbilityInjected;
      const vTargetClass = aClass;

      let vClassPrototype = aClass.prototype;

      let vHasCoreMethod = isArray(aCoreMethod) ? aCoreMethod[0] : aCoreMethod as string;
      // TODO: Check the core method on the target class or the inheritance?
      if (vHasCoreMethod) {
        if (vHasCoreMethod[0] !== '@') {
          vHasCoreMethod = vClassPrototype.hasOwnProperty(vHasCoreMethod);
        } else {
          vHasCoreMethod = vHasCoreMethod.substring(1);
          vHasCoreMethod = aClass.hasOwnProperty(vHasCoreMethod);
        }
      }

      if (!(vHasCoreMethod || ($abilities && $abilities['$' + vName]))) {
        let vIncludeMembers!: Array<string>
        let vFilterMembers!: (name: string) => boolean
        const vHasOptions = aOptions && (aOptions.include || aOptions.exclude)

        if (vHasOptions) {
          let arr = aOptions.include
          const hasExclude = typeof aOptions.exclude === 'string' || (aOptions.exclude && aOptions.exclude.length)
          if (typeof arr === 'string') {arr = [arr]}
          if (!(arr && arr.length) || hasExclude) {
            vIncludeMembers = getMembers(AbilityClass)
          } else {
            vIncludeMembers = arr
          }

          arr = aOptions.exclude
          if (arr) {
            if (!isArray(arr)) {arr = [arr]}
            vIncludeMembers = vIncludeMembers.filter(item => arr.indexOf(item)=== -1);
          }
          arrayPushOnly(vIncludeMembers, aCoreMethod)
          if (vIncludeMembers.length) {
            vFilterMembers = function filterMembers(name) {
              return vIncludeMembers.includes(name);
            }
          }
        }

        if (vName) {
          const vInjectedOnParent = isInjectedOnParent(aClass, vName);
          // return the injected class if it has already been injected on parent
          if (vInjectedOnParent) {return vInjectedOnParent}

          vAdditionalAbilityInjected = injectAdditionalAbility(aClass, vName, aOptions);
          if (vAdditionalAbilityInjected) {
            aClass = vAdditionalAbilityInjected
            vClassPrototype = vAdditionalAbilityInjected.prototype;
          }

          $abilities = aClass.prototype[abilitiesSym];
          if (!vClassPrototype.hasOwnProperty(abilitiesSym)) {
            $abilities = null;
          }
        }

        if (!vHasOptions) {
          // inject the static methods
          let vExcludes = injectMembersFromNonEnum(aClass, AbilityClass, null, true);
          // inject the enumerable members
          extendFilter(aClass, AbilityClass, function(k) {
            return (vExcludes.indexOf(k) === -1);
          });

          // inject the methods
          vExcludes = injectMembersFromNonEnum(vClassPrototype, AbilityClass.prototype);
          extendFilter(vClassPrototype, AbilityClass.prototype, function(k) {
            return (vExcludes.indexOf(k) === -1);
          });
        } else {
          let vExcludes = injectMembersFromNonEnum(aClass, AbilityClass, vFilterMembers, true);
          // inject the enumerable members
          extendFilter(aClass, AbilityClass, function(k) {
            return (vExcludes.indexOf(k) === -1 && vFilterMembers('@' + k));
          });

          vExcludes = injectMembersFromNonEnum(vClassPrototype, AbilityClass.prototype, vFilterMembers);
          extendFilter(vClassPrototype, AbilityClass.prototype, function(k) {
            return (vExcludes.indexOf(k) === -1 && vFilterMembers(k));
          });


          // if (vName) {
          //   vAdditionalAbilityInjected = injectAdditionalAbility(aClass, vName, filterMethods);
          // }
          // extendFilter(vAdditionalAbilityInjected, AbilityClass, vFilterMembers);
          // if (vAdditionalAbilityInjected) {
          //   vClassPrototype = vAdditionalAbilityInjected.prototype;
          // }


          // filterMethods(aOptions.methods);
          // filterMethods(aOptions.classMethods);
        }
        if (aOptions != null) {
          if (aOptions.methods instanceof Object) {
            const methods = getFilteredMembers(aOptions.methods, aOptions)
            injectMethods(vClassPrototype, methods, aOptions);
          }
          if (aOptions.classMethods instanceof Object) {
            const classMethods = getFilteredMembers(aOptions.classMethods, aOptions, true)
            injectMethods(aClass, classMethods, aOptions);
          }
        }

        if (vName) {
          if (vClassPrototype.hasOwnProperty(abilitiesSym)) {
            $abilities = vClassPrototype[abilitiesSym];
          } else {
            $abilities = {};
            defineProperty(vClassPrototype, abilitiesSym, $abilities);
          }
          $abilities['$' + vName] = abilityFn;
        }
      }

      // Apply optional dependencies
      if (vDepends) {
        Object.keys(vDepends).forEach(function (name) {
          $abilities[name] = vDepends[name];
          const vInjectedOnParent = isInjectedOnParent(aClass, name);
          if (vInjectedOnParent) {

          }

        })
      }
    } else {
      aClass = AbilityClass;
    }
    return aClass;
  };

  abilityFn.filter = filter;

  function injectAdditionalAbility(aClass, aName, aOptions) {
    let result;
    let vClass = aClass;
    let vOnTarget = true;
    while (vClass && vClass.prototype) {
      if (vClass.prototype.hasOwnProperty(abilitiesSym)) {
        let vAbility = getAdditionalAbilityOptionsFn(vClass, aName);
        if (vAbility) {
          if (!Array.isArray(vAbility)) {vAbility = [vAbility]}
          for (const item of vAbility) {
            if (item && typeof item.getOpts === 'function') {
              const vOptions = item.getOpts(aOptions);
              if (vOptions != null) {
                if (vOptions.id === undefined) {vOptions.id = item.id}
                if (item.mode === AdditionalInjectionMode.direct) {
                  applyAdditionalAbility(aClass, aName, vOptions)
                } else {
                  applyAdditionalAbility(vClass, aName, vOptions)
                  vOnTarget = false
                }
              }
            }
          }
          result = vClass;
        }
      }
      vClass = getParentClass(vClass);
    }
    if (vOnTarget) {result = aClass}
    return result;
  };

  return abilityFn;
};

function getAdditionalAbilityOptionsFn(aClass, aName: string) {
  let result: AdditionalAbility|Array<AdditionalAbility>;
  const $abilities = aClass.prototype[abilitiesSym];
  let vAbility;
  if (!$abilities['$' + aName] && (vAbility = $abilities[aName])) {
    result = vAbility;
  }
  return result;
}

function applyAdditionalAbility(aClass, aName, aOptions) {
  if (aOptions != null) {
    const id = aName + (aOptions.id ? '_' + aOptions.id : '')
    let $abilitiesOpt = aClass.prototype[abilitiesOptSym]
    if (!$abilitiesOpt || !$abilitiesOpt[id]) {
      if (aOptions.methods instanceof Object) {
        const methods = getFilteredMembers(aOptions.methods, aOptions)
        injectMethods(aClass.prototype, methods, aOptions);
      }
      if (aOptions.classMethods instanceof Object) {
        const classMethods = getFilteredMembers(aOptions.classMethods, aOptions, true)
        injectMethods(aClass, classMethods, aOptions);
      }
      if (!$abilitiesOpt) {
        $abilitiesOpt = {}
        defineProperty(aClass.prototype, abilitiesOptSym, $abilitiesOpt);
      }
      $abilitiesOpt[id] = true;
    }
  }
}

function arrayPushOnly(dest: Array<any>, src: Array<any>|any) {
  if (src !== undefined) {
    if (!Array.isArray(src)) {src = [src]}
    src.forEach(item => {
      dest.indexOf(item) === -1 && dest.push(item)
    });
  }
  return dest;

}

function getMembers(aClass) {
  let result: Array<string> = getNonEnumNames(aClass).filter(n => !skipStaticNames.includes(n)).map(name => '@' + name)
  result = result.concat(Object.keys(aClass).map(name => '@' + name))
  result = result.concat(getNonEnumNames(aClass.prototype).filter(n => !skipProtoNames.includes(n)))
  result = result.concat(Object.keys(aClass.prototype))
  return result
}

function filter(k, aIncludes, aExcludes, aIsStatic?: boolean) {
  if (aIsStatic) {
    k = '@' + k;
  }
  if (typeof aIncludes === 'string') {aIncludes = [aIncludes]}
  if (typeof aExcludes === 'string') {aExcludes = [aExcludes]}

  let result = aIncludes && aIncludes.length;
  if (result) {
    result = aIncludes.indexOf(k) >= 0;
    if (!result && aExcludes && aExcludes.length) {
      result = !(aExcludes.indexOf(k) >= 0);
    }
  } else if (aExcludes && aExcludes.length) {
    result = !(aExcludes.indexOf(k) >= 0);
  } else {
    result = true;
  }
  return result;
};

function getFilteredMembers(obj, aOptions, isStatic?: boolean) {
  const result = {}
  Object.keys(obj).forEach(name => {
    if (filter(name, aOptions.include, aOptions.exclude, isStatic)) {
      result[name] = obj[name]
    }
  })
  return result
}

