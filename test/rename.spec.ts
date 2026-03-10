import chai, { expect } from 'chai';
import { abilitiesSym, createAbilityInjector } from '../src/custom-ability';

const should = chai.should();

describe('custom-ability rename feature', function() {
  class MyAbility {
    static staticMethod() {
      return 'static';
    }
    instanceMethod() {
      return 'instance';
    }
  }

  const addAbility = createAbilityInjector(MyAbility);

  it('should rename instance method and exclude original', function() {
    class MyClass {}
    addAbility(MyClass, {
      rename: {
        instanceMethod: 'newMethod'
      }
    });

    const instance: any = new MyClass();
    instance.should.have.property('newMethod');
    instance.newMethod().should.equal('instance');
    instance.should.not.have.property('instanceMethod');
  });

  it('should rename getters and setters', function() {
    class AbilityWithAccessor {
      _val = 0;
      get value() { return this._val; }
      set value(v) { this._val = v; }
    }
    const addAccessor = createAbilityInjector(AbilityWithAccessor);
    class MyClass {}
    addAccessor(MyClass, {
      rename: { value: 'myValue' }
    });

    const instance: any = new MyClass();
    instance.myValue = 10;
    instance.myValue.should.equal(10);
    const desc = Object.getOwnPropertyDescriptor(MyClass.prototype, 'myValue');
    should.exist(desc?.get);
    should.exist(desc?.set);
  });

  it('should work with include option', function() {
    class MyClass {}
    // Even if not in include, renamed methods should persist because they are injected manually
    addAbility(MyClass, {
      include: ['someOtherMethod'],
      rename: { instanceMethod: 'newMethod' }
    });

    const instance: any = new MyClass();
    instance.should.have.property('newMethod');
  });

  it('should not conflict if original name is already in exclude', function() {
    class MyClass {}
    addAbility(MyClass, {
      exclude: ['instanceMethod'],
      rename: { instanceMethod: 'newMethod' }
    });

    const instance: any = new MyClass();
    instance.should.have.property('newMethod');
    instance.should.not.have.property('instanceMethod');
  });

  it('should fail if new name exists in target parent class', function() {
    class Parent {
      newMethod() {}
    }
    class Child extends Parent {}

    expect(() => {
      addAbility(Child, {
        rename: { instanceMethod: 'newMethod' }
      });
    }).to.throw('Rename failed: destination name "newMethod" already exists on target class.');
  });

  it('should be able to rename inherited methods from Ability class', function() {
    class BaseAbility {
      baseMethod() { return 'base'; }
    }
    class SubAbility extends BaseAbility {}
    const addSub = createAbilityInjector(SubAbility);

    class MyClass {}
    addSub(MyClass, {
      rename: { baseMethod: 'newBase' }
    });

    const instance: any = new MyClass();
    instance.newBase().should.equal('base');
    instance.should.not.have.property('baseMethod');
  });

  it('should fail if new name exists in target grandparent class', function() {
    class GrandParent {
      deepMethod() {}
    }
    class Parent extends GrandParent {}
    class Child extends Parent {}

    expect(() => {
      addAbility(Child, {
        rename: { instanceMethod: 'deepMethod' }
      });
    }).to.throw('Rename failed: destination name "deepMethod" already exists on target class.');
  });

  it('should rename non-function properties', function() {
    class AbilityWithProp {
      static sProp = 'static-prop';
    }
    (AbilityWithProp.prototype as any).iProp = 'instance-prop';

    const addProp = createAbilityInjector(AbilityWithProp);
    class MyClass {}
    addProp(MyClass, {
      rename: {
        iProp: 'myIProp',
        '@sProp': '@mySProp'
      }
    });

    const instance: any = new MyClass();
    instance.myIProp.should.equal('instance-prop');
    (MyClass as any).mySProp.should.equal('static-prop');
    instance.should.not.have.property('iProp');
    MyClass.should.not.have.property('sProp');
  });

  it('should rename core methods', function() {
    class AbilityWithCore {
      core() { return 'core'; }
      emit() {}
    }
    const addCore = createAbilityInjector(AbilityWithCore, 'emit');
    class MyClass {}
    addCore(MyClass, {
      rename: { emit: 'myEmit' }
    });

    const instance: any = new MyClass();
    instance.should.have.property('myEmit');
    // Note: coreMethod is special, but rename should still work if explicitly asked
    instance.should.not.have.property('emit');
  });

  it('should handle renaming to own name (no-op)', function() {
    class MyClass {}
    addAbility(MyClass, {
      rename: { instanceMethod: 'instanceMethod' }
    });

    const instance: any = new MyClass();
    instance.should.have.property('instanceMethod');
  });

  it('should support renaming in a factory function injector', function() {
    const factory = (aClass: any) => {
      return class DynamicAbility {
        dynamic() { return 'dynamic'; }
      }
    }
    const addDynamic = createAbilityInjector(factory, true);
    class MyClass {}
    addDynamic(MyClass, {
      rename: { dynamic: 'myDynamic' }
    });

    const instance: any = new MyClass();
    instance.myDynamic().should.equal('dynamic');
    instance.should.not.have.property('dynamic');
  });

  it('should prevent duplicate injection even with different renames', function() {
    class AbilityWithCore {
      emit() {}
      other() {}
    }
    const addAbilityWithCore = createAbilityInjector(AbilityWithCore, 'emit');
    class MyClass {}

    // First injection: rename emit to emit1
    addAbilityWithCore(MyClass, { rename: { emit: 'emit1' } });
    MyClass.prototype.should.have.property('emit1');
    MyClass.prototype.should.not.have.property('emit');

    // Second injection: try to rename emit to emit2
    addAbilityWithCore(MyClass, { rename: { emit: 'emit2' } });

    // Should NOT have emit2 because injection should have been prevented
    MyClass.prototype.should.not.have.property('emit2');
    // Internal metadata should still point to the first injection's ability function
    const abilities = (MyClass.prototype as any)[abilitiesSym];
    should.exist(abilities['$AbilityWithCore']);
  });

  it('should handle chain-like rename mapping correctly', function() {
    // Ability has method 'one' and 'two'
    // rename: { one: 'two', two: 'three' }
    // should result in 'two' (from one) and 'three' (from two)
    class MultiAbility {
      one() { return 1; }
      two() { return 2; }
    }
    const addMulti = createAbilityInjector(MultiAbility);
    class MyClass {}
    addMulti(MyClass, {
      rename: {
        one: 'two',
        two: 'three'
      }
    });

    const instance: any = new MyClass();
    instance.two().should.equal(1);
    instance.three().should.equal(2);
    instance.should.not.have.property('one');
  });

  it('should rename methods with "$" prefix', function() {
    class AbilityWith$ {
      $init() { return 'aop-init'; }
    }
    const addAbilityWith$ = createAbilityInjector(AbilityWith$);
    class MyClass {}
    addAbilityWith$(MyClass, {
      rename: { '$init': 'myInit' }
    });

    const instance: any = new MyClass();
    instance.myInit().should.equal('aop-init');
    instance.should.not.have.property('$init');
    instance.should.not.have.property('init');
  });

  it('should be able to rename inherited static methods from Ability class', function() {
    class BaseAbility {
      static baseStatic() { return 'base-static'; }
    }
    class SubAbility extends BaseAbility {}
    const addSub = createAbilityInjector(SubAbility);
    
    class MyClass {}
    addSub(MyClass, {
      rename: { '@baseStatic': '@newBaseStatic' }
    });

    (MyClass as any).newBaseStatic().should.equal('base-static');
    MyClass.should.not.have.property('baseStatic');
  });

  it('should let "methods" override "rename" when targeting the same name', function() {
    // If rename targets 'newName' and methods also defines 'newName', 
    // the methods definition should prevail.
    class MyClass {}
    const manualFn = () => 'manual';
    addAbility(MyClass, {
      rename: { instanceMethod: 'newMethod' },
      methods: {
        newMethod: manualFn
      }
    });

    const instance: any = new MyClass();
    instance.newMethod().should.equal('manual');
  });

  it('should isolate renames from multiple abilities', function() {
    class AbilityA { init() { return 'A'; } }
    class AbilityB { init() { return 'B'; } }
    const injectA = createAbilityInjector(AbilityA);
    const injectB = createAbilityInjector(AbilityB);

    class MyClass {}
    injectA(MyClass, { rename: { init: 'initA' } });
    injectB(MyClass, { rename: { init: 'initB' } });

    const instance: any = new MyClass();
    instance.initA().should.equal('A');
    instance.initB().should.equal('B');
    instance.should.not.have.property('init');
  });

  it('should rename static method and exclude original', function() {
    class MyClass {}
    addAbility(MyClass, {
      rename: {
        '@staticMethod': '@newStatic'
      }
    });

    (MyClass as any).should.have.property('newStatic');
    (MyClass as any).newStatic().should.equal('static');
    MyClass.should.not.have.property('staticMethod');
  });

  it('should throw error if new name already exists on target class', function() {
    class MyClass {
      existingMethod() {}
    }
    expect(() => {
      addAbility(MyClass, {
        rename: {
          instanceMethod: 'existingMethod'
        }
      });
    }).to.throw('Rename failed: destination name "existingMethod" already exists on target class.');
  });

  it('should throw error if source method does not exist in ability', function() {
    class MyClass {}
    expect(() => {
      addAbility(MyClass, {
        rename: {
          nonExistent: 'newMethod'
        }
      });
    }).to.throw('Rename failed: source method "nonExistent" not found in Ability.');
  });

  it('should support multiple renames and work with other options', function() {
    class MyClass {}
    addAbility(MyClass, {
      rename: {
        instanceMethod: 'myInstance',
        '@staticMethod': '@myStatic'
      }
    });

    const instance: any = new MyClass();
    instance.should.have.property('myInstance');
    (MyClass as any).should.have.property('myStatic');
    instance.should.not.have.property('instanceMethod');
    MyClass.should.not.have.property('staticMethod');
  });
});
