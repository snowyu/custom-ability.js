import { expect, use } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
use(sinonChai);

import { createAbilityInjector, AbilityInjectorOptions } from "../src/custom-ability";
import { flattenAbility } from "../src/flatten-ability";

describe('Custom-Ability 继承支持 (TS + Chai + Sinon)', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('应该支持深层 super 调用并保持正确的 this 上下文', () => {
    class Simple {
      public name = 'simple';
      say() { return `I am ${this.name}`; }
    }

    class Advance extends Simple {
      // 覆盖父类方法并调用 super
      say() { return `${super.say()} and advanced`; }
    }

    const Flattened = flattenAbility(Advance);
    const inject = createAbilityInjector(Flattened);

    class MyService {
      public name = 'ServiceInstance';
    }

    inject(MyService);
    const instance = new MyService() as any;

    // 验证：虽然方法定义在 Ability，但 this 必须指向 MyService 实例
    expect(instance.say()).to.equal('I am ServiceInstance and advanced');
  });

  it('应该能通过 Sinon Spy 监控父类方法的执行', () => {
    const parentActionStub = sandbox.stub().returns('parent_result');

    class Simple {
      action() { return parentActionStub.apply(this); }
    }

    class Advance extends Simple {
      action() { return `child_${super.action()}`; }
    }

    const Flattened = flattenAbility(Advance);
    const inject = createAbilityInjector(Flattened);

    class Target {}
    inject(Target);

    const obj = new Target() as any;
    const result = obj.action();

    expect(result).to.equal('child_parent_result');
    expect(parentActionStub).to.have.been.calledOnce;
    // 验证执行上下文确实是目标实例
    expect(parentActionStub.firstCall.thisValue).to.equal(obj);
  });

  it('应该支持静态 getter 的继承与拉平', () => {
    class Simple {
      static get config() { return { base: true }; }
    }
    class Advance extends Simple {
      static get config() {
        return { ...super.config, advanced: true };
      }
    }

    const Flattened = flattenAbility(Advance);
    const inject = createAbilityInjector(Flattened);

    class TargetApp {}
    inject(TargetApp);

    const App = TargetApp as any;
    expect(App.config).to.deep.equal({ base: true, advanced: true });
  });

  it('应该正确搬运属性描述符 (Getter/Setter)', () => {
    let shadowValue = '';
    class Simple {
      get data() { return shadowValue; }
      set data(v: string) { shadowValue = v.toUpperCase(); }
    }
    class Advance extends Simple {}

    const Flattened = flattenAbility(Advance);
    const inject = createAbilityInjector(Flattened);

    class Target {}
    inject(Target);

    const instance = new Target() as any;
    instance.data = 'test';

    expect(shadowValue).to.equal('TEST');
    expect(instance.data).to.equal('TEST');
  });

  it('在多级继承 A->B->C 中，最顶层方法应能被访问', () => {
    class A { methodA() { return 'A'; } }
    class B extends A { methodB() { return 'B'; } }
    class C extends B { methodC() { return 'C'; } }

    const Flattened = flattenAbility(C);
    const inject = createAbilityInjector(Flattened);

    class Target {}
    inject(Target);

    const instance = new Target() as any;
    expect(instance.methodA()).to.equal('A');
    expect(instance.methodB()).to.equal('B');
    expect(instance.methodC()).to.equal('C');
  });
});
