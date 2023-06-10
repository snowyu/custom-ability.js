import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
const should = chai.should();
import { assert, expect } from 'chai';
chai.use(sinonChai);
import path from 'path';
import inherits from 'inherits-ex/lib/inherits';
import defineProperty from 'util-ex/lib/defineProperty';
import {abilitiesSym, createAbilityInjector} from '../src/custom-ability';


var setImmediate = setImmediate || process.nextTick;

function all_stub_reset(obj) {
  for (let k in obj) {
    const v = obj[k];
    v.resetHistory();
  }
}

describe('customAbility', function() {
  function MyAbility() {}

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

  it('could use getAbilityClass', function() {
    let My, getAbilityClass, result, testable1;
    My = (function() {
      function My() {}

      return My;

    })();
    getAbilityClass = function(aClass) {
      return MyAbility;
    };
    testable1 = createAbilityInjector(getAbilityClass, true);
    result = testable1(My);
    result.should.be.equal(My);
    return myAbilityCheck(result);
  });
  it('could get AbilityClass when no aClass passing', function() {
    let My, testable1;
    testable1 = createAbilityInjector(MyAbility);
    My = testable1();
    return My.should.be.equal(MyAbility);
  });
  it('could no inject if have already static coreMethod', function() {
    var My, testable1;
    testable1 = createAbilityInjector(MyAbility, '@cone');
    My = (function() {
      function My() {}

      My.cone = 12;

      return My;

    })();
    testable1(My);
    return My.should.have.property('cone', 12);
  });
  it('could have no coreMethod', function() {
    var My, Root, k, result, results, testable1;
    testable1 = createAbilityInjector(MyAbility);
    Root = (function() {
      function Root() {}

      return Root;

    })();
    My = (function() {
      function My() {}

      inherits(My, Root);

      return My;

    })();
    result = testable1(Root);
    result.should.be.equal(Root);
    myAbilityCheck(result);
    result = testable1(My);
    result.should.be.equal(Root); // already injected on Root
    for (k in MyAbility) {
      should.exist(result[k], k);
    }
    // results = [];
    for (k in MyAbility.prototype) {
      My.prototype.should.have.property(k);
      My.prototype.should.not.have.ownProperty(k);
    }
    // return results;
  });
  it('should add multi abilities on same class', function() {
    var My, OtherAbility, Root, k, ref, ref1, result, results, testable1, testable2, v;
    OtherAbility = (function() {
      function OtherAbility() {}

      OtherAbility.prototype.ding = function() {};

      OtherAbility.sth = function() {};

      return OtherAbility;

    })();
    testable1 = createAbilityInjector(MyAbility);
    testable2 = createAbilityInjector(OtherAbility);
    Root = (function() {
      function Root() {}

      return Root;

    })();
    My = (function() {
      function My() {}

      inherits(My, Root);

      return My;

    })();
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
      MyAbility["class"] = aClass;
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
    should.exist(MyAbility["class"]);
    MyAbility["class"].should.be.equal(My);
    return delete MyAbility["class"];
  });
  it('should get proper aClass in getClass function to make ability ', function() {
    var My, MyA, fn, k, my, ref, testable1, v;
    MyA = void 0;
    fn = function(aClass, aOptions) {
      var MyAbility1;
      return MyA = MyAbility1 = (function() {
        function MyAbility1() {}

        MyAbility1.prototype.emit = sinon.spy();

        MyAbility1.prototype.one = sinon.spy(function() {
          should.exist(aClass, 'aClass');
          return aClass.should.have.property('count', 1);
        });

        MyAbility1.count = 1;

        return MyAbility1;

      })();
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
    my = new My;
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
    my = new My;
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
    my = new My;
    my.exec();
    assert.equal(oldExec, 1, 'should execute the original func once');
    assert.equal(newExec, 1, 'should execute the new func once');
  });
  it('should use additional abilities', function() {
    let My, opt, testableOpts;
    testableOpts = function() {
      return {
        methods: {
          additional: function() {}
        }
      };
    };
    My = (function() {
      function My() {}

      My.prototype[abilitiesSym] = {
        MyAbility: testableOpts
      };

      return My;

    })();
    opt = {};
    testable(My, opt);
    My.prototype.should.have.ownProperty('additional');
    myAbilityCheck(My);
  });
  it('should not duplicate inject additional abilities on base class', function() {
    const overRoot = sinon.spy(function(){
      expect(this).not.ownProperty('self')
    });
    const overMy = sinon.spy(function() {
      return (My as any).__super__.over.apply(this, arguments);
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
    // function Root() {}
    class Root {}
    class My extends Root {}

    Root.prototype[abilitiesSym] = {
      MyAbility: rootOpts
    };

    // function My() {}

    // inherits(My, Root);

    My.prototype[abilitiesSym] = {
      MyAbility: myOpts
    };

    const opt = {};
    testable(My, opt);

    // test inject duplication
    // function My1() {}
    // inherits(My1, Root);
    class My1 extends Root {}
    testable(My1, opt);
    const my:any = new My1;
    my.over(3, 1, 2);
    overRoot.should.have.been.calledWith(3, 1, 2);
  });
  it('should use inherited additional abilities', function() {
    const overRoot = sinon.spy();
    const overMy = sinon.spy(function() {
      return (My as any).__super__.over.apply(this, arguments);
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
    function Root() {}

    Root.prototype[abilitiesSym] = {
      MyAbility: rootOpts
    };

    function My() {}

    inherits(My, Root);

    My.prototype[abilitiesSym] = {
      MyAbility: myOpts
    };

    const opt = {};
    testable(My, opt);
    My.prototype.should.have.ownProperty('additional');
    My.prototype.should.have.property('root');
    My.prototype.should.have.ownProperty('over');
    myAbilityCheck(My);
    let my = new My;
    my.over(1, 2, 3);
    overMy.should.have.been.calledOnce;
    overMy.should.have.been.calledWith(1, 2, 3);
    overRoot.should.have.been.calledOnce;
    overRoot.should.have.been.calledWith(1, 2, 3);
  });
  it('should use additional ability via multi classes', function() {
    var My, My1, Root, opt, overRoot, rootOpts;
    overRoot = sinon.spy();
    rootOpts = function() {
      return {
        methods: {
          root: function() {},
          over: overRoot
        }
      };
    };
    Root = (function() {
      function Root() {}

      Root.prototype[abilitiesSym] = {
        MyAbility: rootOpts
      };

      return Root;

    })();
    My = (function() {
      function My() {}

      inherits(My, Root);

      return My;

    })();
    My1 = (function() {
      function My1() {}

      inherits(My1, Root);

      return My1;

    })();
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
    var A, Mid, Root, k, ref, v;
    Root = (function() {
      function Root() {}

      Root.prototype[abilitiesSym] = {
        MyAbility: function() {
          return {
            methods: {
              additional: function() {},
              two: function() {}
            }
          };
        }
      };

      return Root;

    })();
    Mid = (function() {
      function Mid() {}

      inherits(Mid, Root);

      Mid.prototype[abilitiesSym] = {
        MyAbility: function() {
          return {
            methods: {
              additional: function() {
                return (Mid as any).__super__.additional.apply(this, arguments);
              },
              iok: function() {}
            }
          };
        }
      };

      return Mid;

    })();
    A = (function() {
      function A() {}

      inherits(A, Mid);

      testable(A);

      return A;

    })();
    myAbilityCheck(A);
    for (k in MyAbility) {
      v = MyAbility[k];
      Mid.should.not.have.ownProperty(k);
      Root.should.have.ownProperty(k);
      A.should.not.have.ownProperty(k);
      v.should.be.equal(A[k]);
    }
    ref = MyAbility.prototype;
    for (k in ref) {
      v = ref[k];
      A.prototype.should.not.have.ownProperty(k);
      Mid.prototype.should.not.have.ownProperty(k);
      Root.prototype.should.have.ownProperty(k);
    }
    Root.prototype.should.have.ownProperty('additional');
    Root.prototype.should.have.ownProperty('two');
    Mid.prototype.should.have.ownProperty('additional');
    Mid.prototype.should.have.ownProperty('iok');
  });
  describe('use the injectMethods(AOP) to hook', function() {
    var OneAbility, oneTestable;
    OneAbility = (function() {
      function OneAbility() {}

      defineProperty(OneAbility.prototype, '$init', sinon.spy(function() {
        if (this["super"]) {
          return this["super"].apply(this.self, arguments);
        }
      }));

      OneAbility.prototype.one = sinon.spy();

      OneAbility.prototype.two = sinon.spy();

      OneAbility.prototype.three = sinon.spy();

      OneAbility.prototype.emit = sinon.spy();

      OneAbility.cone = sinon.spy();

      OneAbility.ctwo = sinon.spy();

      return OneAbility;

    })();
    oneTestable = createAbilityInjector(OneAbility, 'emit');
    beforeEach(function() {
      OneAbility.prototype.$init.resetHistory();
      all_stub_reset(OneAbility);
      all_stub_reset(OneAbility.prototype);
    });
    it('should injectMethod correctly', function() {
      var A, a, oldInit, t;
      oldInit = sinon.spy();
      A = (function() {
        function A() {
          this.hi = 123;
          this.init.apply(this, arguments);
        }

        A.prototype.init = oldInit;

        oneTestable(A);

        return A;

      })();
      a = new A(123);
      OneAbility.prototype.$init.should.be.calledOnce;
      OneAbility.prototype.$init.should.be.calledWith(123);
      t = OneAbility.prototype.$init.thisValues[0];
      t.should.have.property('self', a);
      oldInit.should.be.calledOnce;
      return oldInit.should.be.calledWith(123);
    });
    it('should injectMethod non-exist correctly', function() {
      var A, a, oldInit, t;
      oldInit = sinon.spy();
      A = (function() {
        function A() {
          this.hi = 123;
          this.init.apply(this, arguments);
        }

        oneTestable(A);

        return A;

      })();
      a = new A(123);
      OneAbility.prototype.$init.should.be.calledOnce;
      OneAbility.prototype.$init.should.be.calledWith(123);
      t = OneAbility.prototype.$init.thisValues[0];
      t.should.be.equal(a);
    });
    it('should ignore some injectMethod', function() {
      var A, a, oldInit;
      oldInit = sinon.spy();
      A = (function() {
        function A() {
          this.hi = 123;
          this.init.apply(this, arguments);
        }

        A.prototype.init = oldInit;

        oneTestable(A, {
          exclude: 'init'
        });

        return A;

      })();
      a = new A(123);
      OneAbility.prototype.$init.should.not.be.called;
      oldInit.should.be.calledOnce;
      oldInit.should.be.calledWith(123);
    });
  });
});

