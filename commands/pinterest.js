const axios = require('axios'); // For making API requests
const config = require('../config'); // Import config for API keys
const { sendMessage } = require('../server'); // Import sendMessage function

const pinterestApiKey = config.pinterest.apiKey;

// Function to search Pinterest for images
async function searchPinterest(query) {
  try {
    const response = await axios.get(`https://api.pinterest.com/v5/boards/search/`, {
      headers: {
        Authorization: `Bearer ${pinterestApiKey}`
      },
      params: {
        query: query,
        fields: 'image' // Specify fields to retrieve
      }
    });

    return response.data.data[0].image.original.url; // Return the first image URL
  } catch (error) {
    console.error("Error searching Pinterest:", error);
    return null;
  }
}

// Define the Pinterest command
const pinterest = async (query) => {
  const imageUrl = await searchPinterest(query);
  if (imageUrl) {
    sendMessage(senderId, {
      attachment: {
        type: 'image',
        payload: {
          url: imageUrl
        }
      }
    });
  } else {
    sendMessage(senderId, "Sorry, I couldn't find any images for that query.");
  }
};

module.exports = {
  pinterest: pinterest
};

