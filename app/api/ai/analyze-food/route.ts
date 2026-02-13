import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API Key is missing' },
                { status: 500 }
            );
        }

        const { image } = await req.json();

        if (!image) {
            return NextResponse.json(
                { error: 'Image data is required' },
                { status: 400 }
            );
        }

        // Remove the data URL prefix if present (handle all image types)
        const base64Image = image.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

        const prompt = `Analyze this food image. Identify the type of food and estimate its nutritional content.
    
    If the image is NOT food, or is too blurry, or contains multiple stacked foods that are impossible to distinguish, return this JSON:
    { "error": "unrecognized", "message": "Brief reason why (e.g., 'Gambar terlalu buram' or 'Bukan makanan')" }

    Otherwise, return a valid JSON object with this structure:
    {
      "name": "Food Name (in Indonesian)",
      "calories": number (approximate calories),
      "protein": number (grams),
      "carbs": number (grams),
      "fat": number (grams),
      "portion": "Estimated portion size (e.g., 1 piring, 1 mangkuk, 100g)"
    }
    
    Do not use Markdown code blocks. Return only raw JSON.`;

        // List of models to try in order of preference (using available models from list)
        const modelsToTry = [
            'gemini-flash-latest',
            'gemini-2.0-flash'
        ];

        let lastError;
        let success = false;
        let result;

        for (const modelName of modelsToTry) {
            try {
                // console.log(`Attempting analysis with model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                result = await model.generateContent([
                    prompt,
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: 'image/jpeg', // Gemini supports auto-detection or generic image/jpeg often works for base64
                        },
                    },
                ]);
                success = true;
                break; // Exit loop on success
            } catch (error: any) {
                console.warn(`Failed with ${modelName}: ${error.message}`);
                lastError = error;
                // Continue to next model
            }
        }

        if (!success || !result) {
            throw lastError || new Error('All models failed to generate content');
        }

        const response = await result.response;
        const text = response.text();

        // Clean up the text to ensure it's valid JSON
        // Find the first '{' and last '}'
        const firstOpen = text.indexOf('{');
        const lastClose = text.lastIndexOf('}');

        let cleanedText = text;
        if (firstOpen !== -1 && lastClose !== -1) {
            cleanedText = text.substring(firstOpen, lastClose + 1);
        } else {
            // Fallback cleanup if braces not found (unlikely)
            cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        try {
            const foodData = JSON.parse(cleanedText);
            return NextResponse.json(foodData);
        } catch (parseError) {
            console.error('Failed to parse AI response:', text);
            return NextResponse.json(
                { error: 'Failed to parse AI analysis results. Raw: ' + text.substring(0, 100) },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('AI Analysis Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze food image' },
            { status: 500 }
        );
    }
}
