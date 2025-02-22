require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const { CohereClient } = require('cohere-ai'); // Import CohereClient
const axios = require('axios'); // Import axios for ZeroGPT API
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Cohere with your API key
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY, // Use environment variable
});

// Middleware
app.use(cors({
  origin: 'https://soona112.github.io/essaychat/', // Replace with your GitHub Pages URL
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Route to serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Essay Generator Route
app.post('/generate-essay', async (req, res) => {
  const { prompt } = req.body;

  console.log('Received request to generate essay with prompt:', prompt);

  try {
    // Call Cohere's generate endpoint
    const response = await cohere.generate({
      prompt: `Write a 500-word essay on ${prompt}`,
      maxTokens: 500, // Adjust the length of the generated text
      temperature: 0.7, // Adjust creativity (0 = deterministic, 1 = creative)
    });

    console.log('Cohere API response:', response);

    // Extract the generated essay from the response
    const essay = response.generations[0].text;

    res.json({ essay });
  } catch (error) {
    console.error('Error calling Cohere API:', error);
    res.status(500).json({ error: 'Failed to generate essay', details: error.message });
  }
});

// Function to post-process the text
function postProcessText(text) {
  // Remove AI-specific phrases
  const aiPhrases = [
    "Sure!",
    "Here is a version of the text",
    "Let me know if there's anything else I can help you with!",
  ];

  let processedText = text;
  for (const phrase of aiPhrases) {
    processedText = processedText.replace(phrase, '');
  }

  // Trim extra spaces and newlines
  processedText = processedText.trim();

  return processedText;
}

// Humanize Text Route
app.post('/humanize', async (req, res) => {
  const { text } = req.body;

  try {
    // Step 1: Paraphrase the text
    const paraphraseResponse = await cohere.generate({
      prompt: `Paraphrase the following text in a natural, human-like tone: ${text}`,
      maxTokens: 300,
      temperature: 0.8,
    });
    let humanizedText = paraphraseResponse.generations[0].text;

    // Step 2: Simplify the text
    const simplifyResponse = await cohere.generate({
      prompt: `Simplify the following text for better readability: ${humanizedText}`,
      maxTokens: 300,
      temperature: 0.7,
    });
    humanizedText = simplifyResponse.generations[0].text;

    // Step 3: Add variability
    const variabilityResponse = await cohere.generate({
      prompt: `Rewrite the following text to make it sound more conversational and less repetitive: ${humanizedText}`,
      maxTokens: 300,
      temperature: 0.9,
    });
    humanizedText = variabilityResponse.generations[0].text;

    // Step 4: Post-process the text
    humanizedText = postProcessText(humanizedText);

    res.json({ humanized: humanizedText });
  } catch (error) {
    console.error('Error humanizing text:', error);
    res.status(500).json({ error: 'Failed to humanize text', details: error.message });
  }
});

// AI Detection Route (ZeroGPT API)
app.post('/detect-ai', async (req, res) => {
  const { text } = req.body;

  try {
    const response = await axios.post(
      'https://api.zerogpt.com/detect',
      { text },
      { headers: { Authorization: `Bearer ${process.env.ZEROGPT_API_KEY}` } } // Use environment variable
    );

    res.json({ isAI: response.data.isAI, confidence: response.data.confidence });
  } catch (error) {
    console.error('Error calling ZeroGPT API:', error);
    res.status(500).json({ error: 'Failed to detect AI', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
