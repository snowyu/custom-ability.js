[custom-ability](README.md) / Exports

# custom-ability

## Table of contents

### References

- [default](modules.md#default)

### Interfaces

- [AbilityInjectorOptions](interfaces/AbilityInjectorOptions.md)
- [AbilityOptions](interfaces/AbilityOptions.md)
- [AdditionalAbilities](interfaces/AdditionalAbilities.md)
- [AdditionalAbility](interfaces/AdditionalAbility.md)

### Variables

- [AdditionalInjectionMode](modules.md#additionalinjectionmode)
- [abilitiesOptSym](modules.md#abilitiesoptsym)
- [abilitiesSym](modules.md#abilitiessym)

### Functions

- [createAbilityInjector](modules.md#createabilityinjector)
- [flattenAbility](modules.md#flattenability)
- [hasAbilityOnParent](modules.md#hasabilityonparent)
- [injectedOnParent](modules.md#injectedonparent)
- [requireAbility](modules.md#requireability)

## References

### default

Renames and re-exports [createAbilityInjector](modules.md#createabilityinjector)

## Variables

### AdditionalInjectionMode

• `Const` **AdditionalInjectionMode**: `Object`

The additional injection mode

#### Type declaration

| Name | Type |
| :------ | :------ |
| `all` | `number` |
| `target` | `number` |

#### Defined in

[custom-ability.ts:28](https://github.com/snowyu/custom-ability.js/blob/3698645/src/custom-ability.ts#L28)

___

### abilitiesOptSym

• `Const` **abilitiesOptSym**: ``"$abilitiesOpt"``

A symbol used to mark a class's additional ability whether injected

**`Constant`**

#### Defined in

[custom-ability.ts:23](https://github.com/snowyu/custom-ability.js/blob/3698645/src/custom-ability.ts#L23)

___

### abilitiesSym

• `Const` **abilitiesSym**: ``"$abilities"``

A symbol used to mark a class's abilities

**`Constant`**

#### Defined in

[custom-ability.ts:16](https://github.com/snowyu/custom-ability.js/blob/3698645/src/custom-ability.ts#L16)

## Functions

### createAbilityInjector

▸ **createAbilityInjector**<`A`\>(`abilityClass`, `isGetClassFunc?`, `injectorOpts?`): `ClassAbilityFn`<`A`\>

Creates a function that adds(injects) the ability to the target class based on the ability class.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `A` | extends `ClassEx` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `abilityClass` | `A` | The ability class to inject into the target class. |
| `isGetClassFunc?` | `boolean` | An optional parameter that indicates whether abilityClass should be invoked with aClass and aOptions to get the actual ability class. defaults to false |
| `injectorOpts?` | [`AbilityInjectorOptions`](interfaces/AbilityInjectorOptions.md) | An optional injector options object |

#### Returns

`ClassAbilityFn`<`A`\>

Another function that accepts the target class and options to include or exclude specific
                   properties and methods.
                   The returned function injects the abilities into the target class and returns the modified class.

#### Defined in

[custom-ability.ts:209](https://github.com/snowyu/custom-ability.js/blob/3698645/src/custom-ability.ts#L209)

▸ **createAbilityInjector**<`A`\>(`abilityClass`, `aCoreMethod?`, `isGetClassFunc?`, `injectorOpts?`): `ClassAbilityFn`<`A`\>

Creates a function that adds(injects) the ability to the target class based on the ability class.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `A` | extends `ClassEx` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `abilityClass` | `A` | The ability class to inject into the target class. |
| `aCoreMethod?` | `string` \| `string`[] | An optional parameter that specifies the core methods that the ability class must have. This is a minimum set of methods required for the ability to be considered injected. Core methods are defined in the ability class, and can be static or instance methods. If a core method is a static method, it must be prefixed with the "@" symbol. Note: If a core method is renamed via `options.rename`, the detection logic will automatically use the new name to check for existence. |
| `isGetClassFunc?` | `boolean` | An optional parameter that indicates whether abilityClass should be invoked with aClass and aOptions to get the actual ability class. defaults to false. When true, abilityClass is treated as a factory: (targetClass, options) => RealAbilityClass. |
| `injectorOpts?` | [`AbilityInjectorOptions`](interfaces/AbilityInjectorOptions.md) | An optional injector options object for defining dependencies (AdditionalAbilities). |

#### Returns

`ClassAbilityFn`<`A`\>

Another function that accepts the target class and options to include or exclude specific
                   properties and methods.
                   The returned function injects the abilities into the target class and returns the modified class.

#### Defined in

[custom-ability.ts:210](https://github.com/snowyu/custom-ability.js/blob/3698645/src/custom-ability.ts#L210)

▸ **createAbilityInjector**<`A`\>(`abilityClass`, `aCoreMethod?`, `injectorOpts?`): `ClassAbilityFn`<`A`\>

Creates a function that adds(injects) the ability to the target class based on the ability class.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `A` | extends `ClassEx` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `abilityClass` | `A` | The ability class to inject into the target class. |
| `aCoreMethod?` | `string` \| `string`[] | An optional parameter that specifies the core methods that the ability class must have. This is a minimum set of methods required for the ability to be considered injected. Core methods are defined in the ability class, and can be static or instance methods. If a core method is a static method, it must be prefixed with the "@" symbol. Note: If a core method is renamed via `options.rename`, the detection logic will automatically use the new name to check for existence. |
| `injectorOpts?` | [`AbilityInjectorOptions`](interfaces/AbilityInjectorOptions.md) | An optional injector options object for defining dependencies (AdditionalAbilities). |

#### Returns

`ClassAbilityFn`<`A`\>

Another function that accepts the target class and options to include or exclude specific
                   properties and methods.
                   The returned function injects the abilities into the target class and returns the modified class.

#### Defined in

[custom-ability.ts:211](https://github.com/snowyu/custom-ability.js/blob/3698645/src/custom-ability.ts#L211)

▸ **createAbilityInjector**<`A`\>(`abilityClass`, `injectorOpts?`): `ClassAbilityFn`<`A`\>

Creates a function that adds(injects) the ability to the target class based on the ability class.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `A` | extends `ClassEx` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `abilityClass` | `A` | The ability class to inject into the target class. |
| `injectorOpts?` | [`AbilityInjectorOptions`](interfaces/AbilityInjectorOptions.md) | An optional injector options object for defining dependencies (AdditionalAbilities). |

#### Returns

`ClassAbilityFn`<`A`\>

Another function that accepts the target class and options to include or exclude specific
                   properties and methods.
                   The returned function injects the abilities into the target class and returns the modified class.

#### Defined in

[custom-ability.ts:212](https://github.com/snowyu/custom-ability.js/blob/3698645/src/custom-ability.ts#L212)

___

### flattenAbility

▸ **flattenAbility**<`T`\>(`AbilityClass`): `T`

Flattens the inheritance hierarchy of an Ability class by lifting members from
the prototype chain to the class itself as 'own properties'.

**`Description`**

By default, `custom-ability` only scans the 'own properties' of the provided
Ability class. If your Ability (e.g., `AdvanceAbility`) extends another class
(e.g., `SimpleAbility`), the inherited methods will be missed during injection.

This function traverses the inheritance chain (both instance and static) and
copies descriptors to the target class, ensuring all inherited capabilities
are visible to the `custom-ability` injector.

**`Example`**

```typescript
class Simple {
  sayHello() { return 'Hello'; }
}
class Advance extends Simple {
  sayHi() { return 'Hi'; }
}

// Without flattening, only 'sayHi' is injected.
// With flattening, both 'sayHello' and 'sayHi' are injected.
const Flattened = flattenAbility(Advance);
const inject = createAbilityInjector(Flattened);
inject(MyService);
```

**`Throws`**

If the input is not a function/class.

**`Note`**

1. This function preserves Property Descriptors (getters/setters).
2. It follows a "fill-in" strategy: subclass overrides are NEVER overwritten
   by parent members, preserving `super` call integrity.
3. Only String keys are processed to ensure compatibility with `custom-ability`
   filtering and renaming features.

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | extends `Function` | A class constructor type. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `AbilityClass` | `T` | The class to be flattened. |

#### Returns

`T`

The same AbilityClass with all inherited members lifted to its own prototype/constructor.

#### Defined in

[flatten-ability.ts:43](https://github.com/snowyu/custom-ability.js/blob/3698645/src/flatten-ability.ts#L43)

___

### hasAbilityOnParent

▸ **hasAbilityOnParent**(`aClass`, `aName`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `aClass` | `Function` |
| `aName` | `string` |

#### Returns

`any`

#### Defined in

[has-ability-on-parent.ts:3](https://github.com/snowyu/custom-ability.js/blob/3698645/src/has-ability-on-parent.ts#L3)

___

### injectedOnParent

▸ **injectedOnParent**(`aClass`, `aName`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `aClass` | `Function` |
| `aName` | `string` |

#### Returns

`any`

#### Defined in

[injected-on-parent.ts:3](https://github.com/snowyu/custom-ability.js/blob/3698645/src/injected-on-parent.ts#L3)

___

### requireAbility

▸ **requireAbility**(`packageName`, `aClass`, `aOptions?`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `packageName` | `string` |
| `aClass` | `Function` |
| `aOptions?` | `any` |

#### Returns

`Promise`<`any`\>

#### Defined in

[require.ts:9](https://github.com/snowyu/custom-ability.js/blob/3698645/src/require.ts#L9)
