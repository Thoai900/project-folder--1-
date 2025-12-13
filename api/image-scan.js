// Vercel Serverless Function for Image Scanning with Gemini Vision
// Extracts text from images and classifies content into problem/prompt structure

module.exports = async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const { imageBase64, mimeType, action = 'scan' } = req.body;

        if (!imageBase64 || !mimeType) {
            return res.status(400).json({ error: 'Missing image data.' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured.' });
        }

        // --- SMART PROMPT CLASSIFICATION ---
        let promptText;
        if (action === 'scan') {
            // Prompt AI to classify content into problem vs prompt template
            promptText = `
            Hãy đóng vai một trợ lý phân tích hình ảnh học tập và lập trình.
            Nhiệm vụ: Trích xuất văn bản từ hình ảnh và phân loại nó thành 2 phần:
            1. "problem": Các nội dung là đề bài, câu hỏi bài tập, vấn đề cần giải quyết, lỗi code...
            2. "prompts": Các nội dung là câu lệnh mẫu, hướng dẫn cho AI, hoặc template prompt.

            Yêu cầu đầu ra:
            Chỉ trả về một JSON object duy nhất (không markdown, không lời dẫn) theo cấu trúc sau:
            {
                "has_problem": boolean,
                "problem_content": "nội dung đề bài trích xuất được...",
                "has_prompts": boolean,
                "detected_prompts": ["prompt 1", "prompt 2"]
            }
            Nếu không phân biệt được, hãy đưa tất cả vào "problem_content".
            `;
        } else if (action === 'refine') {
            const currentText = req.body.currentText || '';
            promptText = "Bạn là chuyên gia Prompt. Hãy viết lại văn bản sau thành một prompt hoàn chỉnh cho AI:\n" + currentText;
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-09-2024:generateContent?key=${apiKey}`;

        // Build payload
        let payload = {
            contents: [{
                parts: [
                    { text: promptText },
                    { inline_data: { mime_type: mimeType, data: imageBase64 } }
                ]
            }]
        };

        // For scan action, force JSON response
        if (action === 'scan') {
            payload.generationConfig = {
                response_mime_type: "application/json"
            };
        }

        if (action === 'refine') {
            // Refine doesn't need image
            payload = {
                contents: [{ parts: [{ text: promptText }] }]
            };
        }

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.error) {
            console.error('Gemini API Error:', data.error);
            return res.status(response.status).json({ error: data.error.message });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}}
