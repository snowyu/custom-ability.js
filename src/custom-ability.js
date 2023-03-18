import isArray from 'util-ex/lib/is/type/array';
import isFunction from 'util-ex/lib/is/type/function';
import isBoolean from 'util-ex/lib/is/type/boolean';
import extend from 'util-ex/lib/_extend';
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
 * @param {*} aTargetClass
 * @param {*} aObject the NonEnum methods of the object will be injected into aTargetClass
 * @param {*} filter
 * @param {boolean} isStatic
 * @returns already injected method name list
 */
function injectMethodsFromNonEnum(aTargetClass, aObject, filter, isStatic) {
  const nonEnumNames = getNonEnumNames(aObject);
  const result = [];
  nonEnumNames.forEach(function(k) {
    let v, vK;
    if ((isStatic || k !== 'constructor') && isFunction(v = aObject[k])) {
      const is$ = k[0] === '$';
      // get rid of the first char '$'
      if (is$) {
        k = k.substr(1);
      }
      vK = isStatic ? '@' + k : k;
      if (!filter || filter(vK)) {
        if (isFunction(aTargetClass[k])) {
          injectMethod(aTargetClass, k, v);
        } else if (aTargetClass[k] != null) {
          throw new TypeError('the same non-null name is not function:' + k);
        } else {
          if (is$ && aObject[k]) {
            v = aObject[k];
          }
          aTargetClass[k] = v;
        }
        result.push(k);
      }
    }
  });
  return result;
};

/**
 * A function that adds(injects) the ability of a specified ability class to a target class.
 *
 * @callback AbilityFn
 * @param {Function} targetClass - The target class to which the ability will be added.
 * @param {object} [options] - An optional configuration object.
 * @param {string|string[]} [options.include] - An optional list of method names to include.
 * @param {string|string[]} [options.exclude] - An optional list of method names to exclude.
 * @param {record<string, Function>} [options.methods] - An optional object mapping method names to functions to be added to the target class.
 * @param {record<string, Function>} [options.classMethods] - An optional object mapping method names to static functions to be added to the target class.
 * @returns {Function} - An injected target class that takes a class and adds the ability to it using the specified
 *                       options.
 */

/**
 * Creates a function that adds(injects) the ability to the target class based on the ability class.
 *
 * @param abilityClass The ability class to inject into the target class.
 * @param {string|string[]} aCoreMethod An optional parameter that specifies the core methods that the ability class must have.
 *                    This is a minimum set of methods required for the ability to be considered injected.
 *                    Core methods are defined in the ability class, and can be static or instance methods.
 *                    If a core method is a static method, it must be prefixed with the "@" symbol.
 * @param {boolean} isGetClassFunc An optional parameter that indicates whether abilityClass should be invoked
 *                    with aClass and aOptions to get the actual ability class.
 * @returns {AbilityFn} Another function that accepts the target class and options to include or exclude specific
 *                    properties and methods.
 *                    The returned function injects the abilities into the target class and returns the modified class.
 */
export function createAbilityInjector(abilityClass, aCoreMethod, isGetClassFunc) {
  if (isBoolean(aCoreMethod)) {
    isGetClassFunc = aCoreMethod;
    aCoreMethod = undefined;
  }

  function abilityFn(aClass, aOptions) {
    let AbilityClass = abilityClass;
    if (isGetClassFunc === true) {
      AbilityClass = abilityClass(aClass, aOptions);
    }
    if (!AbilityClass) {
      throw new TypeError('no abilityClass');
    }
    const vName = AbilityClass.name;

    if (aClass != null) {
      let $abilities, vAddtionalAbilityInjected, vExcludes, vIncludes, vInjectedOnParent;

      let aClassPrototype = aClass.prototype;
      let vhasCoreMethod = isArray(aCoreMethod) ? aCoreMethod[0] : aCoreMethod;

      if (vhasCoreMethod) {
        if (vhasCoreMethod[0] !== '@') {
          vhasCoreMethod = aClassPrototype.hasOwnProperty(vhasCoreMethod);
        } else {
          vhasCoreMethod = vhasCoreMethod.substr(1);
          vhasCoreMethod = aClass.hasOwnProperty(vhasCoreMethod);
        }
      }
      if (vName) {
        $abilities = aClass.prototype.$abilities;
        vInjectedOnParent = isInjectedOnParent(aClass, vName);
        if (!aClass.prototype.hasOwnProperty('$abilities')) {
          $abilities = null;
        }
      }
      if (!(vhasCoreMethod || ($abilities && $abilities['$' + vName]))) {
        if ((aOptions == null) || !(aOptions.include || aOptions.exclude)) {
          if (vName) {
            vAddtionalAbilityInjected = injectAdditionalAbility(aClass, vName);
          }
          vExcludes = injectMethodsFromNonEnum(aClass, AbilityClass, null, true);
          extendFilter(aClass, AbilityClass, function(k) {
            return !(vExcludes.indexOf(k) >= 0);
          });
          if (vAddtionalAbilityInjected) {
            aClassPrototype = vAddtionalAbilityInjected.prototype;
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

          function vFilter(isStatic) {
            return function(k) {
              return filter(k, vIncludes, vExcludes, isStatic);
            };
          };

          let vAbilities = injectMethodsFromNonEnum(aClass, AbilityClass, vFilter(true), true);
          vAbilities = vAbilities.concat(injectMethodsFromNonEnum(aClass.prototype, AbilityClass.prototype, vFilter()));
          vExcludes = vExcludes.concat(vAbilities);
          vAbilities = undefined;

          function filterMethods(methods) {
            var k;
            if (methods instanceof Object) {
              for (k in methods) {
                if (!vFilter(k)) {
                  delete methods[k];
                }
              }
            }
          };

          if (vName) {
            vAddtionalAbilityInjected = injectAdditionalAbility(aClass, vName, filterMethods);
          }
          extendFilter(aClass, AbilityClass, vFilter(true));
          if (vAddtionalAbilityInjected) {
            aClassPrototype = vAddtionalAbilityInjected.prototype;
          }
          if (!vInjectedOnParent) {
            extendFilter(aClassPrototype, AbilityClass.prototype, vFilter());
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

  function injectAdditionalAbility(aClass, aName, filterMethods) {
    var $abilities, result, vAbility, vOptions;
    while (aClass && aClass.prototype) {
      if (aClass.prototype.hasOwnProperty('$abilities')) {
        $abilities = aClass.prototype.$abilities;
        if (!$abilities['$' + aName] && (vAbility = $abilities[aName])) {
          vOptions = vAbility();
          $abilities['$' + aName] = abilityFn;
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
