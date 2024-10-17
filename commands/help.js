const commands = require('./index'); // Import all commands

// Function to generate help message
const help = () => {
  let message = "Here are the available commands:\n\n";
  for (const command in commands) {
    message += `- ${command}\n`;
  }
  return message;
};

module.exports = {
  help: help
};

