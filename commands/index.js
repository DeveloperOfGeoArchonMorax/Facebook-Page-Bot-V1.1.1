
const help = require('./help');
const ai = require('./ai');
const pinterest = require('./pinterest');

const commands = {
  ...help,
  ...ai,
  ...pinterest
};

module.exports = commands;
