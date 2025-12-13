// Vercel Serverless Function for Google Gemini API
// This function acts as a proxy to securely call Google Gemini API without exposing the API key

const admin = require('firebase-admin');

// Initialize Firebase Admin (Vercel provides env vars)
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    });
}

module.exports = async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        // Extract and verify Firebase ID Token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid Authorization header. Please login first.' });
        }

        const idToken = authHeader.substring(7);
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (error) {
            console.error('Token verification failed:', error.message);
            return res.status(401).json({ error: 'Invalid or expired token. Please login again.' });
        }

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
