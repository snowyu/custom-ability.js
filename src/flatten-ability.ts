/**
 * 工程级 Ability 拉平：
 * 1. 确保所有父类成员（Own Properties）都提升到当前 Ability 类。
 * 2. 保持 Property Descriptor（处理 Getter/Setter）。
 * 3. 这里的 super 无需处理，JS 引擎会自动处理静态绑定。
 */
export function flattenAbility<T extends Function>(AbilityClass: T): T {
  const rootProtos = [Object.prototype, Function.prototype, null];
  const targetProto = AbilityClass.prototype;

  const merge = (source: any, target: any) => {
    const keys = [...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)];
    keys.forEach(key => {
      if (['constructor', 'prototype', 'name', 'length'].includes(key as string)) { return }
      if (Object.prototype.hasOwnProperty.call(target, key)) { return }

      const desc = Object.getOwnPropertyDescriptor(source, key);
      if (desc) { Object.defineProperty(target, key, desc) }
    });
  };

  // 1. 拉平实例原型链
  let currentProto = Object.getPrototypeOf(targetProto);
  while (currentProto && !rootProtos.includes(currentProto)) {
    merge(currentProto, targetProto);
    currentProto = Object.getPrototypeOf(currentProto);
  }

  // 2. 拉平静态成员链
  let currentStatic = Object.getPrototypeOf(AbilityClass);
  while (currentStatic && !rootProtos.includes(currentStatic)) {
    merge(currentStatic, AbilityClass);
    currentStatic = Object.getPrototypeOf(currentStatic);
  }

  return AbilityClass;
}
