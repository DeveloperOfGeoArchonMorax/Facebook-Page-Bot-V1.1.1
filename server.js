const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const fs = require('fs');
const openai = require('openai');

const config = JSON.parse(fs.readFileSync('config.json'));

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PAGE_ACCESS_TOKEN = config.facebook.pageAccessToken;
const VERIFY_TOKEN = config.facebook.verifyToken;

const openaiClient = new openai.OpenAIApi(new openai.Configuration({
  apiKey: config.openai.apiKey
}));

const commands = require('./commands'); // Import commands

// Verify webhook
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === VERIFY_TOKEN &&
    req.query['hub.challenge']) {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
});

// Handle incoming messages
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      entry.messaging.forEach(event => {
        if (event.message && event.message.text) {
          handleMessage(event);
        }
      });
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Handle message event
async function handleMessage(event) {
  const senderId = event.sender.id;
  const messageText = event.message.text;

  // Admin commands
  if (isAdmin(senderId)) {
    if (messageText.startsWith('!setstate ')) {
      const newState = messageText.slice('!setstate '.length);
      fs.writeFileSync('account.txt', newState);
      sendMessage(senderId, `State updated to: ${newState}`);
      return;
    }
  }

  // General commands
  if (messageText in commands) {
    const response = typeof commands[messageText] === 'function' ? 
      await commands[messageText](messageText.slice(messageText.indexOf(' ') + 1)) : 
      commands[messageText];
    sendMessage(senderId, response);
  } else {
    sendMessage(senderId, `I'm not sure I understand. Try a command like 'hello' or 'time'.`);
  }
}

// Function to send messages to Facebook Messenger
function sendMessage(recipientId, messageText) {
  const messageData = {
    messaging_type: 'RESPONSE',
    recipient: {
      id: recipientId,
    },
    message: {
      text: messageText,
    },
  };

  request({
    url: 'https://graph.facebook.com/v13.0/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData,
  }, (error, response, body) => {
    if (error) {
      console.error('Error sending message:', error);
    } else if (response.body.error) {
      console.error('Error: ', response.body.error);
    }
  });
}

// Check if the user is an admin
function isAdmin(senderId) {
  const adminIds = config.admin; 
  return adminIds.includes(senderId);
}

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
