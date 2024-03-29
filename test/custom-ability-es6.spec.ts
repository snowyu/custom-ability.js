import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
const should = chai.should();
import { assert } from 'chai';
chai.use(sinonChai);
import path from 'path';
// import inherits from 'inherits-ex/lib/inherits';
import {inherits, defineProperty} from 'inherits-ex'
import {AdditionalInjectionMode, abilitiesSym, abilitiesOptSym, createAbilityInjector} from '../src/custom-ability';

var setImmediate = setImmediate || process.nextTick;

function all_stub_reset(obj) {
  for (let k in obj) {
    const v = obj[k];
    if (v && v.resetHistory) v.resetHistory();
  }
}

describe('customAbility with es6', function() {
  class MyAbility {
    one: sinon.SinonSpy<any[], any>;
    two: sinon.SinonSpy<any[], any>;
    three: sinon.SinonSpy<any[], any>;
    emit: sinon.SinonSpy<any[], any>;
    static cone: sinon.SinonSpy<any[], any>;
    static ctwo: sinon.SinonSpy<any[], any>;
    static class: any;
};

  MyAbility.prototype.one = sinon.spy();

  MyAbility.prototype.two = sinon.spy();

  MyAbility.prototype.three = sinon.spy();

  MyAbility.prototype.emit = sinon.spy();

  MyAbility.cone = sinon.spy();

  MyAbility.ctwo = sinon.spy();


  const testable = createAbilityInjector(MyAbility, 'emit');
  beforeEach(function() {
    all_stub_reset(MyAbility);
    all_stub_reset(MyAbility.prototype);
  });

  function myAbilityCheck(result) {
    var k, ref, results, v;
    for (k in MyAbility) {
      v = MyAbility[k];
      v.should.be.equal(result[k]);
    }
    ref = MyAbility.prototype;
    results = [];
    for (k in ref) {
      v = ref[k];
      results.push(v.should.be.equal(result.prototype[k]));
    }
    return results;
  };
  it('should create a simple ability', function() {
    class MyFeature {
      static additionalClassMethod: () => void;
      static coreAbilityClassMethod(){};
      coreAbilityMethod(){};
      additionalAbilityMethod(){};
    }
    MyFeature.additionalClassMethod = function() {}

    const addFeatureTo = createAbilityInjector(MyFeature, ['coreAbilityMethod', '@coreAbilityClassMethod']);

    class MyClass {
      someMethod() {}
    }
    // inject the static and instance methods to the MyClass.
    addFeatureTo(MyClass);
    MyClass.should.have.ownProperty('coreAbilityClassMethod')

  });
  it('should add non-enumerable attributes', function() {
    class MyFeature {
      static additionalClassMethod: () => void;
      static coreAbilityClassMethod(){};
      static get getter(){return 1}
      static field = 1

      get getter(){return 1}
      coreAbilityMethod(){};
      additionalAbilityMethod(){};
    }
    MyFeature.additionalClassMethod = function() {}

    const addFeatureTo = createAbilityInjector(MyFeature, ['coreAbilityMethod', '@coreAbilityClassMethod']);

    class MyClass {
      someMethod() {}
    }
    // inject the static and instance methods to the MyClass.
    addFeatureTo(MyClass);
    MyClass.should.have.ownProperty('coreAbilityClassMethod')
    let prop = Object.getOwnPropertyDescriptor(MyFeature, 'getter')
    prop!.get!.should.be.a('function');
    Object.getOwnPropertyDescriptor(MyClass, 'getter')!.should.have.ownProperty('get', prop!.get)
    prop = Object.getOwnPropertyDescriptor(MyFeature.prototype, 'getter')
    Object.getOwnPropertyDescriptor(MyClass.prototype, 'getter')!.should.have.ownProperty('get', prop!.get)
    prop = Object.getOwnPropertyDescriptor(MyFeature, 'field')
    Object.getOwnPropertyDescriptor(MyClass, 'field')!.should.have.ownProperty('value', 1)
  });
  it('should not overwrite an empty function', function() {
    class MyFeature {
      static additionalClassMethod: () => void;
      static coreAbilityClassMethod(){};
      static emptyMethod(){}

      coreAbilityMethod(){};
      additionalAbilityMethod(){};
    }
    MyFeature.additionalClassMethod = function() {}
    const addFeatureTo = createAbilityInjector(MyFeature, ['coreAbilityMethod', '@coreAbilityClassMethod']);

    function emptyMethod(){console.log("MyClass")}
    class MyClass {
      declare static emptyMethod: Function
      someMethod() {}
    }
    defineProperty(MyClass, 'emptyMethod', emptyMethod)
    // inject the static and instance methods to the MyClass.
    addFeatureTo(MyClass);
    MyClass.should.have.ownProperty('emptyMethod', emptyMethod)
  });
  it('could use getAbilityClass', function() {
    var My, getAbilityClass, result, testable1;
    My = class My {};
    getAbilityClass = function(aClass) {
      return MyAbility;
    };
    testable1 = createAbilityInjector(getAbilityClass, true);
    result = testable1(My);
    result.should.be.equal(My);
    return myAbilityCheck(result);
  });
  it('could get AbilityClass when no aClass passing', function() {
    var My, testable1;
    testable1 = createAbilityInjector(MyAbility);
    My = testable1();
    return My.should.be.equal(MyAbility);
  });
  it('could no inject if have already static coreMethod', function() {
    var My, testable1;
    testable1 = createAbilityInjector(MyAbility, '@cone');
    My = (function() {
      class My {
        static cone: number;
};

      My.cone = 12;

      return My;

    }).call(this);
    testable1(My);
    return My.should.have.property('cone', 12);
  });
  it('could have no coreMethod', function() {
    var k, result, results, testable1;
    testable1 = createAbilityInjector(MyAbility);
    class Root {};
    class My {};

    inherits(My, Root);

    result = testable1(Root);
    result.should.be.equal(Root);
    myAbilityCheck(result);
    result = testable1(My);
    result.should.be.equal(Root);
    for (k in MyAbility) {
      should.exist(result[k], k);
    }
    for (k in MyAbility.prototype) {
      My.prototype.should.not.have.ownProperty(k);
      My.prototype.should.have.property(k);
    }
  });
  it('should add multi abilities on same class', function() {
    var My, Root, k, ref, ref1, result, results, testable1, testable2, v;
    class OtherAbility {
      ding() {}

      static sth() {}

    };
    testable1 = createAbilityInjector(MyAbility);
    testable2 = createAbilityInjector(OtherAbility);
    Root = class Root {};
    My = (function() {
      class My {};

      inherits(My, Root);

      return My;

    }).call(this);
    result = testable1(Root);
    result.should.be.equal(Root);
    for (k in MyAbility) {
      v = MyAbility[k];
      v.should.be.equal(result[k]);
    }
    ref = MyAbility.prototype;
    for (k in ref) {
      v = ref[k];
      v.should.be.equal(result.prototype[k]);
    }
    result = testable1(My);
    result.should.be.equal(Root);
    for (k in MyAbility) {
      should.exist(result[k], k);
    }
    for (k in MyAbility.prototype) {
      My.prototype.should.not.have.ownProperty(k);
      My.prototype.should.have.property(k);
    }
    result = testable2(Root);
    result.should.be.equal(Root);
    for (k in OtherAbility) {
      v = OtherAbility[k];
      v.should.be.equal(result[k]);
    }
    ref1 = OtherAbility.prototype;
    for (k in ref1) {
      v = ref1[k];
      v.should.be.equal(result.prototype[k]);
    }
    result = testable2(My);
    result.should.be.equal(Root);
    for (k in OtherAbility) {
      should.exist(result[k], k);
    }
    for (k in OtherAbility.prototype) {
      My.prototype.should.not.have.ownProperty(k);
      My.prototype.should.have.property(k);
    }
  });
  it('should add methods and class methods to a class', function() {
    var My, k, ref, results, v;
    My = function() {};
    testable(My).should.be.equal(My);
    for (k in MyAbility) {
      v = MyAbility[k];
      v.should.be.equal(My[k]);
    }
    ref = MyAbility.prototype;
    results = [];
    for (k in ref) {
      v = ref[k];
      results.push(v.should.be.equal(My.prototype[k]));
    }
    return results;
  });
  it('should use getClass function to make ability ', function() {
    var My, fn, k, ref, testable1, v;
    fn = function(aClass, aOptions) {
      MyAbility.class = aClass;
      return MyAbility;
    };
    testable1 = createAbilityInjector(fn, 'emit', true);
    My = function() {};
    testable1(My).should.be.equal(My);
    for (k in MyAbility) {
      v = MyAbility[k];
      v.should.be.equal(My[k]);
    }
    ref = MyAbility.prototype;
    for (k in ref) {
      v = ref[k];
      v.should.be.equal(My.prototype[k]);
    }
    should.exist(MyAbility.class);
    MyAbility.class.should.be.equal(My);
    return delete MyAbility.class;
  });
  it('should get proper aClass in getClass function to make ability ', function() {
    let My, MyA, k, my, ref, testable1, v;
    MyA = undefined;
    function fn(aClass, aOptions) {
      var MyAbility1;
      return MyA = MyAbility1 = (function() {
        class MyAbility1 {
          emit: sinon.SinonSpy<any[], any>;
          one: any;
          static count: number;
        };

        MyAbility1.prototype.emit = sinon.spy();

        MyAbility1.prototype.one = sinon.spy(function() {
          should.exist(aClass, 'aClass');
          return aClass.should.have.property('count', 1);
        });

        MyAbility1.count = 1;

        return MyAbility1;

      }).call(this);
    };
    testable1 = createAbilityInjector(fn, 'emit', true);
    My = function() {};
    testable1(My).should.be.equal(My);
    for (k in MyA) {
      v = MyA[k];
      v.should.be.equal(My[k]);
    }
    ref = MyA.prototype;
    for (k in ref) {
      v = ref[k];
      v.should.be.equal(My.prototype[k]);
    }
    my = new My();
    my.one();
    return my.one.should.be.calledOnce;
  });
  it('should only include methods', function() {
    var My, keys;
    My = function() {};
    testable(My, {
      include: ['one', '@ctwo']
    });
    keys = Object.keys(My);
    assert.deepEqual(keys, ['ctwo']);
    keys = Object.keys(My.prototype);
    assert.deepEqual(keys, ['one', 'emit']);
  });
  it('should include one method as string', function() {
    var My, keys;
    My = function() {};
    testable(My, {
      include: 'two'
    });
    keys = Object.keys(My);
    assert.deepEqual(keys, []);
    keys = Object.keys(My.prototype);
    keys.sort();
    assert.deepEqual(keys, ['emit', 'two'].sort());
  });
  it('should exclude methods', function() {
    var My, keys;
    My = function() {};
    testable(My, {
      exclude: ['one', 'two', '@ctwo']
    });
    keys = Object.keys(My);
    assert.deepEqual(keys, ['cone']);
    My.should.not.have.ownProperty('ctwo');
    keys = Object.keys(My.prototype);
    keys.sort();
    assert.deepEqual(keys, ['emit', 'three'].sort());
  });
  it('should exclude one method', function() {
    var My, keys;
    My = function() {};
    testable(My, {
      exclude: 'one'
    });
    keys = Object.keys(My.prototype).sort();
    assert.deepEqual(keys, ['emit', 'two', 'three'].sort());
  });
  it('should include and exclude methods', function() {
    var My, keys;
    My = function() {};
    testable(My, {
      include: ['one', 'three'],
      exclude: ['emit']
    });
    keys = Object.keys(My.prototype).sort();
    assert.deepEqual(keys, ['one', 'two', 'three', 'emit'].sort());
  });
  it('should inject methods', function() {
    var My, my, newExec, oldExec;
    oldExec = void 0;
    newExec = void 0;
    My = function() {};
    My.prototype.exec = function() {
      oldExec = true;
    };
    testable(My, {
      methods: {
        exec: function() {
          newExec = true;
          this['super']();
        }
      }
    });
    my = new My();
    my.exec();
    assert.equal(oldExec, true, 'should execute the original func');
    assert.equal(newExec, true, 'should execute the new func');
  });
  it('should inject class methods', function() {
    var My, newExec, oldExec;
    My = function() {};
    My.exec = oldExec = sinon.spy(function() {});
    testable(My, {
      classMethods: {
        exec: newExec = sinon.spy(function() {
          this['super'].apply(this.self, arguments);
        })
      }
    });
    My.exec(1, 2, 3);
    newExec.should.be.calledOnce;
    newExec.should.be.calledWith(1, 2, 3);
    oldExec.should.be.calledOnce;
    oldExec.should.be.calledWith(1, 2, 3);
  });
  //assert.equal oldExec, true, 'should execute the original func'
  //assert.equal newExec, true, 'should execute the new func'
  it('should not inject methods twice', function() {
    var My, Root, my, newExec, oldExec;
    newExec = 0;
    oldExec = 0;
    Root = function() {};
    Root.prototype.exec = function() {
      oldExec++;
    };
    My = function() {};
    inherits(My, Root);
    testable(Root, {
      methods: {
        exec: function() {
          newExec++;
          this['super']();
        }
      }
    });
    testable(My, {
      methods: {
        exec: function() {
          newExec++;
          this['super']();
        }
      }
    });
    my = new My();
    my.exec();
    assert.equal(oldExec, 1, 'should execute the original func once');
    assert.equal(newExec, 1, 'should execute the new func once');
  });
  describe('AdditionalAbility', () => {
    it('should use additional abilities', function() {
      var opt, testableOpts;
      testableOpts = function() {
        return {
          methods: {
            additional: function() {}
          }
        };
      };
      class My {
        $abilities: { MyAbility: any; };
      };

      My.prototype[abilitiesSym] = {
        MyAbility: {getOpts: testableOpts}
      };

      opt = {};
      testable(My, opt);
      My.prototype.should.have.ownProperty('additional');
      My.prototype.should.have.ownProperty(abilitiesOptSym);
      expect(My.prototype[abilitiesOptSym]).to.have.ownProperty('MyAbility', true)
      myAbilityCheck(My);
    });
    it('should use inherited additional abilities', function() {
      var my, myOpts, opt, overMy, overRoot, rootOpts;
      overRoot = sinon.spy();
      overMy = sinon.spy(function() {
        return My.__super__.over.apply(this, arguments);
      });
      rootOpts = function() {
        return {
          methods: {
            root: function() {},
            over: overRoot
          }
        };
      };
      myOpts = function() {
        return {
          methods: {
            additional: function() {},
            over: overMy
          }
        };
      };
      class Root {
        $abilities: { MyAbility: any; };
      };

      Root.prototype[abilitiesSym] = {
        MyAbility: {getOpts: rootOpts}
      };

      class My {
        static __super__: any;
        $abilities: { MyAbility: any; };
      };

      inherits(My, Root);

      My.prototype[abilitiesSym] = {
        MyAbility: {getOpts: myOpts}
      };

      opt = {};
      testable(My, opt);
      My.prototype.should.have.ownProperty('additional');
      My.prototype.should.have.not.ownProperty('root');
      My.prototype.should.have.property('root');
      My.prototype.should.have.ownProperty('over');
      myAbilityCheck(My);
      My.prototype.should.have.ownProperty(abilitiesOptSym);
      expect(My.prototype[abilitiesOptSym]).to.have.ownProperty('MyAbility', true)
      Root.prototype.should.have.ownProperty(abilitiesOptSym);
      expect(Root.prototype[abilitiesOptSym]).to.have.ownProperty('MyAbility', true)
      my = new My();
      my.over(1, 2, 3);
      overMy.should.have.been.calledOnce;
      overMy.should.have.been.calledWith(1, 2, 3);
      overRoot.should.have.been.calledOnce;
      overRoot.should.have.been.calledWith(1, 2, 3);
    });
    it('should use additional ability via multi classes', function() {
      var opt, overRoot, rootOpts;
      overRoot = sinon.spy();
      rootOpts = function() {
        return {
          methods: {
            root: function() {},
            over: overRoot
          }
        };
      };
      class Root {
        $abilities: { MyAbility: any; };
      };

      Root.prototype[abilitiesSym] = {
        MyAbility: {getOpts: rootOpts}
      };

      class My {};

      inherits(My, Root);

      class My1 {};

      inherits(My1, Root);

      opt = {};
      testable(My, opt);
      My.prototype.should.have.property('root');
      My.prototype.should.not.have.ownProperty('root');
      My.prototype.should.have.property('over');
      myAbilityCheck(My);
      My.prototype.should.not.have.ownProperty(abilitiesOptSym);
      Root.prototype.should.have.ownProperty(abilitiesOptSym);
      expect(Root.prototype[abilitiesOptSym]).to.have.ownProperty('MyAbility', true)
      testable(My1);
      My1.prototype.should.have.property('root');
      My1.prototype.should.have.property('over');
      myAbilityCheck(My1);
    });
    it('should use additional ability via multi inherited classes', function() {
      var k, ref, v;
      class Root {
        // $abilities: { MyAbility: () => { methods: { additional: () => void; two: () => void; }; }; };
      };

      Root.prototype[abilitiesSym] = {
        MyAbility: {getOpts() { // additional ability to MyAbility
          return {
            methods: {
              additional: function() {},
              two: function() {}
            }
          };
        }}
      };

      class Mid {
        // $abilities: { MyAbility: () => { methods: { additional: () => any; iok: () => void; }; }; };
        static __super__: any;
      };

      inherits(Mid, Root);

      Mid.prototype[abilitiesSym] = {
        MyAbility: {getOpts: function() {
          // additional ability to MyAbility
          return {
            methods: {
              additional: function() {
                return Mid.__super__.additional.apply(this, arguments);
              },
              iok: function() {}
            }
          };
        }}
      };

      class A {};

      inherits(A, Mid);

      testable(A); // make the class A testable.

      myAbilityCheck(A);
  // A should have all static methods of Test
  // Mid,Root should have no any methods of Test
      for (k in MyAbility) {
        v = MyAbility[k];
        Mid.should.not.have.ownProperty(k);
        Root.should.have.ownProperty(k);
        A.should.not.have.ownProperty(k);
        v.should.be.equal(A[k]);
      }
      ref = MyAbility.prototype;
      // A and Mid should have no any methods of Test
      // the Root should have all methods of Test
      for (k in ref) {
        v = ref[k];
        A.prototype.should.not.have.ownProperty(k);
        Mid.prototype.should.not.have.ownProperty(k);
        Root.prototype.should.have.ownProperty(k);
      }
      // Root should have additional methods:
      Root.prototype.should.have.ownProperty('additional');
      Root.prototype.should.have.ownProperty('two');
      Mid.prototype.should.have.ownProperty('additional');
      Mid.prototype.should.have.ownProperty('iok');
    });
    it('should not inject additional ability if no all required methods exists', function() {
      function testableOpts() {
        return {
          methods: {
            additional: function() {}
          }
        };
      };

      class My {}

      My.prototype[abilitiesSym] = {
        MyAbility: {getOpts: testableOpts, required: ['one', 'two']}
      };

      const opt = {exclude: 'one'};
      testable(My, opt);
      My.prototype.should.not.have.ownProperty('additional');
      My.prototype.should.not.have.ownProperty(abilitiesOptSym);
    });
    it('should inject additional ability via depends in injectorOptions', function() {
      function testableOpts() {
        return {
          methods: {
            additional: function() {}
          }
        };
      };

      class MyAbility1 {
        additional2() {}
      }

      const testable1 = createAbilityInjector(MyAbility1, {depends: {
        MyAbility: {
          getOpts: testableOpts
        }
      }});

      function My() {}

      let opt = {};
      testable1(My, opt);
      My.prototype.should.have.ownProperty('additional2');
      My.prototype.should.have.ownProperty(abilitiesSym);
      expect(My.prototype[abilitiesSym]).to.have.ownProperty('MyAbility')
      testable(My, opt);
      My.prototype.should.have.ownProperty(abilitiesOptSym);
      expect(My.prototype[abilitiesOptSym]).to.have.ownProperty('MyAbility_MyAbility1', true)
      My.prototype.should.have.ownProperty('additional');
    });
    it('should inject additional ability via depends in injectorOptions after already injected ability', function() {
      function testableOpts() {
        return {
          methods: {
            additional: function() {}
          }
        };
      };

      class MyAbility1 {
        additional2() {}
      }

      const testable1 = createAbilityInjector(MyAbility1, {depends: {
        MyAbility: {
          getOpts: testableOpts
        }
      }});

      function My() {}

      let opt = {};
      testable(My, opt);
      myAbilityCheck(My)
      My.prototype.should.have.ownProperty(abilitiesSym);
      My.prototype.should.not.have.ownProperty(abilitiesOptSym);

      testable1(My, opt);
      My.prototype.should.have.ownProperty(abilitiesOptSym);
      expect(My.prototype[abilitiesOptSym]).to.have.ownProperty('MyAbility_MyAbility1', true)
      My.prototype.should.have.ownProperty('additional');
      My.prototype.should.have.ownProperty('additional2');
    });
    it('should inject additional abilities on target only after mode is target', function() {
      // all additional ability on inheritance classes are injected to target class together.
      // and can be super call.
      const overRoot = sinon.spy();
      const overMy = sinon.spy(function() {
        return this.super(...arguments)
      });
      function rootOpts() {
        return {
          methods: {
            root: function() {},
            over: overRoot
          }
        };
      };
      function myOpts() {
        return {
          methods: {
            additional: function() {},
            over: overMy
          }
        };
      };
      class Root {
        root: Function
        over: Function
      }

      Root.prototype[abilitiesSym] = {
        MyAbility: {getOpts: rootOpts, mode: AdditionalInjectionMode.target}
      };

      class My extends Root {}

      My.prototype[abilitiesSym] = {
        MyAbility: {getOpts: myOpts, mode: AdditionalInjectionMode.target}
      };

      const opt = {};
      testable(My, opt);
      My.prototype.should.have.ownProperty('additional');
      My.prototype.should.have.ownProperty('root');
      My.prototype.should.have.ownProperty('over');
      myAbilityCheck(My);
      My.prototype.should.have.ownProperty(abilitiesOptSym);
      expect(My.prototype[abilitiesOptSym]).to.have.ownProperty('MyAbility', true)
      Root.prototype.should.not.have.ownProperty(abilitiesOptSym);
      // expect(Root.prototype[abilitiesOptSym]).to.have.ownProperty('MyAbility', true)
      let my = new My;
      my.over(1, 2, 3);
      overMy.should.have.been.calledOnce;
      overMy.should.have.been.calledWith(1, 2, 3);
      overRoot.should.have.been.calledOnce;
      overRoot.should.have.been.calledWith(1, 2, 3);
    });
  });

  describe('use the injectMethods(AOP) to hook', function() {
    var oneTestable;
    class OneAbility {
      one: sinon.SinonSpy<any[], any>;
      two: sinon.SinonSpy<any[], any>;
      three: sinon.SinonSpy<any[], any>;
      emit: sinon.SinonSpy<any[], any>;
      static cone: sinon.SinonSpy<any[], any>;
      static ctwo: sinon.SinonSpy<any[], any>;
      $init: any;
    };

    defineProperty(OneAbility.prototype, '$init', sinon.spy(function() {
      if (this.super) {
        return this.super.apply(this.self, arguments);
      }
    }));

    OneAbility.prototype.one = sinon.spy();

    OneAbility.prototype.two = sinon.spy();

    OneAbility.prototype.three = sinon.spy();

    OneAbility.prototype.emit = sinon.spy();

    OneAbility.cone = sinon.spy();

    OneAbility.ctwo = sinon.spy();

    oneTestable = createAbilityInjector(OneAbility, 'emit');
    beforeEach(function() {
      OneAbility.prototype.$init.resetHistory();
      all_stub_reset(OneAbility);
      all_stub_reset(OneAbility.prototype);
    });
    it('should injectMethod correctly', function() {
      var a, oldInit, t;
      oldInit = sinon.spy();
      class A {
        hi: number;
        init: any;
        constructor(...args: any[]) {
          this.hi = 123;
          this.init.apply(this, arguments);
        }
      };

      A.prototype.init = oldInit;

      oneTestable(A);

      a = new A(123);
      OneAbility.prototype.$init.should.be.calledOnce;
      OneAbility.prototype.$init.should.be.calledWith(123);
      t = OneAbility.prototype.$init.thisValues[0];
      t.should.have.property('self', a);
      oldInit.should.be.calledOnce;
      oldInit.should.be.calledWith(123);
    });
    it('should injectMethod non-exist correctly', function() {
      var a, oldInit, t;
      oldInit = sinon.spy();
      class A {
        hi: number;
        init: any;
        constructor(a?:any) {
          this.hi = 123;
          this.init.apply(this, arguments);
        }

      };

      oneTestable(A);

      a = new A(123);
      OneAbility.prototype.$init.should.be.calledOnce;
      OneAbility.prototype.$init.should.be.calledWith(123);
      t = OneAbility.prototype.$init.thisValues[0];
      t.should.be.equal(a);
    });
    it('should ignore some injectMethod', function() {
      var a, oldInit;
      oldInit = sinon.spy();
      class A {
        hi: number;
        init: any;
        constructor(a?:any) {
          this.hi = 123;
          this.init.apply(this, arguments);
        }

      };

      A.prototype.init = oldInit;

      oneTestable(A, {
        exclude: 'init'
      });

      a = new A(123);
      OneAbility.prototype.$init.should.not.be.called;
      oldInit.should.be.calledOnce;
      oldInit.should.be.calledWith(123);
    });
  });
  describe('use the injectMethods(AOP) to hook(with same method)', function() {
    var oneTestable;
    class OneAbility {
      one: sinon.SinonSpy<any[], any>;
      two: sinon.SinonSpy<any[], any>;
      three: sinon.SinonSpy<any[], any>;
      emit: sinon.SinonSpy<any[], any>;
      init: sinon.SinonSpy<any[], any>;
      static cone: sinon.SinonSpy<any[], any>;
      static ctwo: sinon.SinonSpy<any[], any>;
      $init: any;
    };

    defineProperty(OneAbility.prototype, '$init', sinon.spy(function() {
      if (this.super) {
        return this.super.apply(this.self, arguments);
      }
    }));

    OneAbility.prototype.one = sinon.spy();

    OneAbility.prototype.two = sinon.spy();

    OneAbility.prototype.three = sinon.spy();

    OneAbility.prototype.emit = sinon.spy();

    OneAbility.prototype.init = sinon.spy();

    OneAbility.cone = sinon.spy();

    OneAbility.ctwo = sinon.spy();

    oneTestable = createAbilityInjector(OneAbility, 'emit');
    beforeEach(function() {
      var k, ref, v;
      OneAbility.prototype.$init.resetHistory();
      all_stub_reset(OneAbility)
      all_stub_reset(OneAbility.prototype)
    });
    it('should injectMethod correctly', function() {
      var a, oldInit, t;
      oldInit = sinon.spy();
      class A {
        hi: number;
        init: any;
        constructor(a?: any) {
          this.hi = 123;
          this.init.apply(this, arguments);
        }

      };

      A.prototype.init = oldInit;

      oneTestable(A);

      a = new A(123);
      OneAbility.prototype.init.should.not.be.called;
      OneAbility.prototype.$init.should.be.calledOnce;
      OneAbility.prototype.$init.should.be.calledWith(123);
      t = OneAbility.prototype.$init.thisValues[0];
      t.should.have.property('self', a);
      oldInit.should.be.calledOnce;
      oldInit.should.be.calledWith(123);
    });
    it('should injectMethod non-exist correctly', function() {
      var a, oldInit, t;
      oldInit = sinon.spy();
      class A {
        hi: number;
        init: any;
        constructor(a?: any) {
          this.hi = 123;
          this.init.apply(this, arguments);
        }

      };

      oneTestable(A);

      a = new A(123);
      OneAbility.prototype.$init.should.not.be.called;
      OneAbility.prototype.init.should.be.calledOnce;
      OneAbility.prototype.init.should.be.calledWith(123);
      t = OneAbility.prototype.init.thisValues[0];
      t.should.be.equal(a);
    });
    it('should ignore some injectMethod', function() {
      var a, oldInit;
      oldInit = sinon.spy();
      class A {
        hi: number;
        init: any;
        constructor(a?: any) {
          this.hi = 123;
          this.init.apply(this, arguments);
        }

      };

      A.prototype.init = oldInit;

      oneTestable(A, {
        exclude: 'init'
      });

      a = new A(123);
      OneAbility.prototype.$init.should.not.be.called;
      oldInit.should.be.calledOnce;
      oldInit.should.be.calledWith(123);
    });
  });
  describe('How to ensure that the injected object does not have the same method', function() {
    var init = sinon.spy()
    var emit = sinon.spy()
    class TheAbility {
      super: any;
      self: this;
      constructor() {
        this.init.apply(this, arguments)
      }
      init() {
        var Super = this.super
        var that = this.self || this
        if (Super) {
          Super.apply(that, arguments)
        }
        init.apply(that, arguments)
      }
      emit() {
        emit.apply(this, arguments)
      }
    }
    var testable = createAbilityInjector(TheAbility, 'emit');
    it('should call init correctly', () => {
      var oInit = sinon.spy()
      class My {
        constructor(...args: any[]) {
          this.init.apply(this, arguments)
        }
        init() {
          oInit.apply(this, arguments)
        }
      }

      testable(My)
      new My(5,3,1)
      init.should.be.calledOnce
      init.should.be.calledWith(5,3,1)
      oInit.should.be.calledOnce
      oInit.should.be.calledWith(5,3,1)
    });
  });
});
