chai            = require 'chai'
sinon           = require 'sinon'
sinonChai       = require 'sinon-chai'
should          = chai.should()
assert          = chai.assert
chai.use(sinonChai)

path            = require 'path'
ability         = require '../src/require'
inherits        = require 'inherits-ex/lib/inherits'
setImmediate    = setImmediate || process.nextTick

describe 'custom-ability/require', ->
  it 'should call the required ability', ->
    testable = require './mock/ability'
    My = ->
    opt = {a:122}
    ability('../test/mock', My, opt).should.be.equal My
    testable.should.have.been.calledOnce
    testable.should.have.been.calledWith My, opt
