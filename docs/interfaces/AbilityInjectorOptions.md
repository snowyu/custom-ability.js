[custom-ability](../README.md) / [Exports](../modules.md) / AbilityInjectorOptions

# Interface: AbilityInjectorOptions

The ability injector options

## Table of contents

### Properties

- [afterInjection](AbilityInjectorOptions.md#afterinjection)
- [depends](AbilityInjectorOptions.md#depends)

## Properties

### afterInjection

• `Optional` **afterInjection**: (`targetClass`: `Function`, `options?`: [`AbilityOptions`](AbilityOptions.md)) => `void`

#### Type declaration

▸ (`targetClass`, `options?`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `targetClass` | `Function` |
| `options?` | [`AbilityOptions`](AbilityOptions.md) |

##### Returns

`void`

#### Defined in

[custom-ability.ts:164](https://github.com/snowyu/custom-ability.js/blob/5cf28e6/src/custom-ability.ts#L164)

___

### depends

• `Optional` **depends**: [`AdditionalAbilities`](AdditionalAbilities.md)

The optional depends abilities which can work together

#### Defined in

[custom-ability.ts:163](https://github.com/snowyu/custom-ability.js/blob/5cf28e6/src/custom-ability.ts#L163)
