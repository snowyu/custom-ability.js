# custom-ability [![npm](https://img.shields.io/npm/v/custom-ability.svg)](https://npmjs.org/package/custom-ability) [![downloads](https://img.shields.io/npm/dm/custom-ability.svg)](https://npmjs.org/package/custom-ability) [![license](https://img.shields.io/npm/l/custom-ability.svg)](https://npmjs.org/package/custom-ability)

该库提供了一种向类中注入“能力”（Ability）的简便方法。通过 Mixin 模式，您可以将功能拆分为独立的能力类，并根据需要灵活地将其注入到目标类中，实现高度的模块化和代码复用。

## 核心特性 (Core Features)

* **解耦注入 (Decoupled Injection)**：无需显式继承，即可将一个类（Ability）的所有静态和实例成员注入到另一个目标类中。
* **智能 AOP 重载 (Smart AOP Overloading)**：
  * 自动识别 ES6 类中的**不可枚举方法**并启用 AOP 重载。
  * 支持在注入的方法中通过 `this.super()` 调用目标类的原始实现。
  * 通过 `this.self` 访问原始实例对象，确保逻辑绑定的准确性。
* **健壮的防重复注入 (Robust Duplicate Prevention)**：
  * **元数据标识**：在原型上通过 `$abilities`（Symbol 标识）登记已注入的能力。
  * **探测机制**：支持通过 `coreMethod`（核心方法）探测能力是否已存在，支持继承链回溯。
* **成员重构与改名 (Method Renaming)**：支持 `rename` 映射，允许在注入时更改方法名，彻底解决不同能力间的命名空间冲突。
* **精细化注入控制**：提供 `include`（包含）和 `exclude`（排除）参数，实现成员级别的精准注入。
* **能力间协作 (Additional Abilities)**：支持定义能力依赖（Depends）。当注入能力 A 时，若目标类已具备能力 B，则自动应用针对 B 的增强补丁。
* **动态能力工厂 (Ability Factory)**：支持根据目标类上下文动态生成 Ability 类的工厂模式。
* **TypeScript 原生支持**：提供完整的泛型支持和类型定义。

---

## 核心机制：方法重构与 AOP

在 `custom-ability` 中，方法重载是通过创建闭包实现的。在重载方法内部：

* **`this.super`**: 指向目标类原有的同名函数。
* **`this.self`**: 指向原始的调用实例。

**高级用法提示**：在能力类中使用以 **`$`** 开头的方法名（如 `$init`），可以强制要求注入器将其作为 `init` 的重载版本进行注入。

---

## 场景化示例 (Scenario Examples)

### 1. 基础注入：工具函数集成

**场景**：将通用的日志能力注入到业务服务中。

```javascript
import { createAbilityInjector } from 'custom-ability'

class LoggerAbility {
  static getLogPrefix() { return '[LOG]' }
  log(msg) {
    console.log(`${LoggerAbility.getLogPrefix()} ${msg}`);
  }
}

const injectLogger = createAbilityInjector(LoggerAbility);

class MyService {}
injectLogger(MyService);

const service = new MyService();
service.log('Hello'); // 输出: "[LOG] Hello"
```

### 2. AOP 重载：权限校验增强

**场景**：目标类已有同名方法，我们需要在保留原逻辑的基础上，增加能力类的逻辑。

```javascript
import { createAbilityInjector } from 'custom-ability'

class AuthAbility {
  // 使用 "$" 前缀表示：如果目标类已有 check，则进行 AOP 重载
  $check(user) {
    const original = this.super; // 目标类原有的 check 方法
    const self = this.self;      // 目标类的实例

    console.log('权限预检查...');
    if (original && original.call(self, user) === false) {
      throw new Error('权限检查未通过');
    }
    console.log('权限检查通过');
  }
}

const injectAuth = createAbilityInjector(AuthAbility);

class MyApi {
  check(user) {
    return user.isAdmin; // 原始逻辑
  }
}

injectAuth(MyApi);

const api = new MyApi();
api.check({ isAdmin: true });
// 输出:
// "权限预检查..."
// "权限检查通过"
```

### 3. 成员过滤：精准注入

**场景**：能力类有很多方法，但我们只想注入其中的一部分，或者排除特定的方法。

