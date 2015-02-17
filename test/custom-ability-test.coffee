chai            = require 'chai'
sinon           = require 'sinon'
sinonChai       = require 'sinon-chai'
should          = chai.should()
assert          = chai.assert
chai.use(sinonChai)

customAbility   = require '../src/custom-ability'
inherits        = require 'inherits-ex/lib/inherits'
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
  it 'could have no coreMethod', ->
    testable1 = customAbility MyAbility
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
      should.not.exist result[k], k
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
      should.not.exist result[k], k
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
      should.not.exist result[k], k
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
      'ctwo'
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
      'ctwo'
    ]
    keys = Object.keys(My)
    assert.deepEqual keys, ['cone']
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
    class My
      $abilities:
        MyAbility: testable
    opt = {}
    testable My, opt
    opt.should.have.property 'inited', true
    return
