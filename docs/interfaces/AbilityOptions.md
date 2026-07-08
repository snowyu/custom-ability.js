[custom-ability](../README.md) / [Exports](../modules.md) / AbilityOptions

# Interface: AbilityOptions

The Ability Options

## Indexable

▪ [name: `string`]: `any`

## Table of contents

### Properties

- [classMethods](AbilityOptions.md#classmethods)
- [exclude](AbilityOptions.md#exclude)
- [id](AbilityOptions.md#id)
- [include](AbilityOptions.md#include)
- [methods](AbilityOptions.md#methods)
- [mode](AbilityOptions.md#mode)
- [rename](AbilityOptions.md#rename)

## Properties

### classMethods

• `Optional` **classMethods**: `Record`<`string`, `Function`\>

An optional object mapping method names to static functions to be added to the target class.

#### Defined in

[custom-ability.ts:110](https://github.com/snowyu/custom-ability.js/blob/8aa6950/src/custom-ability.ts#L110)

___

### exclude

• `Optional` **exclude**: `string` \| `string`[]

An optional list of method names to exclude.

#### Defined in

[custom-ability.ts:102](https://github.com/snowyu/custom-ability.js/blob/8aa6950/src/custom-ability.ts#L102)

___

### id

• `Optional` **id**: `string`

An optional id for AdditionalAbility option

#### Defined in

[custom-ability.ts:90](https://github.com/snowyu/custom-ability.js/blob/8aa6950/src/custom-ability.ts#L90)

___

### include

• `Optional` **include**: `string` \| `string`[]

An optional list of method names to include.

#### Defined in

[custom-ability.ts:98](https://github.com/snowyu/custom-ability.js/blob/8aa6950/src/custom-ability.ts#L98)

___

### methods

• `Optional` **methods**: `Record`<`string`, `Function`\>

An optional object mapping method names to functions to be added to the target class.

#### Defined in

[custom-ability.ts:106](https://github.com/snowyu/custom-ability.js/blob/8aa6950/src/custom-ability.ts#L106)

___

### mode

• `Optional` **mode**: `number`

The additional injection mode

#### Defined in

[custom-ability.ts:94](https://github.com/snowyu/custom-ability.js/blob/8aa6950/src/custom-ability.ts#L94)

___

### rename

• `Optional` **rename**: `Record`<`string`, `string`\>

An optional object mapping original method names to new method names to be added to the target class.
The new method name must not exist in the target class.
The original method name will be automatically excluded from injection.
Note: "@" prefix means class/static method.

#### Defined in

[custom-ability.ts:117](https://github.com/snowyu/custom-ability.js/blob/8aa6950/src/custom-ability.ts#L117)
