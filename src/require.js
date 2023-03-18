module.exports = function(packageName, aClass, aOptions) {
  let addAbility;
  try {
    addAbility = require(packageName + '/ability');
  } catch (error) {}
  if (!addAbility) {
    throw TypeError('the package no ability supports.');
  }
  return addAbility(aClass, aOptions);
};

