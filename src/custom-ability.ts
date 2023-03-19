import isArray from 'util-ex/lib/is/type/array';
import isFunction from 'util-ex/lib/is/type/function';
import extendFilter from 'util-ex/lib/extend';
import injectMethods from 'util-ex/lib/injectMethods';
import injectMethod from 'util-ex/lib/injectMethod';
import defineProperty from 'util-ex/lib/defineProperty';
import getNonEnumNames from 'util-ex/lib/get-non-enumerable-names';
import isInjectedOnParent from './injected-on-parent';

/**
 * Inject methods from NonEnum members of the aObject
 *
 * @internal
 * @param aTargetClass the target class
 * @param aObject the NonEnum methods of the object will be injected into aTargetClass
 * @param filter
 * @param isStatic Whether the injected methods on the aObject is static
 * @returns already injected method name list
 */
function injectMethodsFromNonEnum(aTargetClass, aObject, filter?: (name:string)=>boolean, isStatic?: boolean) {
  const nonEnumNames = getNonEnumNames(aObject);
  const result = [];
  nonEnumNames.forEach(function(name: string) {
    let v, vName: string;
    if ((isStatic || name !== 'constructor') && isFunction(v = aObject[name])) {
      const is$ = name[0] === '$';
      // get rid of the first char '$'
      if (is$) {
        name = name.substring(1);
      }
      vName = isStatic ? '@' + name : name;
      if (!filter || filter(vName)) {
        if (isFunction(aTargetClass[name])) {
          injectMethod(aTargetClass, name, v);
        } else if (aTargetClass[name] != null) {
          throw new TypeError('the same non-null name is not function:' + name);
        } else {
          if (is$ && aObject[name]) {
            v = aObject[name];
          }
          aTargetClass[name] = v;
        }
        result.push(name);
      }
    }
  });
  return result;
};

/**
 * The Ability Options
 */
