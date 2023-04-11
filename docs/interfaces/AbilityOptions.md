[custom-ability](../README.md) / [Exports](../modules.md) / AbilityOptions

# Interface: AbilityOptions

The Ability Options

## Table of contents

### Properties

- [classMethods](AbilityOptions.md#classmethods)
- [exclude](AbilityOptions.md#exclude)
- [include](AbilityOptions.md#include)
- [methods](AbilityOptions.md#methods)

## Properties

### classMethods

• `Optional` **classMethods**: `Record`<`string`, `Function`\>

An optional object mapping method names to static functions to be added to the target class.

#### Defined in

[custom-ability.ts:69](https://github.com/snowyu/custom-ability.js/blob/49a0f32/src/custom-ability.ts#L69)

___

### exclude

• `Optional` **exclude**: `string` \| `string`[]

An optional list of method names to exclude.

#### Defined in

[custom-ability.ts:61](https://github.com/snowyu/custom-ability.js/blob/49a0f32/src/custom-ability.ts#L61)

___

### include

• `Optional` **include**: `string` \| `string`[]

An optional list of method names to include.

#### Defined in

[custom-ability.ts:57](https://github.com/snowyu/custom-ability.js/blob/49a0f32/src/custom-ability.ts#L57)

___

### methods

• `Optional` **methods**: `Record`<`string`, `Function`\>

An optional object mapping method names to functions to be added to the target class.

#### Defined in

[custom-ability.ts:65](https://github.com/snowyu/custom-ability.js/blob/49a0f32/src/custom-ability.ts#L65)
