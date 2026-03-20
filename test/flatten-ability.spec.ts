import { expect, use } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
use(sinonChai);

import { createAbilityInjector, AbilityInjectorOptions } from "../src/custom-ability";
import { flattenAbility } from "../src/flatten-ability";

describe('custom-ability: Inheritance & Super Keyword Support', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Basic Method Inheritance', () => {
    it('should inject inherited methods from parent classes', () => {
      class Simple { parentMethod() { return 'parent'; } }
      class Advance extends Simple { childMethod() { return 'child'; } }

      const Flattened = flattenAbility(Advance);
      const inject = createAbilityInjector(Flattened);

      class Target {}
      inject(Target);
      const instance = new Target() as any;

      expect(instance.parentMethod()).to.equal('parent');
      expect(instance.childMethod()).to.equal('child');
    });
  });

  describe('Super Keyword & HomeObject Binding', () => {
    it('should correctly execute super calls and maintain "this" context', () => {
      class Simple {
        public identity = 'base';
        greet() { return `Hello from ${this.identity}`; }
      }
      class Advance extends Simple {
        greet() { return `${super.greet()} and advanced`; }
      }

      const Flattened = flattenAbility(Advance);
      const inject = createAbilityInjector(Flattened);

      class Target { public identity = 'target'; }
      inject(Target);
      const instance = new Target() as any;

      // The super call looks up Simple.prototype, but "this" remains the Target instance
      expect(instance.greet()).to.equal('Hello from target and advanced');
    });
  });

  describe('Async Inheritance', () => {
    it('should handle async methods with super calls correctly', async () => {
      class Simple {
        async fetch() { return 'data'; }
      }
      class Advance extends Simple {
        async fetch() {
          const base = await super.fetch();
          return `${base}_plus`;
        }
      }

      const Flattened = flattenAbility(Advance);
      const inject = createAbilityInjector(Flattened);

      class Target {}
      inject(Target);
      const instance = new Target() as any;

      const result = await instance.fetch();
      expect(result).to.equal('data_plus');
    });
  });

  describe('Static Member Inheritance', () => {
    it('should flatten and inject static members including getters', () => {
      class Simple {
        static get version() { return 1; }
      }
      class Advance extends Simple {
        static get version() { return super.version + 1; }
      }

      const Flattened = flattenAbility(Advance);
      const inject = createAbilityInjector(Flattened);

      class TargetApp {}
      inject(TargetApp);

      const App = TargetApp as any;
      expect(App.version).to.equal(2);
    });
  });

  describe('Property Descriptors', () => {
    it('should preserve getters and setters during the flattening process', () => {
      let state = '';
      class Simple {
        get log() { return state; }
        set log(v: string) { state = v.toUpperCase(); }
      }
      class Advance extends Simple {}

      const Flattened = flattenAbility(Advance);
      const inject = createAbilityInjector(Flattened);

      class Target {}
      inject(Target);
      const instance = new Target() as any;

      instance.log = 'test';
      expect(state).to.equal('TEST');
      expect(instance.log).to.equal('TEST');
    });
  });

  describe('Complex Hierarchy (Multi-level)', () => {
    it('should correctly flatten deep inheritance chains (A->B->C)', () => {
      class A { a() { return 'A'; } }
      class B extends A { a() { return super.a() + 'B'; } }
      class C extends B { a() { return super.a() + 'C'; } }

      const Flattened = flattenAbility(C);
      const inject = createAbilityInjector(Flattened);

      class Target {}
      inject(Target);
      const instance = new Target() as any;

      expect(instance.a()).to.equal('ABC');
    });
  });

  describe('Edge Cases', () => {
    it('should not overwrite existing methods in subclasses', () => {
      class Simple { method() { return 'parent'; } }
      class Advance extends Simple { method() { return 'child'; } }

      const Flattened = flattenAbility(Advance);
      expect(Flattened.prototype.method()).to.equal('child');
    });

    it.skip('should handle Symbol-based members', () => {
      // do not supports!
      const sym = Symbol('test');
      class Simple { [sym]() { return 'symbol'; } }
      class Advance extends Simple {}

      const Flattened = flattenAbility(Advance);
      const inject = createAbilityInjector(Flattened);

      class Target {}
      inject(Target);
      const instance = new Target() as any;

      expect(instance[sym]()).to.equal('symbol');
    });
  });
});
