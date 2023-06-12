# custom-ability [![Build Status](https://img.shields.io/travis/snowyu/custom-ability.js/master.png)](http://travis-ci.org/snowyu/custom-ability.js) [![npm](https://img.shields.io/npm/v/custom-ability.svg)](https://npmjs.org/package/custom-ability) [![downloads](https://img.shields.io/npm/dm/custom-ability.svg)](https://npmjs.org/package/custom-ability) [![license](https://img.shields.io/npm/l/custom-ability.svg)](https://npmjs.org/package/custom-ability)

This library provides a simple way to inject abilities into classes. An "ability"(a "mixin" class) is defined as a set of methods that can be added(injected) to a class to enhance its functionality.

Sometimes we may feel that a class is too large, containing too many features or methods. In such cases, as a developer, we can extract some of these functions as separate abilities, which users can use selectively based on their needs.

## Features

* Allows you to easily inject "abilities" (i.e. methods) from one class into another class, without needing to extend the target class.
* Can inject both static and instance methods.
* Allows the ability class to **overload** an existing method in the target class with its own implementation, while still being able to call the original implementation of the method in the target class
  * These methods should be **non-enumerable members** in the target class. All methods defined in an ES6 class are **non-enumerable**.
  * Which allows the ability to modify or supplement the behavior of the original method without fully replacing its functionality.
* Allows you to specify a set of "core methods" for the ability class, which will be used to check if the ability has already been injected into a target class.
* Prevents the same ability from being injected multiple times into the same class.
  * The mechanism to prevent duplicate injection of the same ability is achieved through the `$abilities` member on the prototype of the target class. This member records all injected ability names (i.e. abilityClass.name).
  * It will traverse and check the parent classes of the target class until it finds the `$abilities`.
  * Additionally, if the `coreMethod` parameter is set, the first method name in `coreMethod` will also be checked in the target class.
