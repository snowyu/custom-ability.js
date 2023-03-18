const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const should = chai.should();
const assert = chai.assert;
chai.use(sinonChai);
const path = require('path');
const ability = require('../src/require');
const inherits = require('inherits-ex/lib/inherits');
var setImmediate = setImmediate || process.nextTick;

describe('custom-ability/require', function() {
  return it('should call the required ability', function() {
    var My, opt, testable;
    testable = require('./mock/ability');
    My = function() {};
    opt = {
      a: 122
    };
    ability('../test/mock', My, opt).should.be.equal(My);
    testable.should.have.been.calledOnce;
    return testable.should.have.been.calledWith(My, opt);
  });
});

