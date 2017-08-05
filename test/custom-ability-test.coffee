chai            = require 'chai'
sinon           = require 'sinon'
sinonChai       = require 'sinon-chai'
should          = chai.should()
assert          = chai.assert
chai.use(sinonChai)

customAbility   = require '../src/custom-ability'
inherits        = require 'inherits-ex/lib/inherits'
defineProperty  = require 'util-ex/lib/defineProperty'
setImmediate    = setImmediate || process.nextTick

describe 'customAbility', ->
  class MyAbility
    one: sinon.spy()
    two: sinon.spy()
    three: sinon.spy()
    emit: sinon.spy()
    @cone: sinon.spy()
    @ctwo: sinon.spy()
  testable = customAbility MyAbility, 'emit'

  beforeEach ->
    for k,v of MyAbility
      v.reset()
    for k,v of MyAbility::
      v.reset()
    return
  myAbilityCheck = (result)->
    for k, v of MyAbility
      v.should.be.equal result[k]
    for k, v of MyAbility::
      v.should.be.equal result::[k]
  it 'could use getAbilityClass', ->
    class My
    getAbilityClass = (aClass)->MyAbility
    testable1 = customAbility getAbilityClass, true
    result = testable1 My
    result.should.be.equal My
    myAbilityCheck result

  it 'could get AbilityClass when no aClass passing', ->
    testable1 = customAbility MyAbility
    My = testable1()
    My.should.be.equal MyAbility

  it 'could no inject if have already static coreMethod', ->
    testable1 = customAbility MyAbility, '@cone'
    class My
      @cone: 12
    testable1 My
    My.should.have.property 'cone', 12

  it 'could have no coreMethod', ->
    testable1 = customAbility MyAbility
    class Root
    class My
      inherits My, Root
    result = testable1 Root
    result.should.be.equal Root
    myAbilityCheck result
    result = testable1 My
    result.should.be.equal My
    for k of MyAbility
      should.exist result[k], k
    for k of MyAbility::
      result::should.not.have.ownProperty k
  it 'should add multi abilities on same class', ->
    class OtherAbility
      ding:->
      @sth:->
    testable1 = customAbility MyAbility
    testable2 = customAbility OtherAbility
    class Root
    class My
      inherits My, Root
    result = testable1 Root
    result.should.be.equal Root
    for k, v of MyAbility
      v.should.be.equal result[k]
    for k, v of MyAbility::
      v.should.be.equal result::[k]
    result = testable1 My
    result.should.be.equal My
    for k of MyAbility
      should.exist result[k], k
    for k of MyAbility::
      result::should.not.have.ownProperty k

    result = testable2 Root
    result.should.be.equal Root
    for k, v of OtherAbility
      v.should.be.equal result[k]
    for k, v of OtherAbility::
      v.should.be.equal result::[k]
    result = testable2 My
    result.should.be.equal My
    for k of OtherAbility
      should.exist result[k], k
    for k of OtherAbility::
      result::should.not.have.ownProperty k

  it 'should add methods and class methods to a class', ->
    My = ->
    testable(My).should.be.equal My
    for k, v of MyAbility
      v.should.be.equal My[k]
    for k, v of MyAbility::
      v.should.be.equal My::[k]
  it 'should use getClass function to make ability ', ->
    fn = (aClass, aOptions)->
      MyAbility.class = aClass
      MyAbility
    testable1 = customAbility fn, 'emit', true
    My = ->
    testable1(My).should.be.equal My
    for k, v of MyAbility
      v.should.be.equal My[k]
    for k, v of MyAbility::
      v.should.be.equal My::[k]
    should.exist MyAbility.class
    MyAbility.class.should.be.equal My
    delete MyAbility.class
  it 'should get proper aClass in getClass function to make ability ', ->
    MyA = undefined
    fn = (aClass, aOptions)->
      MyA = class MyAbility1
        emit: sinon.spy()
        one: sinon.spy ->
          should.exist aClass, 'aClass'
          aClass.should.have.property 'count', 1
        @count: 1
    testable1 = customAbility fn, 'emit', true
    My = ->
    testable1(My).should.be.equal My
    for k, v of MyA
      v.should.be.equal My[k]
    for k, v of MyA::
      v.should.be.equal My::[k]
    my = new My
    my.one()
    my.one.should.be.calledOnce
  it 'should only include methods', ->

    My = ->

    testable My, include: [
      'one'
      '@ctwo'
    ]

    keys = Object.keys(My)
    assert.deepEqual keys, [ 'ctwo' ]
    keys = Object.keys(My.prototype)
    assert.deepEqual keys, [
      'one'
      'emit'
    ]
    return
  it 'should include one method as string', ->

    My = ->

    testable My, include: 'two'
    keys = Object.keys(My)
    assert.deepEqual keys, []
    keys = Object.keys(My.prototype)
    keys.sort()
    assert.deepEqual keys, [
      'emit'
      'two'
    ].sort()
    return
  it 'should exclude methods', ->

    My = ->

    testable My, exclude: [
      'one'
      'two'
      '@ctwo'
    ]
    keys = Object.keys(My)
    assert.deepEqual keys, ['cone']
    My.should.not.have.ownProperty 'ctwo'
    keys = Object.keys(My.prototype)
    keys.sort()
    assert.deepEqual keys, [
      'emit'
      'three'
    ].sort()
    return
  it 'should exclude one method', ->

    My = ->

    testable My, exclude: 'one'
    keys = Object.keys(My.prototype).sort()
    assert.deepEqual keys, [
      'emit'
      'two'
      'three'
    ].sort()
    return
  it 'should include and exclude methods', ->

    My = ->

    testable My,
      include: [
        'one'
        'three'
      ]
      exclude: [ 'emit' ]
    keys = Object.keys(My.prototype).sort()
    assert.deepEqual keys, [
      'one'
      'two'
      'three'
      'emit'
    ].sort()
    return
  it 'should inject methods', ->
    oldExec = undefined
    newExec = undefined

    My = ->
    My::exec = ->
      oldExec = true
      return

    testable My, methods: exec: ->
      newExec = true
      @['super']()
      return
    my = new My
    my.exec()
    assert.equal oldExec, true, 'should execute the original func'
    assert.equal newExec, true, 'should execute the new func'
    return
  it 'should inject class methods', ->

    My = ->
    My.exec = oldExec = sinon.spy ->
      return

    testable My, classMethods: exec: newExec = sinon.spy ->
      @['super'].apply @self, arguments
      return
    My.exec(1,2,3)
    newExec.should.be.calledOnce
    newExec.should.be.calledWith 1,2,3
    oldExec.should.be.calledOnce
    oldExec.should.be.calledWith 1,2,3
    #assert.equal oldExec, true, 'should execute the original func'
    #assert.equal newExec, true, 'should execute the new func'
    return
  it 'should not inject methods twice', ->
    newExec = 0
    oldExec = 0

    Root = ->

    Root::exec = ->
      oldExec++
      return

    My = ->

    inherits My, Root
    testable Root, methods: exec: ->
      newExec++
      @['super']()
      return
    testable My, methods: exec: ->
      newExec++
      @['super']()
      return
    my = new My
    my.exec()
    assert.equal oldExec, 1, 'should execute the original func once'
    assert.equal newExec, 1, 'should execute the new func once'
    return
  it 'should use additional abilities', ->
    testableOpts = ->
      methods:
        addtional: ->
    class My
      $abilities:
        MyAbility: testableOpts
    opt = {}
    testable My, opt
    My::should.have.ownProperty 'addtional'
    myAbilityCheck My
    return
  it 'should use inherited additional abilities', ->
    overRoot = sinon.spy()
    overMy = sinon.spy -> My.__super__.over.apply(@, arguments)
    rootOpts = ->
      methods:
        root: ->
        over: overRoot
    myOpts = ->
      methods:
        addtional: ->
        over: overMy
    class Root
      $abilities:
        MyAbility: rootOpts
    class My
      inherits My, Root
      $abilities:
        MyAbility: myOpts
    opt = {}
    testable My, opt
    My::should.have.ownProperty 'addtional'
    My::should.have.property 'root'
    My::should.have.ownProperty 'over'
    myAbilityCheck My
    my = new My
    my.over 1,2,3
    overMy.should.have.been.calledOnce
    overMy.should.have.been.calledWith 1,2,3
    overRoot.should.have.been.calledOnce
    overRoot.should.have.been.calledWith 1,2,3
    return
  it 'should use additional ability via multi classes', ->
    overRoot = sinon.spy()
    rootOpts = ->
      methods:
        root: ->
        over: overRoot
    class Root
      $abilities:
        MyAbility: rootOpts
    class My
      inherits My, Root
    class My1
      inherits My1, Root
    opt = {}
    testable My, opt
    My::should.have.property 'root'
    My::should.have.property 'over'
    myAbilityCheck My
    testable My1
    My1::should.have.property 'root'
    My1::should.have.property 'over'
    myAbilityCheck My1
    return
  it 'should use additional ability via multi inherited classes', ->
    class Root
      $abilities:
        MyAbility: -> # additinal ability to MyAbility
          methods:
            additional:->
            two: ->
    class Mid
      inherits Mid, Root
      $abilities:
        MyAbility: -> # additinal ability to MyAbility
          methods:
            additional:-> Mid.__super__.additional.apply(@, arguments)
            iok: ->
    class A
      inherits A, Mid
      testable A # make the class A testable.

    myAbilityCheck A

    # A should have all static methods of Test
    # Mid,Root should have no any methods of Test
    for k, v of MyAbility
      Mid.should.not.have.ownProperty k
      Root.should.not.have.ownProperty k
      A.should.have.ownProperty k
      v.should.be.equal A[k]

    # A and Mid should have no any methods of Test
    # the Root should have all methods of Test
    for k, v of MyAbility::
      A::should.not.have.ownProperty k
      Mid::should.not.have.ownProperty k
      Root::should.have.ownProperty k

    # Root should have additional methods:
    Root::should.have.ownProperty 'additional'
    Root::should.have.ownProperty 'two'

    Mid::should.have.ownProperty 'additional'
    Mid::should.have.ownProperty 'iok'

  describe 'use the injectMethods(AOP) to hook', ->
    class OneAbility
      defineProperty OneAbility::, '$init', sinon.spy ->
        if @super
          @super.apply @self, arguments

      one: sinon.spy()
      two: sinon.spy()
      three: sinon.spy()
      emit: sinon.spy()
      @cone: sinon.spy()
      @ctwo: sinon.spy()
    oneTestable = customAbility OneAbility, 'emit'
    beforeEach ->
      OneAbility::$init.reset()
      for k,v of OneAbility
        v.reset()
      for k,v of OneAbility::
        v.reset()
      return

    it 'should injectMethod correctly', ->
      oldInit = sinon.spy()
      class A
        constructor: ->
          @hi = 123
          @init.apply @, arguments
        init: oldInit
        oneTestable A
      a = new A 123
      OneAbility::$init.should.be.calledOnce
      OneAbility::$init.should.be.calledWith 123

      t = OneAbility::$init.thisValues[0]
      t.should.have.property 'self', a
      oldInit.should.be.calledOnce
      oldInit.should.be.calledWith 123

    it 'should injectMethod non-exist correctly', ->
      oldInit = sinon.spy()
      class A
        constructor: ->
          @hi = 123
          @init.apply @, arguments
        oneTestable A
      a = new A 123
      OneAbility::$init.should.be.calledOnce
      OneAbility::$init.should.be.calledWith 123

      t = OneAbility::$init.thisValues[0]
      t.should.be.equal a
    it 'should ignore some injectMethod', ->
      oldInit = sinon.spy()
      class A
        constructor: ->
          @hi = 123
          @init.apply @, arguments
        init: oldInit
        oneTestable A, exclude: 'init'
      a = new A 123
      OneAbility::$init.should.not.be.called
      oldInit.should.be.calledOnce
      oldInit.should.be.calledWith 123
