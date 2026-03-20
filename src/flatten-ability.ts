/**
 * Flattens the inheritance hierarchy of an Ability class by lifting members from
 * the prototype chain to the class itself as 'own properties'.
 *
 * @description
 * By default, `custom-ability` only scans the 'own properties' of the provided
 * Ability class. If your Ability (e.g., `AdvanceAbility`) extends another class
 * (e.g., `SimpleAbility`), the inherited methods will be missed during injection.
 *
 * This function traverses the inheritance chain (both instance and static) and
 * copies descriptors to the target class, ensuring all inherited capabilities
 * are visible to the `custom-ability` injector.
 *
 * @param AbilityClass - The class to be flattened.
 * @returns The same AbilityClass with all inherited members lifted to its own prototype/constructor.
 *
 * @example
 * ```typescript
 * class Simple {
 *   sayHello() { return 'Hello'; }
 * }
 * class Advance extends Simple {
 *   sayHi() { return 'Hi'; }
 * }
 *
 * // Without flattening, only 'sayHi' is injected.
 * // With flattening, both 'sayHello' and 'sayHi' are injected.
 * const Flattened = flattenAbility(Advance);
 * const inject = createAbilityInjector(Flattened);
 * inject(MyService);
 * ```
 *
 * @template T - A class constructor type.
 * @throws {TypeError} If the input is not a function/class.
 *
 * @note
 * 1. This function preserves Property Descriptors (getters/setters).
 * 2. It follows a "fill-in" strategy: subclass overrides are NEVER overwritten
 *    by parent members, preserving `super` call integrity.
 * 3. Only String keys are processed to ensure compatibility with `custom-ability`
 *    filtering and renaming features.
 */
export function flattenAbility<T extends Function>(AbilityClass: T): T {
  const rootProtos = [Object.prototype, Function.prototype, null];
  const targetProto = AbilityClass.prototype;

  const merge = (source: any, target: any) => {
    // Correctly get both String and Symbol properties
    const propertyKeys = Reflect.ownKeys(source);

    propertyKeys.forEach(key => {
      if (['constructor', 'prototype', 'name', 'length'].includes(key as string)) { return };

      // If the subclass already has this property (own property), don't overwrite
      if (Object.prototype.hasOwnProperty.call(target, key)) { return };

      const desc = Object.getOwnPropertyDescriptor(source, key);
      if (desc) {
        // IMPORTANT: Define with the original descriptor to preserve enumerability
        // This ensures custom-ability's split logic still works as expected
        Object.defineProperty(target, key, desc);
      }
    });
  };

  // Prototype chain (Instance)
  let currentProto = Object.getPrototypeOf(targetProto);
  while (currentProto && !rootProtos.includes(currentProto)) {
    merge(currentProto, targetProto);
    currentProto = Object.getPrototypeOf(currentProto);
  }

  // Constructor chain (Static)
  let currentStatic = Object.getPrototypeOf(AbilityClass);
  while (currentStatic && !rootProtos.includes(currentStatic)) {
    merge(currentStatic, AbilityClass);
    currentStatic = Object.getPrototypeOf(currentStatic);
  }

  return AbilityClass;
}
