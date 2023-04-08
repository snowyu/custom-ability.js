[custom-ability](README.md) / Exports

# custom-ability

## Table of contents

### References

- [default](modules.md#default)

### Interfaces

- [AbilityOptions](interfaces/AbilityOptions.md)

### Type Aliases

- [AbilityFn](modules.md#abilityfn)

### Functions

- [createAbilityInjector](modules.md#createabilityinjector)
- [hasAbilityOnParent](modules.md#hasabilityonparent)
- [injectedOnParent](modules.md#injectedonparent)
- [requireAbility](modules.md#requireability)

## References

### default

Renames and re-exports [createAbilityInjector](modules.md#createabilityinjector)

## Type Aliases

### AbilityFn

Ƭ **AbilityFn**: (`targetClass`: `Function`, `options?`: [`AbilityOptions`](interfaces/AbilityOptions.md)) => `Function`

#### Type declaration

▸ (`targetClass`, `options?`): `Function`

A function that adds(injects) the ability of a specified ability class to a target class.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `targetClass` | `Function` | The target class to which the ability will be added. |
| `options?` | [`AbilityOptions`](interfaces/AbilityOptions.md) | An optional ability configuration object. |

##### Returns

`Function`

- An injected target class that takes a class and adds the ability to it using the specified
                      options.

#### Defined in

[custom-ability.ts:80](https://github.com/snowyu/custom-ability.js/blob/c545270/src/custom-ability.ts#L80)

## Functions

### createAbilityInjector

▸ **createAbilityInjector**(`abilityClass`, `isGetClassFunc?`): [`AbilityFn`](modules.md#abilityfn)

Creates a function that adds(injects) the ability to the target class based on the ability class.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `abilityClass` | `Function` | The ability class to inject into the target class. |
| `isGetClassFunc?` | `boolean` | An optional parameter that indicates whether abilityClass should be invoked with aClass and aOptions to get the actual ability class. defaults to false |

#### Returns

[`AbilityFn`](modules.md#abilityfn)

Another function that accepts the target class and options to include or exclude specific
                   properties and methods.
                   The returned function injects the abilities into the target class and returns the modified class.

#### Defined in

[custom-ability.ts:92](https://github.com/snowyu/custom-ability.js/blob/c545270/src/custom-ability.ts#L92)

▸ **createAbilityInjector**(`abilityClass`, `aCoreMethod?`, `isGetClassFunc?`): [`AbilityFn`](modules.md#abilityfn)

Creates a function that adds(injects) the ability to the target class based on the ability class.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `abilityClass` | `Function` | The ability class to inject into the target class. |
| `aCoreMethod?` | `string` \| `string`[] | An optional parameter that specifies the core methods that the ability class must have. This is a minimum set of methods required for the ability to be considered injected. Core methods are defined in the ability class, and can be static or instance methods. If a core method is a static method, it must be prefixed with the "@" symbol. |
| `isGetClassFunc?` | `boolean` | An optional parameter that indicates whether abilityClass should be invoked with aClass and aOptions to get the actual ability class. defaults to false |

#### Returns

[`AbilityFn`](modules.md#abilityfn)

Another function that accepts the target class and options to include or exclude specific
                   properties and methods.
                   The returned function injects the abilities into the target class and returns the modified class.

#### Defined in

[custom-ability.ts:93](https://github.com/snowyu/custom-ability.js/blob/c545270/src/custom-ability.ts#L93)

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

[has-ability-on-parent.ts:3](https://github.com/snowyu/custom-ability.js/blob/c545270/src/has-ability-on-parent.ts#L3)

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

[injected-on-parent.ts:3](https://github.com/snowyu/custom-ability.js/blob/c545270/src/injected-on-parent.ts#L3)

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

[require.ts:9](https://github.com/snowyu/custom-ability.js/blob/c545270/src/require.ts#L9)
