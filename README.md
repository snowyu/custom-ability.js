### custom-ability [![Build Status](https://img.shields.io/travis/snowyu/custom-ability.js/master.png)](http://travis-ci.org/snowyu/custom-ability.js) [![npm](https://img.shields.io/npm/v/custom-ability.svg)](https://npmjs.org/package/custom-ability) [![downloads](https://img.shields.io/npm/dm/custom-ability.svg)](https://npmjs.org/package/custom-ability) [![license](https://img.shields.io/npm/l/custom-ability.svg)](https://npmjs.org/package/custom-ability)

generate the ability which can be added to any class directly.
It makes custom ability more easy.

Sometimes, we still feel that the class is a liitle big, and  too many features in it.
We just need some of the features inside. So as a class developer can
consider these functions to extract, as a kind of ability to the user.


# API

just one function:

```js
var customAbility = require('custom-ability')
```

* customAbility(abilityClass[, coreMethod[, isGetClassFunction]])

__arguments__

* abilityClass *(function)*: the class will become to ability able.
* coreMethod *(string|array)*: optional must have coreMethod(s).
* isGetClassFunction *(boolean)*: the `AbilityClass` is a `function(aClass, aOptions)`
  to return the real `Ability Class` if true. defaults to false.

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
    * value: the new method function, if original method is exists or not in replacedMethods:
      * use `this.super()` to call the original method.
      * `this.self` is the original `this` object.
  * `classMethods` *(object)*: hooked class methods to the class
  * `replacedMethods` *(array)*: the method name in the array will be replaced the original
    method directly.

# Specification

## V1.3.x

+ add the replaceMethods option to custom ability function.
* **<broken change>**: additional abilities usage changed
  * separate ability options object.

* Put the '$abilities'*(object)* property on your prototype of class if need to modify
  the class before apply ability.
  * the `$abilities` object key is the AbilityClass Name
  * the value is the function to return the **ability options object**.

```coffee
AbstractObject = require('./lib/abstract-object')

AbstractObject.$abilities = {
  # "Eventable" is the AbilityClass name
  # the value is modified ability function.
  Eventable: require('./lib/eventable-options')
}

module.exports = AbstractObject
```

the [eventable-options.coffee](https://github.com/snowyu/abstract-object/blob/master/src/eventable-options.coffee) file:

```coffee
# eventable-options.coffee
module.exports = (aOptions)->
  aOptions = {} unless aOptions
  aOptions.methods = {} unless aOptions.methods
  extend aOptions.methods,
    # override methods:
    setObjectState: (value, emitted = true)->
      self= @self
      @super.call(self, value)
      self.emit value, self if emitted
      return
  ...
  return aOptions
  # more detail on [AbstractObject/src/eventable-options.coffee](https://github.com/snowyu/abstract-object)
```

the AbstractObject's 'eventable' function:

  ```coffee
  eventable         = require 'events-ex/eventable'
  eventableOptions  = require './eventable-options'

  module.exports = (aClass, aOptions)->
    eventable aClass, eventableOptions(aOptions)
  ```


## V1.2.x *(deprecated)*

* Put the 'ability.js' file in your NPM Package folder which means this can be
  as ability. So you can use this way to get the ability:

```coffee
ability  = require('custom-ability/require')

class MyClass
  #get the stateable ability from AbstractObject for MyClass
  ability 'abstract-object', MyClass
```

* Put the '$abilities'*(object)* property on your prototype of class if need to modify
  the class before apply ability.
  * the `$abilities` object key is the AbilityClass Name
  * the value is the modified ability function

```coffee
AbstractObject = require('./lib/abstract-object')

AbstractObject.$abilities = {
  # "Eventable" is the AbilityClass name
  # the value is modified ability function.
  Eventable: require('./eventable')
}

module.exports = AbstractObject
```

the AbstractObject's 'eventable' function:

```coffee
eventable         = require 'events-ex/eventable'

module.exports = (aClass)->
  eventable aClass, methods:
    # override methods:
    # we need to emit event when object state changes.
    setObjectState: (value, emitted = true)->
      self= @self
      @super.call(self, value)
      self.emit value, self if emitted
      return
    ...
# more detail on [AbstractObject/src/eventable](https://github.com/snowyu/abstract-object)
```


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

do not forget to add the `"ability.js"` file on your package root folder too.

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


## additional $abilities

In order to make certain ability to work, you need to modify some methods
of the class. this time we need the "additional abilities" now. eg, the
event-able ability to [AbstractObject](https://github.com/snowyu/abstract-object).
We need to send a notification event when the state of the object changes.
So the event-able of [AbstractObject](https://github.com/snowyu/abstract-object)
should be:

```coffee
eventable         = require 'events-ex/eventable'
eventableOptions  = require './eventable-options'

module.exports = (aClass, aOptions)->
  eventable aClass, eventableOptions(aOptions)
```

```coffee
# eventable-options.coffee
module.exports = (aOptions)->
  aOptions = {} unless aOptions
  aOptions.methods = {} unless aOptions.methods
  extend aOptions.methods,
    # override methods:
    setObjectState: (value, emitted = true)->
      self= @self
      @super.call(self, value)
      self.emit value, self if emitted
      return
  ...
  return aOptions
  # more detail on [AbstractObject/src/eventable-options.coffee](https://github.com/snowyu/abstract-object)
```

the original `eventable('events-ex/eventable')` is no useful for AbstractObject.

but we wanna the original `eventable('events-ex/eventable')` knows the changes
and use it automatically.

```coffee
eventable         = require 'events-ex/eventable'

class MyClass
  inherits MyClass, AbstractObject
  eventable MyClass
```

you just do this on the AbstractObject:

```coffee
AbstractObject = require('./lib/abstract-object')

AbstractObject.$abilities =
  # "Eventable" is the AbilityClass name
  Eventable: require('./lib/eventable-options')

module.exports = AbstractObject
```
