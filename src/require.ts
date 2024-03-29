async function getDefaultEntry(name: string) {
  let result = (await import(name)).default;
  if (typeof result !== "function" && typeof result.default === "function") {
    result = result.default;
  }
  return result;
}

export async function requireAbility(packageName, aClass, aOptions) {
  let addAbility: Function;
  try {
    addAbility = await getDefaultEntry(packageName + '/ability.js');
  } catch (error) {}
  if (typeof addAbility !== "function") {
    throw new TypeError('the package no ability supports.');
  }
  return addAbility(aClass, aOptions);
};

export default requireAbility
