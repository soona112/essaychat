const express = require('express');
const cors = require('cors');
const { CohereClient } = require('cohere-ai'); // Import CohereClient
const path = require('path');
const app = express();
const PORT = 3000;

// Initialize Cohere with your API key
const cohere = new CohereClient({
  token: '4CF9AFMrAh3vwWesbnqDQWDDEmKqEGMYL6Ne55Fa', // Replace with your Cohere API key
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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

//humanize ai

app.post('/humanize', async (req, res) => {
    const { text } = req.body;
  
    try {
      const response = await cohere.generate({
        prompt: `Paraphrase the following text to make it sound more human-like: ${text}`,
        maxTokens: 200, // Adjust as needed
        temperature: 0.7, // Adjust creativity
      });
  
      const humanizedText = response.generations[0].text;
      res.json({ humanized: humanizedText });
    } catch (error) {
      console.error('Error calling Cohere API:', error);
      res.status(500).json({ error: 'Failed to humanize text', details: error.message });
    }
  });


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});