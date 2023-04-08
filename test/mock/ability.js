const sinon = require('sinon');

module.exports = sinon.spy(function(aClass) {
  return aClass;
});

module.exports.a = sinon.spy(function(aClass) {
  return aClass;
})
