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

[custom-ability.ts:34](https://github.com/snowyu/custom-ability.js/blob/5cf28e6/src/custom-ability.ts#L34)

___

### abilitiesOptSym

• `Const` **abilitiesOptSym**: ``"$abilitiesOpt"``

A symbol used to mark a class's additional ability whether injected

**`Constant`**

#### Defined in

[custom-ability.ts:29](https://github.com/snowyu/custom-ability.js/blob/5cf28e6/src/custom-ability.ts#L29)

___

### abilitiesSym

• `Const` **abilitiesSym**: ``"$abilities"``

A symbol used to mark a class's abilities

**`Constant`**

#### Defined in

[custom-ability.ts:22](https://github.com/snowyu/custom-ability.js/blob/5cf28e6/src/custom-ability.ts#L22)

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

[custom-ability.ts:208](https://github.com/snowyu/custom-ability.js/blob/5cf28e6/src/custom-ability.ts#L208)

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
| `aCoreMethod?` | `string` \| `string`[] | An optional parameter that specifies the core methods that the ability class must have. This is a minimum set of methods required for the ability to be considered injected. Core methods are defined in the ability class, and can be static or instance methods. If a core method is a static method, it must be prefixed with the "@" symbol. |
| `isGetClassFunc?` | `boolean` | An optional parameter that indicates whether abilityClass should be invoked with aClass and aOptions to get the actual ability class. defaults to false |
| `injectorOpts?` | [`AbilityInjectorOptions`](interfaces/AbilityInjectorOptions.md) | An optional injector options object |

#### Returns

`ClassAbilityFn`<`A`\>

Another function that accepts the target class and options to include or exclude specific
                   properties and methods.
                   The returned function injects the abilities into the target class and returns the modified class.

#### Defined in

[custom-ability.ts:209](https://github.com/snowyu/custom-ability.js/blob/5cf28e6/src/custom-ability.ts#L209)

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
| `aCoreMethod?` | `string` \| `string`[] | An optional parameter that specifies the core methods that the ability class must have. This is a minimum set of methods required for the ability to be considered injected. Core methods are defined in the ability class, and can be static or instance methods. If a core method is a static method, it must be prefixed with the "@" symbol. |
| `injectorOpts?` | [`AbilityInjectorOptions`](interfaces/AbilityInjectorOptions.md) | An optional injector options object |

#### Returns

`ClassAbilityFn`<`A`\>

Another function that accepts the target class and options to include or exclude specific
                   properties and methods.
                   The returned function injects the abilities into the target class and returns the modified class.

#### Defined in

[custom-ability.ts:210](https://github.com/snowyu/custom-ability.js/blob/5cf28e6/src/custom-ability.ts#L210)

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
| `injectorOpts?` | [`AbilityInjectorOptions`](interfaces/AbilityInjectorOptions.md) | An optional injector options object |

#### Returns

`ClassAbilityFn`<`A`\>

Another function that accepts the target class and options to include or exclude specific
                   properties and methods.
                   The returned function injects the abilities into the target class and returns the modified class.

#### Defined in

[custom-ability.ts:211](https://github.com/snowyu/custom-ability.js/blob/5cf28e6/src/custom-ability.ts#L211)

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

[has-ability-on-parent.ts:3](https://github.com/snowyu/custom-ability.js/blob/5cf28e6/src/has-ability-on-parent.ts#L3)

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

[injected-on-parent.ts:3](https://github.com/snowyu/custom-ability.js/blob/5cf28e6/src/injected-on-parent.ts#L3)

___

### requireAbility

▸ **requireAbility**(`packageName`, `aClass`, `aOptions`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `packageName` | `any` |
| `aClass` | `any` |
| `aOptions` | `any` |

#### Returns

`Promise`<`any`\>

#### Defined in

[require.ts:9](https://github.com/snowyu/custom-ability.js/blob/5cf28e6/src/require.ts#L9)
