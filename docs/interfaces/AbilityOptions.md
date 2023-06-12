[custom-ability](../README.md) / [Exports](../modules.md) / AbilityOptions

# Interface: AbilityOptions

The Ability Options

## Table of contents

### Properties

- [classMethods](AbilityOptions.md#classmethods)
- [exclude](AbilityOptions.md#exclude)
- [id](AbilityOptions.md#id)
- [include](AbilityOptions.md#include)
- [methods](AbilityOptions.md#methods)
- [mode](AbilityOptions.md#mode)

## Properties

### classMethods

• `Optional` **classMethods**: `Record`<`string`, `Function`\>

An optional object mapping method names to static functions to be added to the target class.

#### Defined in

[custom-ability.ts:116](https://github.com/snowyu/custom-ability.js/blob/3824d8e/src/custom-ability.ts#L116)

___

### exclude

• `Optional` **exclude**: `string` \| `string`[]

An optional list of method names to exclude.

#### Defined in

[custom-ability.ts:108](https://github.com/snowyu/custom-ability.js/blob/3824d8e/src/custom-ability.ts#L108)

___

### id

• `Optional` **id**: `string`

An optional id for AdditionalAbility option

#### Defined in

[custom-ability.ts:96](https://github.com/snowyu/custom-ability.js/blob/3824d8e/src/custom-ability.ts#L96)

___

### include

• `Optional` **include**: `string` \| `string`[]

An optional list of method names to include.

#### Defined in

[custom-ability.ts:104](https://github.com/snowyu/custom-ability.js/blob/3824d8e/src/custom-ability.ts#L104)

___

### methods

• `Optional` **methods**: `Record`<`string`, `Function`\>

An optional object mapping method names to functions to be added to the target class.

#### Defined in

[custom-ability.ts:112](https://github.com/snowyu/custom-ability.js/blob/3824d8e/src/custom-ability.ts#L112)

___

### mode

• `Optional` **mode**: `number`

The additional injection mode

#### Defined in

[custom-ability.ts:100](https://github.com/snowyu/custom-ability.js/blob/3824d8e/src/custom-ability.ts#L100)