interface AbilityOptions {
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

/**
 * A function that adds(injects) the ability of a specified ability class to a target class.
 *
 * @param {Function} targetClass - The target class to which the ability will be added.
 * @param {AbilityOptions} [options] - An optional ability configuration object.
 * @returns {Function} - An injected target class that takes a class and adds the ability to it using the specified
 *                       options.
 */
type AbilityFn = (targetClass: Function, options?: AbilityOptions) => Function;

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
export function createAbilityInjector(abilityClass: Function, isGetClassFunc?: boolean): AbilityFn;
export function createAbilityInjector(abilityClass: Function, aCoreMethod?: string, isGetClassFunc?: boolean): AbilityFn;
export function createAbilityInjector(abilityClass: Function, aCoreMethod?: string[], isGetClassFunc?: boolean): AbilityFn;
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
export function createAbilityInjector(abilityClass: Function, aCoreMethod?: string|string[]|boolean, isGetClassFunc?: boolean): AbilityFn {
  if (typeof aCoreMethod === 'boolean') {
    isGetClassFunc = aCoreMethod;
    aCoreMethod = undefined;
  }

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
      let $abilities, vAdditionalAbilityInjected, vExcludes, vIncludes, vInjectedOnParent;

      let aClassPrototype = aClass.prototype;
      let vHasCoreMethod = isArray(aCoreMethod) ? aCoreMethod[0] : aCoreMethod as string;

      if (vHasCoreMethod) {
        if (vHasCoreMethod[0] !== '@') {
          vHasCoreMethod = aClassPrototype.hasOwnProperty(vHasCoreMethod);
        } else {
          vHasCoreMethod = vHasCoreMethod.substring(1);
          vHasCoreMethod = aClass.hasOwnProperty(vHasCoreMethod);
        }
      }
      if (vName) {
        $abilities = aClass.prototype.$abilities;
        vInjectedOnParent = isInjectedOnParent(aClass, vName);
        if (!aClass.prototype.hasOwnProperty('$abilities')) {
          $abilities = null;
        }
      }
      if (!(vHasCoreMethod || ($abilities && $abilities['$' + vName]))) {
        if ((aOptions == null) || !(aOptions.include || aOptions.exclude)) {
          if (vName) {
            vAdditionalAbilityInjected = injectAdditionalAbility(aClass, vName);
          }
          vExcludes = injectMethodsFromNonEnum(aClass, AbilityClass, null, true);
          extendFilter(aClass, AbilityClass, function(k) {
            return !(vExcludes.indexOf(k) >= 0);
          });
          if (vAdditionalAbilityInjected) {
            aClassPrototype = vAdditionalAbilityInjected.prototype;
          }
          if (!vInjectedOnParent) {
            vExcludes = injectMethodsFromNonEnum(aClassPrototype, AbilityClass.prototype);
            extendFilter(aClassPrototype, AbilityClass.prototype, function(k) {
              return !(vExcludes.indexOf(k) >= 0);
            });
          }
        } else {
          vIncludes = aOptions.include;
          if (vIncludes) {
            if (!isArray(vIncludes)) {
              vIncludes = [vIncludes];
            }
          } else {
            vIncludes = [];
          }
          if (aCoreMethod) {
            if (isArray(aCoreMethod)) {
              vIncludes = vIncludes.concat(aCoreMethod);
            } else {
              vIncludes.push(aCoreMethod);
            }
          }
          vExcludes = aOptions.exclude;
          if (vExcludes) {
            if (!isArray(vExcludes)) {
              vExcludes = [vExcludes];
            }
          } else {
            vExcludes = [];
          }

          const vGenFilter = function (isStatic?: boolean) {
            return function(k) {
              return filter(k, vIncludes, vExcludes, isStatic);
            };
          };

          let vAbilities = injectMethodsFromNonEnum(aClass, AbilityClass, vGenFilter(true), true);
          vAbilities = vAbilities.concat(injectMethodsFromNonEnum(aClass.prototype, AbilityClass.prototype, vGenFilter()));
          vExcludes = vExcludes.concat(vAbilities);
          vAbilities = undefined;

          const filterMethods = function (methods, isStatic?: boolean) {
            if (methods instanceof Object) {
              const vFilter = vGenFilter(isStatic);
              for (let k in methods) {
                if (!vFilter(k)) {
                  delete methods[k];
                }
              }
            }
          };

          if (vName) {
            vAdditionalAbilityInjected = injectAdditionalAbility(aClass, vName, filterMethods);
          }
          extendFilter(aClass, AbilityClass, vGenFilter(true));
          if (vAdditionalAbilityInjected) {
            aClassPrototype = vAdditionalAbilityInjected.prototype;
          }
          if (!vInjectedOnParent) {
            extendFilter(aClassPrototype, AbilityClass.prototype, vGenFilter());
          }
          filterMethods(aOptions.methods);
          filterMethods(aOptions.classMethods);
        }
        if (aOptions != null) {
          if (!vInjectedOnParent && aOptions.methods instanceof Object) {
            injectMethods(aClassPrototype, aOptions.methods, aOptions);
          }
          if (aOptions.classMethods instanceof Object) {
            injectMethods(aClass, aOptions.classMethods, aOptions);
          }
        }
        if (vName) {
          if (aClassPrototype !== aClass.prototype) {
            aClassPrototype = aClass.prototype;
          }
          if (!aClassPrototype.hasOwnProperty('$abilities')) {
            $abilities = {};
            defineProperty(aClassPrototype, '$abilities', $abilities);
          }
          $abilities['$' + vName] = abilityFn;
        }
      }
    } else {
      aClass = AbilityClass;
    }
    return aClass;
  };

  function filter(k, aIncludes, aExcludes, aIsStatic) {
    var result;
    if (aIsStatic) {
      k = '@' + k;
    }
    result = aIncludes.length;
    if (result) {
      result = aIncludes.indexOf(k) >= 0;
      if (!result && aExcludes.length) {
        result = !(aExcludes.indexOf(k) >= 0);
      }
    } else if (aExcludes.length) {
      result = !(aExcludes.indexOf(k) >= 0);
    } else {
      result = true;
    }
    return result;
  };

  abilityFn.filter = filter;

  function getAdditionalAbility(aClass, aName) {
    var result;
    result = [];
    while (aClass && aClass.prototype) {
      if (aClass.prototype.hasOwnProperty('$abilities') && !aClass.prototype.$abilities['$' + aName] && aClass.prototype.$abilities[aName]) {
        result.push(aClass);
      }
      aClass = aClass.super_;
    }
    return result;
  };

  function injectAdditionalAbility(aClass, aName, filterMethods?) {
    var $abilities, result, vAbility, vOptions;
    while (aClass && aClass.prototype) {
      if (aClass.prototype.hasOwnProperty('$abilities')) {
        $abilities = aClass.prototype.$abilities;
        if (!$abilities['$' + aName] && (vAbility = $abilities[aName])) {
          vOptions = vAbility();
          result = aClass;
          if (vOptions != null) {
            if (filterMethods) {
              filterMethods(vOptions.methods);
              filterMethods(vOptions.classMethods);
            }
            if (vOptions.methods instanceof Object) {
              injectMethods(aClass.prototype, vOptions.methods, vOptions);
            }
            if (vOptions.classMethods instanceof Object) {
              injectMethods(aClass, vOptions.classMethods, vOptions);
            }
          }
        }
      }
      aClass = aClass.super_;
    }
    return result;
  };

  return abilityFn;
};