/* eslint-disable n/prefer-global/buffer */
const fs = require('node:fs');

function hasBOM(text) {
  return (text.toString().charCodeAt(0) === 0xFEFF);
}

function prependBOM(text) {
  return '\uFEFF' + text;
}

function stripBOM(text) {
  return text.toString().slice(1);
}

function prepend(filename, data) {
  let fileData;
  try {
    fileData = fs.readFileSync(filename);
  } catch (error) {
    if (error.code === 'ENOENT') {
      fs.writeFileSync(filename, data);
      return;
    }

    throw error;
  }

  data = hasBOM(fileData) ? prependBOM(data) : data;

  if (Buffer.compare(fileData.slice(0, data.length), Buffer.from(data)) !== 0) {
    fileData = hasBOM(fileData) ? stripBOM(fileData) : fileData;
    fs.writeFileSync(filename, Buffer.concat([Buffer.from(data), Buffer.from(fileData)]));
  }
};

const filename = process.argv[2]
if (filename) {
  prepend(filename, '// @sourceType: module\n')
}