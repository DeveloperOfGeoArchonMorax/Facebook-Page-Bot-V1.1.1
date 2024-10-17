const openai = require('openai');
const openaiClient = new openai.OpenAIApi(new openai.Configuration({
  apiKey: 'sk-qrst1234qrst1234qrst1234qrst1234qrst123' 
}));

// Function to get ChatGPT response
const getChatGPTResponse = async (question) => {
  return new Promise((resolve, reject) => {
    openaiClient.createCompletion({
      model: "GPT-4", // Choose a suitable OpenAI model
      prompt: question,
      max_tokens: 100, // Adjust as needed
      temperature: 0.7, // Adjust for creativity level
    })
      .then(response => {
        resolve(response.data.choices[0].text);
      })
      .catch(error => {
        reject(error);
      });
  });
};

// Define the AI command
const ai = async (question) => {
  return await getChatGPTResponse(question);
};

module.exports = {
  ai: ai
};

