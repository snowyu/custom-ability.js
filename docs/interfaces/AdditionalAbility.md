[custom-ability](../README.md) / [Exports](../modules.md) / AdditionalAbility

# Interface: AdditionalAbility

An additional ability

## Table of contents

### Properties

- [getOpts](AdditionalAbility.md#getopts)
- [id](AdditionalAbility.md#id)
- [mode](AdditionalAbility.md#mode)
- [required](AdditionalAbility.md#required)

## Properties

### getOpts

• **getOpts**: (`options?`: [`AbilityOptions`](AbilityOptions.md)) => [`AbilityOptions`](AbilityOptions.md)

#### Type declaration

▸ (`options?`): [`AbilityOptions`](AbilityOptions.md)

Returns the additional ability options if they exist

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options?` | [`AbilityOptions`](AbilityOptions.md) | the ability Options |

##### Returns

[`AbilityOptions`](AbilityOptions.md)

the Additional Ability options if exists

#### Defined in

[custom-ability.ts:143](https://github.com/snowyu/custom-ability.js/blob/5cf28e6/src/custom-ability.ts#L143)

___

### id

• `Optional` **id**: `string`

the AdditionalAbilityOptions ID

#### Defined in

[custom-ability.ts:128](https://github.com/snowyu/custom-ability.js/blob/5cf28e6/src/custom-ability.ts#L128)

___

### mode

• `Optional` **mode**: `number`

the Additional Injection Mode

#### Defined in

[custom-ability.ts:132](https://github.com/snowyu/custom-ability.js/blob/5cf28e6/src/custom-ability.ts#L132)

___

### required

• `Optional` **required**: `string`[]

the list of required methods

#### Defined in

[custom-ability.ts:136](https://github.com/snowyu/custom-ability.js/blob/5cf28e6/src/custom-ability.ts#L136)
