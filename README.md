# custom-ability [![Build Status](https://img.shields.io/travis/snowyu/custom-ability.js/master.png)](http://travis-ci.org/snowyu/custom-ability.js) [![npm](https://img.shields.io/npm/v/custom-ability.svg)](https://npmjs.org/package/custom-ability) [![downloads](https://img.shields.io/npm/dm/custom-ability.svg)](https://npmjs.org/package/custom-ability) [![license](https://img.shields.io/npm/l/custom-ability.svg)](https://npmjs.org/package/custom-ability)

This library provides a simple way to inject abilities into classes. An "ability"(a "mixin" class) is defined as a set of methods that can be added(injected) to a class to enhance its functionality.

Sometimes we may feel that a class is too large, containing too many features or methods. In such cases, as a developer, we can extract some of these functions as separate abilities, which users can use selectively based on their needs.

**Features:**

* Allows you to easily inject "abilities" (i.e. methods) from one class into another class, without needing to extend the target class.
* Can inject both static and instance methods.
* Allows you to specify a set of "core methods" for the ability class, which will be used to check if the ability has already been injected into a target class.
* Prevents the same ability from being injected multiple times into the same class.
  * The mechanism to prevent duplicate injection of the same ability is achieved through the `$abilities` member on the prototype of the target class. This member records all injected ability names (i.e. abilityClass.name).
  * It will traverse and check the parent classes of the target class until it finds the `$abilities`.
  * Additionally, if the `coreMethod` parameter is set, the first method name in `coreMethod` will also be checked in the target class.
* Supports optional include and exclude parameters, which allow you to specify which methods should be injected or excluded from injection.
* Supports optional methods and classMethods parameters, which allow you to inject additional methods into the target class.

**Usage:**

1. Define an ability class that contains the methods you want to inject into other classes.
2. Use the customAbility function to create a new function that can inject the ability into target classes.
3. Call the new function with the ability class and any optional parameters to inject the ability into a target class.

## Examples

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

```js
// ability.js
const makeAbility = require('custom-ability')

class RefCountable {
  // the class methods if any:
  static someClassMethod() {}

  //define the instance methods here:
  release() {
      let result = --this.RefCount
      if (result < 0) this.destroy()
      return result
  }

  free() {
    return this.release()
  }

  addRef() {
    if (!isUndefined(this.RefCount))
      ++this.RefCount
    else
      this.RefCount = 1
  }

}

// # We set the `addRef` method as the core methods.
// # The Core methods are the ability MUST have.
// # the first core method will be used to check the same ability whether the ability already added too.
module.exports = makeAbility(RefCountable, 'addRef')
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

```js
const addRefAbility = require('ref-object/ability')

class MyClass {
  destroy() {console.log('destroy')}
}

// someClassMethod would not be added to the class
addRefAbility(MyClass, exclude: '@someClassMethod')

const my = new MyClass

my.addRef() // add reference count
my.free() // dec reference count, do nothing
my.free() // now destroy, print the 'destroy' here.

```

More complicated example, you can see the [events-ex/src/eventable.coffee](https://github.com/snowyu/events-ex.js).

## additional $abilities

Another type of injection is the "additional abilities" that can be injected using the methods and classMethods parameters. These additional methods are necessary when modifying existing methods of the target class to call the old/original method to make a certain ability work.

The injected methods are encapsulated in a closure. And the passed `this` object inside the closure is not the original instance object, but `self`, and the original method is referred to as `super`.

In order to make certain ability to work, you need to modify some methods
of the class which could call the old(original) method. this time we need
the "additional abilities" now. eg, the event-able ability to [AbstractObject](https://github.com/snowyu/abstract-object).
We need to send a notification event when the state of the object changes(life cycle).
So the event-able of [AbstractObject](https://github.com/snowyu/abstract-object)
should be:

```js
const eventable         = require('events-ex/eventable')
const eventableOptions  = require('./eventable-options')

module.exports = function(aClass, aOptions){
  return eventable(aClass, eventableOptions(aOptions))
}
```

```js
// eventable-options.js
module.exports = function (aOptions){
  if (!aOptions) aOptions = {}
  if (!aOptions.methods) aOptions.methods = {}
  extend( aOptions.methods, {
    // override methods: (btw: classMethods to override the class methods)
    setObjectState(value, emitted = true) {
      // The injected methods are encapsulated in a closure.
      // The `this` object inside the closure is not the original instance object, but `self`, and the original method is referred to as `super`.
      self= this.self
      this.super.setObjectState.call(self, value)
      if (emitted) self.emit(value, self)
    }
  })
  ...
  return aOptions
  // more detail on [AbstractObject/src/eventable-options.coffee](https://github.com/snowyu/abstract-object)
}
```

**TODO: need to more explain:**
The original `eventable('events-ex/eventable')` is no useful for AbstractObject.

But we wanna the original `eventable('events-ex/eventable')` knows the changes
and use it automatically.

```js
const eventable         = require 'events-ex/eventable'

class MyClass extends AbstractObject {}
// inherits MyClass, AbstractObject
eventable(MyClass)
```

you just do this on the AbstractObject:

```js
const AbstractObject = require('./lib/abstract-object')

AbstractObject.$abilities = {
  // "Eventable" is the AbilityClass name
  Eventable: require('./lib/eventable-options')
}