```javascript
class BigAbility {
  methodA() {}
  methodB() {}
  static staticA() {}
}

const injectBig = createAbilityInjector(BigAbility);

class TargetA {}
class TargetB {}

// 场景 A：仅包含特定的方法
injectBig(TargetA, { include: ['methodA', '@staticA'] });

// 场景 B：排除特定的方法
injectBig(TargetB, { exclude: ['methodB'] });
```

### 4. 方法重命名：规避命名冲突

**场景**：两个能力都有 `init` 方法，通过 `rename` 将它们映射到不同名称。

```javascript
class Ability {
  init() { console.log('Ability 内部初始化'); }
}

const inject = createAbilityInjector(Ability);

class MyComponent {
  init() { console.log('组件 UI 初始化'); }
}

inject(MyComponent, {
  rename: { init: 'initAbility' }
});

const comp = new MyComponent();
comp.init();          // 输出: "组件 UI 初始化"
comp.initAbility();   // 输出: "Ability 内部初始化"
```

### 5. 附加能力：能力间的自动协作

**场景**：当注入“状态能力”时，如果发现目标类还具备“事件能力”，则自动增强状态逻辑以支持发送事件。

```javascript
import { AdditionalInjectionMode, createAbilityInjector } from 'custom-ability';

const stateOptions = {
  depends: {
    Eventable: {
      mode: AdditionalInjectionMode.target,
      getOpts: () => ({
        methods: {
          setState(s) {
            this.super(s);
            this.self.emit('stateChange', s); // 自动增强：发送事件
          }
        }
      })
    }
  }
};

const injectState = createAbilityInjector(Stateable, stateOptions);
// 当 MyModel 具备 Eventable 后，injectState 将自动启用事件发送逻辑
```

### 6. 动态能力工厂：灵活定制

**场景**：根据目标类的名称或配置，动态生成最适合它的能力实现。

```javascript
const abilityFactory = (targetClass, options) => {
  return class DynamicAbility {
    getIdentifier() {
      return `ID_${targetClass.name}_${options.prefix || 'DEFAULT'}`;
    }
  };
};

const injectDynamic = createAbilityInjector(abilityFactory, true);

class User {}
injectDynamic(User, { prefix: 'USER' });

const user = new User();
console.log(user.getIdentifier()); // 输出: "ID_User_USER"
```

### 7. 探测机制：防止重复注入

**场景**：通过核心方法探测，确保同一个能力不会在继承链上被多次注入。

```javascript
class Identity {
  whoAmI() { return 'Me'; }
}

const injectIdentity = createAbilityInjector(Identity, 'whoAmI');

class Root {}
class Child extends Root {}

injectIdentity(Root);   // 第一次注入，成功
injectIdentity(Child);  // 探测发现 Child 已继承了 whoAmI，跳过注入
```

---

## API 详细参考

### `createAbilityInjector(abilityClass, coreMethod?, isGetClassFunction?, injectorOpts?)`

* **`abilityClass`** *(Function|Object)*: 要注入的类。
* **`coreMethod`** *(String|String[])*: 核心方法名，用于判定重复注入。
* **`isGetClassFunction`** *(Boolean)*: 是否启用工厂模式。
* **`injectorOpts`** *(Object)*:
  * `depends`: 定义附加能力依赖。
  * `afterInjection`: 注入完成后的回调钩子。

### 注入器调用选项 `(targetClass, options?)`

* **`include`/`exclude`** *(Array|String)*: 成员过滤（支持 `@` 静态前缀）。
* **`rename`** *(Object)*: 方法重命名映射 `{ 原名: 新名 }`。
* **`methods`/`classMethods`** *(Object)*: 运行时动态覆盖的方法。

---

## 内部元数据 (Metadata)

系统在目标类上维护了以下属性（通过 Symbol 保护）：

* **`$abilities`**: 已注入能力的注册表。
* **`$abilitiesOpt`**: 记录已应用的附加能力补丁。

---

## 版本演进 (V2)

* **TypeScript 重构**：提供完整的类型推导支持。
* **ESM 支持**：原生支持现代模块化加载。
* **重构增强**：正式引入 `rename` 机制，解决重构时的命名冲突。
* **逻辑优化**：改进了继承链上的能力探测算法。
