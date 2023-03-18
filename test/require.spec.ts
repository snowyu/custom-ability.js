import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.should();
import { assert } from 'chai';
chai.use(sinonChai);
import path from 'path';
import ability from '../src/require';
import inherits from 'inherits-ex/lib/inherits';
var setImmediate = setImmediate || process.nextTick;

async function getDefaultEntry(name: string) {
  let result = (await import(name)).default;
  if (typeof result !== "function" && typeof result.default === "function") {
    result = result.default;
  }
  return result;
}

describe('custom-ability/require', function() {
  return it('should call the required ability', async function() {
    let opt;
    const testable = await getDefaultEntry('./mock/ability.js');
    const My = function() {};
    opt = {
      a: 122
    };
    (await ability('../test/mock', My, opt)).should.be.equal(My);
    testable.should.have.been.calledOnce;
    return testable.should.have.been.calledWith(My, opt);
  });
});

