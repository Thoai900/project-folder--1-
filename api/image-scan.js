// Vercel Serverless Function for Image Scanning with Gemini Vision
// Extracts text from images using Google Gemini Vision API

module.exports = async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        // Extract image data and mime type from request body
        const { imageBase64, mimeType, action = 'scan' } = req.body;

        // Validate input
        if (!imageBase64 || typeof imageBase64 !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid "imageBase64" in request body.' });
        }

        if (!mimeType || typeof mimeType !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid "mimeType" in request body.' });
        }

        // Get API key from environment variables
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not configured');
            return res.status(500).json({ error: 'Server configuration error: API key not found.' });
        }

        // Determine prompt based on action
        let promptText;
        if (action === 'scan') {
            promptText = "Trích xuất toàn bộ văn bản trong ảnh. Chỉ trả về kết quả raw text, không thêm lời dẫn hay mô tả.";
        } else if (action === 'refine') {
            const currentText = req.body.currentText || '';
            promptText = "Bạn là chuyên gia Prompt. Hãy viết lại văn bản sau thành một prompt hoàn chỉnh cho AI:\n" + currentText;
        } else {
            return res.status(400).json({ error: 'Invalid action. Use "scan" or "refine".' });
        }

        // Construct Google Gemini API URL
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        // Build payload based on action
        let payload;
        if (action === 'scan') {
            payload = {
                contents: [{
                    parts: [
                        { text: promptText },
                        { 
                            inline_data: { 
                                mime_type: mimeType, 
                                data: imageBase64 
                            } 
                        }
                    ]
                }]
            };
        } else {
            // refine action doesn't need image
            payload = {
                contents: [{
                    parts: [{ text: promptText }]
                }]
            };
        }

        // Call Google Gemini API
        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
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
