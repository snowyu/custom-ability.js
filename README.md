### custom-ability [![Build Status](https://img.shields.io/travis/snowyu/custom-ability.js/master.png)](http://travis-ci.org/snowyu/custom-ability.js) [![npm](https://img.shields.io/npm/v/custom-ability.svg)](https://npmjs.org/package/custom-ability) [![downloads](https://img.shields.io/npm/dm/custom-ability.svg)](https://npmjs.org/package/custom-ability) [![license](https://img.shields.io/npm/l/custom-ability.svg)](https://npmjs.org/package/custom-ability)

generate the ability which can be added to any class directly.
It makes custom ability more easy.

Sometimes, we still feel that the class is a liitle big, and  too many features in it.
We just need some of the features(methods) inside. So as a class developer can
consider these functions to extract, as a kind of ability to the user.


## Usage

Suppose we wanna add the RefCount ability to any class directly.

the `RefCount` ability will add the following members to your class.
and you should implement the `destroy` method which will be called
by `release`/`free`.

* properties:
  * `RefCount` *(integer)*: the reference count.
* methods:
  * `release()`/`free()`: Decrements reference count for this instance.
    If it is becoming less than 0, the object would be (self) destroyed.
  * `addRef()`: Increments the reference count for this instance
    and returns the new reference count.

**Note**: The same name of the methods will be replaced via the ability.
These old methods will be lost. So, you must confirm whether there are the
same methods in your class before you apply the new ability.

```coffee
# ability.coffee
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

# We set the `addRef` method as the core methods.
# The Core methods are the ability MUST have.
# they're used to check the same ability whether the ability already added.
module.exports = customAbility RefCountable, 'addRef'

```

Do not forget to add the `"ability"` keyword to your package.json which means
the ability power with it.

```js
// package.json
"keywords": [
  "ability",
  ...
],
```

Do not forget to add the `"ability.js"` file on your package root folder too.

now user use this ability like this:

```coffee
refable = require 'ref-object/ability'

class MyClass
  refable MyClass, exclude: '@someClassMethod' #someClassMethod would not be added to the class
  destroy: ->console.log 'destroy'

my = new MyClass

my.addRef()
my.free() # nothing
my.free() # print the 'destroy' here.

```

More complicated example, you can see the [events-ex/src/eventable.coffee](https://github.com/snowyu/events-ex.js).


## additional $abilities

In order to make certain ability to work, you need to modify some methods
of the class which could call the old(original) method. this time we need
the "additional abilities" now. eg, the event-able ability to [AbstractObject](https://github.com/snowyu/abstract-object).
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
    # override methods: (btw: classMethods to override the class methods)
    setObjectState: (value, emitted = true)->
      self= @self
      @super.call(self, value)
      self.emit value, self if emitted
      return
  ...
  return aOptions
  # more detail on [AbstractObject/src/eventable-options.coffee](https://github.com/snowyu/abstract-object)
```

**TODO: need to more explain:**
The original `eventable('events-ex/eventable')` is no useful for AbstractObject.

But we wanna the original `eventable('events-ex/eventable')` knows the changes
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

# API

just one function:

```js
var customAbility = require('custom-ability')
```

## customAbility(abilityClass[, coreMethod[, isGetClassFunction]])

__arguments__

* abilityClass *(function)*: the class will become to ability able.
* coreMethod *(string|arrayOf string)*: optional must have coreMethod(s).
  * **note**: `@` prefix means class/static method.
* isGetClassFunction *(boolean)*: the `AbilityClass` is a `function(aClass, aOptions)`
  to return the real `Ability Class` if true. defaults to false.

__return__

* *(function)*: a function which can inject the ability to any class directly.

This custom ability injection function has two arguments: `function(class[, options])`

* `class`: the class to be injected the ability.
* `options` *(object)*: optional options
  * `include `*(array|string)*: only these methods will be added to the class
    * **note**: `@` prefix means class/static method.
  * `exclude `*(array|string)*: these methods would not be added to the class
    * **note**: the `coreMethod` could not be excluded. It's always added to the class.
    * **note**: `@` prefix means class/static method.
  * `methods `*(object)*: injected/hooked methods to the class
    * key: the method name to hook.
    * value: the new method function, if original method is exists or not in replacedMethods:
      * use `this.super()` to call the original method.
      * `this.self` is the original `this` object.
  * `classMethods` *(object)*: hooked class methods to the class, it's the same usage as the `methods`.
  * `replacedMethods` *(array)*: the method name in the array will be replaced the original
    method directly.


# Specification

## V1.5.0

* **broken change** the class method name conversation to: `@` prefix means class/static method.
  * include/exclude
  * coreMethod

## V1.4.x

* Inject additional ability to each parent classes When the some parent classes has additional ability,
  and mark it has been injected. note: the additional ability does not include the ability itself.
* The methods of ability itself will be injected to the `farthest` parent class if possible. The static
  methods of it will be inject to the current class, and mark it has been injected too.
* Known Issues:
  * the `middle` parent classes has no the static methods of ability.

```coffee

customAbility = require 'custom-ability'

class Test
  one: ->
  @one: ->

testable = customAbility Test #convert the class to testable ability

class Root
  $abilities:
    Test: -> # additinal ability to Test
      methods:
        additional:->
        two: ->
class Mid
  inherits Mid, Root
  $abilities:
    Test: -> # additinal ability to Test
      methods:
        additional:-> Mid.__super__.additional.apply(@, arguments)
        three: ->
class A
  inherits A, Mid
  testable A # make the class A testable.

# A should have all static methods of Test
# Mid,Root should have no any methods of Test
for k, v of Test
  Mid.should.not.have.ownProperty k
  Root.should.not.have.ownProperty k
  A.should.have.ownProperty k
  v.should.be.equal A[k]


# A and Mid should have no any methods of Test
# the Root should have all methods of Test
for k, v of Test::
  A::should.not.have.ownProperty k
  Mid::should.not.have.ownProperty k
  Root::should.have.ownProperty k

# Root should have additional methods:
Root::should.have.ownProperty 'additional'
Root::should.have.ownProperty 'two'

Mid::should.have.ownProperty 'additional'
Mid::should.have.ownProperty 'three'

```

## V1.3.3

+ use the injectMethods(AOP) for the methods of non-enumerable and beginning with '$' in an ability
  to call `super` method. you can exclude it with normal name if it's not a core method.

```coffee
customAbility = require 'custom-ability'

class PropertyManagerAbility
  constructor: ->@initialize.call @, arguments[gOptPos]
  # the non-enumerable property and beginning with '$' will
  # be injected to `initialize` method
  defineProperty @::, '$initialize', ->
    options = arugments[gOptPos]
    options?={}
    that = @
    if @super and @self
      inherited = @super
      that = @self
      inherited.apply(that, arugments)
    that._initialize options if isFunction that._initialize
    that.defineProperties(options.attributes)
    that.assign(options)

module.exports = customAbility PropertyManagerAbility, 'assign'
```

## V1.3.x

+ add the replaceMethods option to custom ability function.
* **<broken change>**: additional abilities usage changed
  * separate ability options object.

* Put the '$abilities'*(object)* property on your prototype of class if need to modify
  the class before apply ability.
  * the `$abilities` object key is the AbilityClass Name
  * the value is the function to return the **ability options object**.

The AbstractObject need to hook some methods to make the eventable ability work correctly.

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
