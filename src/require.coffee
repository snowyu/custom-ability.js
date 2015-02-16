module.exports = (packageName, aClass, aOptions) ->
  try addAbility = require packageName + '/ability'
  throw TypeError 'the package no ability supports.' unless addAbility
  addAbility aClass, aOptions
