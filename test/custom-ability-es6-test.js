var assert, chai, customAbility, defineProperty, inherits, setImmediate, should, sinon, sinonChai;

chai = require('chai');

sinon = require('sinon');

sinonChai = require('sinon-chai');

should = chai.should();

assert = chai.assert;

chai.use(sinonChai);

customAbility = require('../src/custom-ability');

inherits = require('inherits-ex/lib/inherits');

defineProperty = require('util-ex/lib/defineProperty');

setImmediate = setImmediate || process.nextTick;

describe('customAbility with es6', function() {
  var myAbilityCheck, testable;
  class MyAbility {};

  MyAbility.prototype.one = sinon.spy();

  MyAbility.prototype.two = sinon.spy();

  MyAbility.prototype.three = sinon.spy();

  MyAbility.prototype.emit = sinon.spy();

  MyAbility.cone = sinon.spy();

  MyAbility.ctwo = sinon.spy();


  testable = customAbility(MyAbility, 'emit');
  beforeEach(function() {
    var k, ref, v;
    for (k in MyAbility) {
      v = MyAbility[k];
      v.reset();
    }
    ref = MyAbility.prototype;
    for (k in ref) {
      v = ref[k];
      v.reset();
    }
  });
  myAbilityCheck = function(result) {
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
      static coreAbilityClassMethod(){};
      coreAbilityMethod(){};
      additionalAbilityMethod(){};
    }
    MyFeature.additionalClassMethod = function() {}

    const addFeatureTo = customAbility(MyFeature, ['coreAbilityMethod', '@coreAbilityClassMethod']);

    class MyClass {
      someMethod() {}
    }
    // inject the static and instance methods to the MyClass.
    addFeatureTo(MyClass);
    MyClass.should.have.ownProperty('coreAbilityClassMethod')

  });
  it('could use getAbilityClass', function() {
    var My, getAbilityClass, result, testable1;
    My = class My {};
    getAbilityClass = function(aClass) {
      return MyAbility;
    };
    testable1 = customAbility(getAbilityClass, true);
    result = testable1(My);
    result.should.be.equal(My);
    return myAbilityCheck(result);
  });
  it('could get AbilityClass when no aClass passing', function() {
    var My, testable1;
    testable1 = customAbility(MyAbility);
    My = testable1();
    return My.should.be.equal(MyAbility);
  });
  it('could no inject if have already static coreMethod', function() {
    var My, testable1;
    testable1 = customAbility(MyAbility, '@cone');
    My = (function() {
      class My {};

      My.cone = 12;

      return My;

    }).call(this);
    testable1(My);
    return My.should.have.property('cone', 12);
  });
  it('could have no coreMethod', function() {
    var k, result, results, testable1;
    testable1 = customAbility(MyAbility);
    class Root {};
    class My {};

    inherits(My, Root);

    result = testable1(Root);
    result.should.be.equal(Root);
    myAbilityCheck(result);
    result = testable1(My);
    result.should.be.equal(My);
    for (k in MyAbility) {
      should.exist(result[k], k);
    }
    results = [];
    for (k in MyAbility.prototype) {
      results.push(result.prototype.should.not.have.ownProperty(k));
    }
    return results;
  });
  it('should add multi abilities on same class', function() {
    var My, Root, k, ref, ref1, result, results, testable1, testable2, v;
    class OtherAbility {
      ding() {}

      static sth() {}

    };
    testable1 = customAbility(MyAbility);
    testable2 = customAbility(OtherAbility);
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
    result.should.be.equal(My);
    for (k in MyAbility) {
      should.exist(result[k], k);
    }
    for (k in MyAbility.prototype) {
      result.prototype.should.not.have.ownProperty(k);
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
    result.should.be.equal(My);
    for (k in OtherAbility) {
      should.exist(result[k], k);
    }
    results = [];
    for (k in OtherAbility.prototype) {
      results.push(result.prototype.should.not.have.ownProperty(k));
    }
    return results;
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
    testable1 = customAbility(fn, 'emit', true);
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
    var My, MyA, fn, k, my, ref, testable1, v;
    MyA = void 0;
    fn = function(aClass, aOptions) {
      var MyAbility1;
      return MyA = MyAbility1 = (function() {
        class MyAbility1 {};

        MyAbility1.prototype.emit = sinon.spy();

        MyAbility1.prototype.one = sinon.spy(function() {
          should.exist(aClass, 'aClass');
          return aClass.should.have.property('count', 1);
        });

        MyAbility1.count = 1;

        return MyAbility1;

      }).call(this);
    };
    testable1 = customAbility(fn, 'emit', true);
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
  it('should use additional abilities', function() {
    var opt, testableOpts;
    testableOpts = function() {
      return {
        methods: {
          addtional: function() {}
        }
      };
    };
    class My {};

    My.prototype.$abilities = {
      MyAbility: testableOpts
    };

    opt = {};
    testable(My, opt);
    My.prototype.should.have.ownProperty('addtional');
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
          addtional: function() {},
          over: overMy
        }
      };
    };
    class Root {};

    Root.prototype.$abilities = {
      MyAbility: rootOpts
    };

    class My {};

    inherits(My, Root);

    My.prototype.$abilities = {
      MyAbility: myOpts
    };

    opt = {};
    testable(My, opt);
    My.prototype.should.have.ownProperty('addtional');
    My.prototype.should.have.property('root');
    My.prototype.should.have.ownProperty('over');
    myAbilityCheck(My);
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
    class Root {};

    Root.prototype.$abilities = {
      MyAbility: rootOpts
    };

    class My {};

    inherits(My, Root);

    class My1 {};

    inherits(My1, Root);

    opt = {};
    testable(My, opt);
    My.prototype.should.have.property('root');
    My.prototype.should.have.property('over');
    myAbilityCheck(My);
    testable(My1);
    My1.prototype.should.have.property('root');
    My1.prototype.should.have.property('over');
    myAbilityCheck(My1);
  });
  it('should use additional ability via multi inherited classes', function() {
    var k, ref, v;
    class Root {};

    Root.prototype.$abilities = {
      MyAbility: function() { // additinal ability to MyAbility
        return {
          methods: {
            additional: function() {},
            two: function() {}
          }
        };
      }
    };

    class Mid {};

    inherits(Mid, Root);

    Mid.prototype.$abilities = {
      MyAbility: function() { // additinal ability to MyAbility
        return {
          methods: {
            additional: function() {
              return Mid.__super__.additional.apply(this, arguments);
            },
            iok: function() {}
          }
        };
      }
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
      Root.should.not.have.ownProperty(k);
      A.should.have.ownProperty(k);
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
  return describe('use the injectMethods(AOP) to hook', function() {
    var oneTestable;
    class OneAbility {};

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

    oneTestable = customAbility(OneAbility, 'emit');
    beforeEach(function() {
      var k, ref, v;
      OneAbility.prototype.$init.reset();
      for (k in OneAbility) {
        v = OneAbility[k];
        v.reset();
      }
      ref = OneAbility.prototype;
      for (k in ref) {
        v = ref[k];
        v.reset();
      }
    });
    it('should injectMethod correctly', function() {
      var a, oldInit, t;
      oldInit = sinon.spy();
      class A {
        constructor() {
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
        constructor() {
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
        constructor() {
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
});