* Supports optional include and exclude parameters, which allow you to specify which methods should be injected or excluded from injection.
* Supports optional methods and classMethods parameters, which allow you to inject/**overwrite** additional methods into the target class.
* Supports optional additional abilities

## Method overloading(Replace Exists Methods)

All methods defined in an ES6 class are **non-enumerable**, which means that the ability injection system enables **method overloading** for all methods in the class. If a method is not defined in an ES6 class, it may be enumerable and will be overwritten directly with the ability's own implementation.

### The Advance Method overloading

if you wanna “replace” and call the methods that already exist in a class, you can add the same method name prefixed with "`$`" on the ability class, add call the original method in this way:

```javascript
const createAbilityInjector = require('custom-ability')

class Feature {
 // the same method name prefixed with "`$`"
 $init() {
   // the original method in target class
   const Super = this.super
   const that = this.self || this
   if (Super) {
     if (Super.apply(that, arguments) === 'ok') return
   }
   that._init.apply(that, arguments)
 }
 _init() {console.log('feature init')}
}
// if the target class has no the init method, it(the enumerable method) will be injected
Feature.prototype.init = function() {this._init.apply(this, arguments)}
const addFeatureTo = createAbilityInjector(Feature)

class My {}

addFeatureTo(My)
expect(My.prototype.init).toStrictEqual(Feature.prototype.init)

class My2 {
  init() {console.log('My2 init')}
}

addFeatureTo(My2)
expect(My2.prototype.init).toStrictEqual(Feature.prototype.$init)

```

## Usage

1. Define an ability class that contains the static members or instance members you want to inject into other classes.
2. Use the `createAbilityInjector` function to create an injector function that can inject the ability into target classes.
3. Call the new injector function with any optional parameters to inject the ability into a target class.

## Examples

Suppose we wanna add the `RefCount` ability to any class directly.

The `RefCount` ability enables `reference counting`, which helps track and manage instances of the class more easily. When a new reference to an instance is created, the addRef method is called, and when the reference is released, the release method is called. This enables the RefCount ability to keep track of the number of references to the instance and automatically free up memory when the last reference is released. This can be helpful when working with resources or objects that have complex lifecycle management requirements.

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
import {createAbilityInjector} from 'custom-ability'

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
export const refCountable = createAbilityInjector(RefCountable, 'addRef')
export default refCountable
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
addRefAbility(MyClass, {exclude: '@someClassMethod'})

const my = new MyClass

my.addRef() // add reference count
my.free() // dec reference count, do nothing
my.free() // now destroy, print the 'destroy' here.

```

More complicated example, you can see the [events-ex/src/eventable.js](https://github.com/snowyu/events-ex.js).

## Additional Abilities($abilities)

The additional abilities injection feature provides a way to add more functionality to an injected ability by injecting other abilities that are dependent on it. This allows injected abilities to be more modular and flexible, and enables developers to compose complex behavior by combining multiple smaller abilities. The additional injection feature is especially useful when working with large, complex classes that require a lot of functionality, as it allows developers to break down the functionality into smaller, more manageable pieces that can be injected separately and combined together as needed.

Another type of injection is the "**Additional Abilities**" that can be injected using the methods and classMethods parameters. These additional methods are necessary when modifying existing methods of the target class to call the old/original method to make a certain ability work.

The additional abilities injection feature allows injected abilities to work together and support each other. When a dependent ability is injected, any additional abilities associated with it will also be injected. For example, if a target class has the `refCountable` ability injected and the `eventable` ability is also added, the `refCountable` ability will support events because it has been configured to inject additional methods that are compatible with the eventable ability.

```ts
import {AbilityInjectorOptions, abilitiesSym, AdditionalInjectionMode, createAbilityInjector} from 'custom-ability';

class RefCountable {
  static someClassMethod() {}

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

const injectorOptions: AbilityInjectorOptions = {
  depends: {
    Eventable: {
      mode: AdditionalInjectionMode.target,
      getOpts() {
        // These methods will be injected when the eventable ability is injected
        methods: {
          release() {const self = this.self; this.super(); self.emit('release', self.RefCount);},
          addRef() {const self = this.self; this.super(); self.emit('addRef', self.RefCount);},
        }
      }
    }
  }
}

export const refCountable = createAbilityInjector(RefCountable, 'addRef', injectorOptions)
export default refCountable
```

In the provided code example, the `refCountable` ability is defined using `createAbilityInjector`, and the `injectorOptions` object is passed to configure it. The `injectorOptions` object specifies that when the `Eventable` ability is injected, additional methods (`release` and `addRef`) should be injected into the target class that are compatible with the `eventable` ability. This ensures that the refCountable ability can work with the `eventable` ability and support events.

The injected methods are encapsulated in a closure. And the passed `this` object inside the closure is not the original instance object, but `self`, and the original method is referred to as `super` which is already bind to original `this`.


`AdditionalInjectionMode` provides flexibility in how additional abilities are injected into a target class, allowing developers to choose the mode that best fits their use case. The all mode injects additional abilities into all classes in the inheritance chain that are related to the ability being injected, while the target mode only injects the additional abilities into the target class itself. This can be useful when injecting abilities with different dependencies or when multiple abilities need to be injected into the same class.


AdditionalInjectionMode is an option for createAbilityInjector that controls how additional abilities are injected into a target class.

* The `all` mode is the default mode, which injects the additional ability into all classes in the target class's inheritance chain that have a `$abilities` own property containing a key that matches the ability being injected. The ability being injected is also injected into the "base" class (the farthest class in the inheritance chain that has the `$abilities` own property) rather than the target class itself. This mode is useful when the injected abilities have dependencies on the ability being injected and need to be applied to all derived classes.
* The `target` mode, on the other hand, only injects the additional ability into the target class itself, rather than all classes in the inheritance chain. This mode is useful when injecting abilities with dependency parameters, such as in the refCountable example code provided earlier, where the eventable ability should be injected with method overloads on the same class where refCountable is injected, rather than on the class where refCountable is defined.

**Note**: The methods must be **non-enumerable members** of the target class.

**Note**: Once an ability has been injected into a target class, excluding certain methods of that ability may cause some additional abilities to become ineffective if they depend on the excluded methods. Currently, by adding a `required` parameter to the `AdditionalAbility` object, which specifies a list of method names that the additional ability must have in order to be injected into the target class. If the target class does not have these required methods, the additional ability will not be injected.

BREAK CHANGE(from v1 to v2):

```ts
import {AbilityOptions, abilitiesSym, createAbilityInjector} from 'custom-ability';

function testableOpts(options?: AbilityOptions) {
  return {
    methods: {
      additional: function() {}
    }
  };
};


// CAN NOT WORK NOW
// My.prototype[abilitiesSym] = {
//   MyAbility: testableOpts
// };

// Changed to this:
My.prototype[abilitiesSym] = {
  MyAbility: {getOpts: testableOpts}
};

```

In order to make certain ability to work, you need to modify some methods
of the class which could call the old(original) method. this time we need
the "Additional Abilities" now. eg, the event-able ability to [AbstractObject@v2](https://github.com/snowyu/abstract-object).

We need to send a notification event when the state of the object changes(life cycle).
So the event-able of [AbstractObject@v2](https://github.com/snowyu/abstract-object)
should be:

```js
// src/stateable.js
import {AdditionalInjectionMode, createAbilityInjector} from 'custom-ability'
import additionalOptions from './eventable-options'

//...

const stateableOptions = {
  depends: {
    Eventable: {
      mode: AdditionalInjectionMode.target,
      getOpts: additionalOptions,
    }
  }
}

export const stateable = createAbilityInjector(Stateable, 'objectState', stateableOptions)
export default stateable

```

```js
// src/eventable-options.js
export let MAX_LISTENERS = 2e308

export function eventableOptions(aOptions) {
  const result = {methods: {}, required: ['setMaxListeners', 'emit']}
  const maxListeners = (aOptions && aOptions.maxListeners) || MAX_LISTENERS

  extend(result.methods, {
    // ...
    setObjectState(value, emitted) {
      if (emitted == null) {
        emitted = true
      }
      const self = this.self
      this["super"].call(self, value)
      if (emitted) {
        self.emit(value, self)
      }
    },
    // ...
  })
}

export default eventableOptions
```

Now, the MyClass(AbstractObject) will support the event ability when eventable the MyClass.

```js
import {AbstractObject} from 'abstract-object'
import {eventable} from 'events-ex'

class MyClass extends AbstractObject {}
eventable(MyClass)
```


## API

Full API see the folder: [docs](docs/modules.md)

This library provides a function customAbility that can inject the abilities of a "mixin" class onto another target class or object.

Abilities can be defined as static or instance methods on the "mixin" class.

```js
import {createAbilityInjector} from 'custom-ability'

```

### createAbilityInjector(abilityClass: Function|object, coreMethod?: string|string[], isGetClassFunction = false, injectorOpts?: AbilityInjectorOptions): WithAbilityFn

Creates a injector function that adds(injects) the ability to the target class based on the ability class.

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
* `injectorOpts` An optional injector options object, usage see the Additional Ability

**return**

* *(function)*: a function which can inject the ability to any class directly.

The exported function returns the injector function (`WithAbilityFn(targetClass, options?: {include?: string|string[], exclude?: string|string[], methods? : {[name: string]: Function}, , classMethods? : {[name: string]: Function}}): targetClass`) that takes two parameters:

* `targetClass`: the target class to be injected the ability.
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

### V2

* Transpile to ESM Format in lib/esm folder
* Export all helper functions on index.js
* TypeScript supports
* NodeJS >= 12
* **broken change** `require` rename to `requireAbility`
* **broken change** The additional ability options total changed.
* **broken change** Add new injectorOpts option to createAbilityInjector for optional depends AdditionalAbility
* **broken change** Support multi AdditionalAbilities on the same ability. The AdditionalAbity option is total changed. see AdditionalAbility type
* fix: should inject the static methods on the same class for ES6 Class and inherits-ex supports static member inheritance now
* refactor(**broken change**): the injector will return the injected class if already injected
* fix: should not duplicate inject additional abilities on base class
* fix: can not inject all inherited AdditionalAbility on ES6 Class

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
