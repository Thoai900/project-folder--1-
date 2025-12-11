// Vercel Serverless Function for Prompt Refinement
// Refines user prompts to be more clear and effective using Gemini AI

module.exports = async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        // Extract raw prompt from request body
        const { prompt } = req.body;

        // Validate input
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid "prompt" in request body.' });
        }

        if (prompt.trim().length < 5) {
            return res.status(400).json({ error: 'Prompt is too short. Please provide more context.' });
        }

        // Get API key from environment variables
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not configured');
            return res.status(500).json({ error: 'Server configuration error: API key not found.' });
        }

        // System instruction for prompt refinement
        const systemInstruction = `Bạn là chuyên gia Prompt Engineering. Hãy viết lại prompt của người dùng để nó rõ ràng, chuyên nghiệp và tối ưu hơn cho AI model. 

Quy tắc:
- Giữ nguyên ý định gốc của người dùng
- Thêm bối cảnh và cấu trúc nếu cần
- Làm cho prompt cụ thể, dễ hiểu hơn
- Chỉ trả về DUY NHẤT nội dung prompt mới
- KHÔNG thêm lời giải thích, mô tả hay markdown formatting
- KHÔNG nói "Đây là prompt đã được cải thiện" hay tương tự
- Trả về ngay prompt hoàn chỉnh, sẵn sàng để copy-paste`;

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
                                text: `Prompt gốc: ${prompt}`
                            }
                        ]
                    }
                ],
                systemInstruction: {
                    parts: [
                        {
                            text: systemInstruction
                        }
                    ]
                },
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 1000
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

        // Extract refined prompt
        const refinedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text || prompt;

        // Return successful response
        return res.status(200).json({ 
            original: prompt,
            refined: refinedPrompt.trim()
        });

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}
