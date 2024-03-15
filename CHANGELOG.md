# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [2.0.0-alpha.6](https://github.com/snowyu/custom-ability.js/compare/v2.0.0-alpha.5...v2.0.0-alpha.6) (2024-03-15)

## [2.0.0-alpha.5](https://github.com/snowyu/custom-ability.js/compare/v2.0.0-alpha.4...v2.0.0-alpha.5) (2024-03-15)


### Bug Fixes

* webpack5 Module parse failed: 'import' and 'export' may appear only with 'sourceType: module' ([0309eb8](https://github.com/snowyu/custom-ability.js/commit/0309eb8c2431492b6d466f8e80f74f32f94c783b))

## [2.0.0-alpha.4](https://github.com/snowyu/custom-ability.js/compare/v2.0.0-alpha.3...v2.0.0-alpha.4) (2023-06-12)


### ⚠ BREAKING CHANGES

* add new injectorOpts option to createAbilityInjector for optional depends AdditionalAbility
* Support multi AdditionalAbities on the same ability. The AdditionalAbity option is total changed. see AdditionalAbility type

### Features

* add new injectorOpts option to createAbilityInjector for optional depends AdditionalAbility ([fb3e820](https://github.com/snowyu/custom-ability.js/commit/fb3e820e8417f6864d9a91b008eb92f2f6996936))
* Support multi AdditionalAbities on the same ability. The AdditionalAbity option is total changed. see AdditionalAbility type ([b167523](https://github.com/snowyu/custom-ability.js/commit/b1675232626df28a40af5de2f0ada5eac47aa50d))


### Bug Fixes

* can not inject all inherited AdditionalAbility on ES6 Class ([0d87857](https://github.com/snowyu/custom-ability.js/commit/0d87857ddc0d8df661e8963eae1816186a47ef0a))
* many bugs on the additional ability depends of the injectorOptions ([d3e30f4](https://github.com/snowyu/custom-ability.js/commit/d3e30f42681394441430b5b9c764795cd8667b53))
* should inject the static methoods on the same class for ES6 Class and inherits-ex supports static member inheritance now ([3f832db](https://github.com/snowyu/custom-ability.js/commit/3f832dbee2ee9f4628bc0a7e9d2f737a9ed8f458))
* should not duplicate inject additional abilities on base class ([0ae6f1b](https://github.com/snowyu/custom-ability.js/commit/0ae6f1b7a9cee88351dd44cdedef741a9d9bffe4))

## [2.0.0-alpha.3](https://github.com/snowyu/custom-ability.js/compare/v2.0.0-alpha.2...v2.0.0-alpha.3) (2023-04-19)


### Bug Fixes

* should not overwrite with an empty function ([b404bbf](https://github.com/snowyu/custom-ability.js/commit/b404bbff315e9999f7fc6ad29f932f0810347362))

## [2.0.0-alpha.2](https://github.com/snowyu/custom-ability.js/compare/v2.0.0-alpha.1...v2.0.0-alpha.2) (2023-04-18)


### Features

* can inject all non-enumerable members on Ability class now ([63f01bd](https://github.com/snowyu/custom-ability.js/commit/63f01bdda4d8330cc5d28946d1b5cdcbe771e6f2))


### Bug Fixes

* should ignore the getter properties ([d6168ad](https://github.com/snowyu/custom-ability.js/commit/d6168ad8b3ac0817bd5dcf8f70b6a5f8e9508018))

## [2.0.0-alpha.1](https://github.com/snowyu/custom-ability.js/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2023-04-11)

## [2.0.0-alpha.0](https://github.com/snowyu/custom-ability.js/compare/v1.6.2...v2.0.0-alpha.0) (2023-04-08)


### Features

* export all functions on the index ([e76634f](https://github.com/snowyu/custom-ability.js/commit/e76634fbfe720e8c0afdd2f93916baaaa7ebeeac))
* export injectedOnParent named function ([cf6fb1f](https://github.com/snowyu/custom-ability.js/commit/cf6fb1fb89004cd6e26988f3834dda62cec9cdb2))
* export requireAbility named function ([27d87f3](https://github.com/snowyu/custom-ability.js/commit/27d87f3251488320a2af65fc9129acb5c734142e))
* **ts:** export AbilityFn type ([c545270](https://github.com/snowyu/custom-ability.js/commit/c5452705da68ff3170b0b6548febe8c929ce06cb))
* **ts:** export AbilityOptions etc types ([ec31ac1](https://github.com/snowyu/custom-ability.js/commit/ec31ac1eb1515f4b50cb0cf9efbf072ab679b811))
* **ts:** use tsc instead of babeljs to transpile ([f3e34d3](https://github.com/snowyu/custom-ability.js/commit/f3e34d3ca00df4a55308d4fea23c3a576fb4ec61))
* use js instead of coffee ([7b5ce01](https://github.com/snowyu/custom-ability.js/commit/7b5ce01a51b254e0fd011e59c8dcb402ce88946a))
* use ts instead of js ([eecc7f9](https://github.com/snowyu/custom-ability.js/commit/eecc7f93a6d4ff013572e57b50cca41e9e43f66f))
