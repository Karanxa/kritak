const express = require('express');
const path = require('path');
const https = require('https');
const dotenv = require('dotenv');
const app = express();
const PORT = process.env.PORT || 3000;

// Load environment variables
dotenv.config();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoints
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        
        if (!userMessage) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        // Check if we should use Gemini API or local processing
        if (process.env.GEMINI_API_KEY && process.env.USE_GEMINI === 'true') {
            try {
                const aiResponse = await callGeminiAPI(userMessage);
                return res.json({ response: aiResponse });
            } catch (apiError) {
                console.error('Gemini API Error:', apiError);
                // Fall back to local processing
                const response = processSecurityChallenge(userMessage);
                return res.json({ response });
            }
        } else {
            // Use local processing
            const response = processSecurityChallenge(userMessage);
            return res.json({ response });
        }
        
    } catch (error) {
        console.error('Error processing chat request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Gemini API implementation
async function callGeminiAPI(prompt) {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        
        const requestBody = JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024
            }
        });
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        };
        
        const req = https.request(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    if (parsedData.candidates && parsedData.candidates[0] && 
                        parsedData.candidates[0].content && 
                        parsedData.candidates[0].content.parts) {
                        resolve(parsedData.candidates[0].content.parts[0].text);
                    } else {
                        reject(new Error('Invalid response format from Gemini API'));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
        
        req.on('error', (e) => {
            reject(e);
        });
        
        req.write(requestBody);
        req.end();
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});