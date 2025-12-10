// Vercel Serverless Function for Smart Prompt Generation
// Generates prompt templates from user ideas using Gemini AI

module.exports = async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        // Extract idea from request body
        const { idea } = req.body;

        // Validate input
        if (!idea || typeof idea !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid "idea" in request body.' });
        }

        // Get API key from environment variables
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not configured');
            return res.status(500).json({ error: 'Server configuration error: API key not found.' });
        }

        // System instruction for prompt generation
        const systemInstruction = `
            Bạn là chuyên gia Prompt Engineering. Tạo Prompt Template JSON từ ý tưởng của user.
            
            **YÊU CẦU CHẶT:**
            - Trả về JSON hợp lệ, KHÔNG bao quanh bởi markdown code blocks (\`\`\`).
            - Không thêm bất kỳ text, lời dẫn, mô tả hay giải thích nào ngoài JSON.
            - JSON phải chứa chính xác 4 trường: title, description, content, category
            - Không có dòng mới hay ký tự thêm ngoài JSON object
            
            Format JSON chỉ (KHÔNG thêm gì khác):
            {"title": "...", "description": "...", "content": "...", "category": "..."}
        `;

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
                                text: `Ý tưởng: ${idea}`
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
                    responseMimeType: "application/json"
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