module.exports = AbstractObject
```

## API

This library provides a function customAbility that can inject the abilities of a "mixin" class onto another target class or object.

Abilities can be defined as static or instance methods on the "mixin" class.

```js
var customAbility = require('custom-ability')
```

### customAbility(abilityClass: Function|object, coreMethod?: string|string[], isGetClassFunction = false): WithAbilityFn

The injected abilities are provided by the `abilityClass` parameter, which is expected to be a class. The function takes the following parameters:

**arguments**

* `abilityClass` *(function)*: the class that provides the abilities to be injected
* `coreMethod` *(string|arrayOf string)*: optional must have coreMethod(s).
  * a string or an array of strings that represent core methods of the abilityClass.
  * And if one or more of these methods are present in the target class, the ability will not be injected.
  * **note**: `@` prefix means class/static method.
* `isGetClassFunction` *(boolean)*: the `AbilityClass` is a `function(aClass, aOptions)`
  to return the real `Ability Class` if true. defaults to false.
  * Whether abilityClass should be invoked with aClass and aOptions to get the actual ability class.


**return**

* *(function)*: a function which can inject the ability to any class directly.

the function customAbility should be modified its name.
function customAbility(abilityClass: Function|object, coreMethod?: string|string[], isGetClassFunction = false): WithAbilityFn

The exported function returns another function (`WithAbilityFn(targetClass, options?: {include?: string|string[], exclude?: string|string[], methods? : {[name: string]: Function}, , classMethods? : {[name: string]: Function}}): targetClass`) that takes two parameters:

This custom ability injection function has two arguments: `function(class[, options])`

* `class`: the target class to be injected the ability.
* `options` *(object)*: an optional options object that can contain the following properties:
  * `include`*(array|string)*: only these methods will be added(injected) to the class
    * **note**: `@` prefix means class/static method.
  * `exclude`*(array|string)*: these methods would not be added(injected) to the class
    * **note**: the `coreMethod` could not be excluded. It's always added(injected) to the class.
    * **note**: `@` prefix means class/static method.
  * `methods`*(object)*: injected/hooked methods to the class
    * key: the method name to hook.
    * value: the new method function, if original method is exists:
      * use `this.super()` to call the original method.
      * `this.self` is the original `this` object.
  * `classMethods` *(object)*: hooked class methods to the class, it's the same usage as the `methods`.

## Specification

### V1.6.2

* fix: use replace instead inject method if there is no such method on the target

  ```javascript
  const makeAbility = require('custom-ability')
  class Feature {
    $init() {
      const Super = this.super
      const that = this.self || this
      if (Super) {
        if (Super.apply(that, arguments) === 'ok') return
      }
      that._init.apply(that, arguments)
    }
    _init() {console.log('feature init')}
  }
  Feature.prototype.init = function() {this._init.apply(this, arguments)}
  const addFeatureTo = makeAbility(Feature)

  class My {
  }
  addFeatureTo(My)
  expect(My.prototype.init).toStrictEqual(Feature.prototype.init)
  ```

* fix(1.6.1): the injectMethods(AOP) starting with "$" was incorrectly replaced with the original method

  ```js
  const makeAbility = require('custom-ability')
  class Feature {
    // inject to the init method on target class
    $init() {
      const Super = this.super
      const that = this.self || this
      if (Super) {
        if (Super.apply(that, arguments) === 'ok') return
      }
      that._init.apply(that, arguments)
    }
    _init() {console.log('feature init')}
  }
  Feature.prototype.init = function() {this._init.apply(this, arguments)}
  const addFeatureTo = makeAbility(Feature)

  class My {
    init(doInitFeature = true) {
      // the my init procedure
      console.log('my init')
      if (!doInitFeature) return 'ok'
    }
  }
  addFeatureTo(My)
  const obj = new My
  obj.init()
  // my init
  // feature init
  obj.init(false)
  // my init
  ```


### V1.6.0

* **broken change** The methods in ES6 Class all are non-enumerable. So they have an ability to call `super` method too if the target has the same method.

```javascript
const createAbility = require('custom-ability')
class MyFeature {
  static coreAbilityClassMethod(){};
  coreAbilityMethod(){};
  init(){
    const Super = this.super // the original init method
    const that = this.self || this // the instance
    if (Super) {
      Super.apply(that, arguments)
    }
    // do the init from MyFeature
    console.log('init from MyFeature')
  };
}

const addFeatureTo = createAbility(MyFeature, ['coreAbilityMethod', '@coreAbilityClassMethod']);

class MyClass {
  init(hi) {
    console.log('init from MyClass', hi)
  }
}
// inject the static and instance methods to the MyClass.
addFeatureTo(MyClass);
const instance = new MyClass;
instance.init('hello');

```

### V1.5.0

* **broken change** the class method name conversation to: `@` prefix means class/static method.
  * include/exclude
  * coreMethod

### V1.4.x

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
    Test: -> # additional ability to Test
      methods:
        additional:->
        two: ->
class Mid
  inherits Mid, Root
  $abilities:
    Test: -> # additional ability to Test
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

### V1.3.3

+ use the injectMethods(AOP) for the methods of non-enumerable and beginning with '$' in an ability
  to call `super` method if the target has the same method. you can exclude it with normal name if it's not a core method.

```coffee
customAbility = require 'custom-ability'

class PropertyManagerAbility
  constructor: ->@initialize.call @, arguments[gOptPos]
  # the non-enumerable property and beginning with '$' will
  # be injected to `initialize` method
  defineProperty @::, '$initialize', ->
    options = arguments[gOptPos]
    options?={}
    that = @
    if @super and @self
      inherited = @super
      that = @self
      inherited.apply(that, arguments)
    that._initialize options if isFunction that._initialize
    that.defineProperties(options.attributes)
    that.assign(options)

module.exports = customAbility PropertyManagerAbility, 'assign'
```

### V1.3.x

* add the replaceMethods option to custom ability function.
* **`<broken change>`**: additional abilities usage changed
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

### V1.2.x *(deprecated)*

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
      this.super.call(self, value)
      self.emit value, self if emitted
      return
    ...
# more detail on [AbstractObject/src/eventable](https://github.com/snowyu/abstract-object)
```
