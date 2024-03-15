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

[custom-ability.ts:142](https://github.com/snowyu/custom-ability.js/blob/0309eb8/src/custom-ability.ts#L142)

___

### id

• `Optional` **id**: `string`

the AdditionalAbilityOptions ID

#### Defined in

[custom-ability.ts:127](https://github.com/snowyu/custom-ability.js/blob/0309eb8/src/custom-ability.ts#L127)

___

### mode

• `Optional` **mode**: `number`

the Additional Injection Mode

#### Defined in

[custom-ability.ts:131](https://github.com/snowyu/custom-ability.js/blob/0309eb8/src/custom-ability.ts#L131)

___

### required

• `Optional` **required**: `string`[]

the list of required methods

#### Defined in

[custom-ability.ts:135](https://github.com/snowyu/custom-ability.js/blob/0309eb8/src/custom-ability.ts#L135)
