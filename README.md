### custom-ability [![Build Status](https://img.shields.io/travis/snowyu/custom-ability.js/master.png)](http://travis-ci.org/snowyu/custom-ability.js) [![npm](https://img.shields.io/npm/v/custom-ability.svg)](https://npmjs.org/package/custom-ability) [![downloads](https://img.shields.io/npm/dm/custom-ability.svg)](https://npmjs.org/package/custom-ability) [![license](https://img.shields.io/npm/l/custom-ability.svg)](https://npmjs.org/package/custom-ability)

generate the ability which can be added to any class directly.
It makes custom ability more easy.


# API

just one function:

```js
var customAbility = require('custom-ability')
```

* customAbility(AbilityClass, coreMethod)

__arguments__

* AbilityClass *(function)*: make the class become to ability.
* coreMethod *(string)*: the core instance method name to identify this ability.
  * it's the key to avoid duplication injection.

__return__

* *(function)*: a function which can inject the ability to any class directly.

the custom ability function has two arguments: `function(class[, options])`

* `class`: the class to be injected the ability.
* `options` *(object)*: optional options
  * `include `*(array|string)*: only these emitter methods will be added to the class
  * `exclude `*(array|string)*: theses emitter methods would not be added to the class
    * note: the `coreMethod` could not be excluded. It's always added to the class.
  * `methods `*(object)*: hooked methods to the class
    * key: the method name to hook.
    * value: the new method function
      * use `this.super()` to call the original method.
      * `this.self` is the original `this` object.
  * `classMethods` *(object)*: hooked class methods to the class


## Usage

suppose we wanna add the RefCount ability to any class directly.

the RefCount ability will add the following members to your class.
and you should implement the `destroy` method which will be called
by `release`/`free`.

* properties:
  * RefCount *(integer)*: the reference count.
* methods:
  * `release()`/`free()`: Decrements reference count for this instance.
    If it is becoming less than 0, the object would be (self) destroyed.
  * `addRef()`: Increments the reference count for this instance
    and returns the new reference count.

```coffee
customAbility = require 'custom-ability'

class RefCountable
  # define the instance methods here:
  release: ->
      result = --@RefCount
      @destroy() unless result >= 0
      result
  free: @::release
  addRef: ->
    if not isUndefined @RefCount
      ++@RefCount
    else
      @RefCount = 1

  # the class methods if any:
  @someClassMethod: ->


module.exports = customAbility RefCountable, 'addRef'

```

do not forget to add the `"ability"` keyword to your package.json which means
the ability power with it.

```js
// package.json
"keywords": [
  "ability",
  ...
],
```

now user use this ability like this:

```coffee
refable = require 'ref-object/ability'

class MyClass
  refable MyClass
  destroy: ->console.log 'destroy'


my = new MyClass

my.addRef()
my.free() # nothing
my.free() # print the 'destroy' here.

```

More complicated example, you can see the [events-ex/src/eventable.coffee](https://github.com/snowyu/events-ex.js).
