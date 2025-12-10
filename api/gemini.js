// Vercel Serverless Function for Google Gemini API
// This function acts as a proxy to securely call Google Gemini API without exposing the API key

module.exports = async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        // Extract prompt and temperature from request body
        const { prompt, temperature = 0.7 } = req.body;

        // Validate input
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid "prompt" in request body.' });
        }

        // Get API key from environment variables
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not configured');
            return res.status(500).json({ error: 'Server configuration error: API key not found.' });
        }

        // Construct Google Gemini API URL
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        // Call Google Gemini API
        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
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
                    temperature: temperature
                }
            })
        });

        // Parse response
        const data = await response.json();

        // Check for errors from Gemini API
        if (data.error) {
            console.error('Gemini API Error:', data.error);
            return res.status(response.status).json({ 
                error: data.error.message || 'Error from Gemini API'
            });
        }

        // Return successful response
        return res.status(200).json(data);

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}
