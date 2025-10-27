import { FeedbackResponse, EVALUATION_PARAMETERS } from '@/types/analysis';
import { createClient } from '@deepgram/sdk';

import { GoogleGenAI, Type, Schema } from '@google/genai';

require("dotenv").config();


/**
 * Dynamically generate the properties for the 'scores' object based on EVALUATION_PARAMETERS,
 * including specific scoring rules in the description.
 */
const scoreProperties = EVALUATION_PARAMETERS.reduce((acc, param) => {
    // Determine the specific scoring rule text based on inputType
    const scoreRule = param.inputType === 'PASS_FAIL'
        ? `Must be **${param.weight}** (PASS) or **0** (FAIL) only.`
        : `Must be a number between **0** and **${param.weight}**, inclusive.`;

    acc[param.key] = {
        type: Type.NUMBER,
        description: `Score awarded for ${param.name}. ${scoreRule}`,
    };
    return acc;
}, {} as Record<string, Schema>);


/**
 * Define the required JSON Schema for the Gemini API, ensuring the output matches FeedbackResponse.
 */
const FeedbackResponseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        scores: {
            type: Type.OBJECT,
            description: 'The scored results for each evaluation parameter.',
            properties: scoreProperties,
            required: EVALUATION_PARAMETERS.map(p => p.key), // All keys must be present
        },
        overallFeedback: {
            type: Type.STRING,
            description: 'A 2-3 sentence summary of the agent\'s performance, highlighting strengths and weaknesses.',
        },
        observation: {
            type: Type.STRING,
            description: 'Detailed, specific observations with direct examples or quotes from the call transcript.',
        },
    },
    required: ['scores', 'overallFeedback', 'observation'],
};


// --- CORE FUNCTIONS ---

/**
 * Analyzes call recording using Deepgram STT and Google Gemini structured output
 */
export async function analyzeCallRecording(audioFile: File): Promise<FeedbackResponse> {
    try {
        const transcription = await transcribeAudio(audioFile);

        const analysisResults = await analyzeTranscript(transcription);

        return analysisResults;
    } catch (error) {
        console.error('Error analyzing call recording:', error);
        throw new Error('Failed to analyze call recording');
    }
}

/**
 * Transcribe audio file using Deepgram STT
 */
async function transcribeAudio(audioFile: File): Promise<string> {
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    console.log(deepgramApiKey)

    if (!deepgramApiKey) {
        throw new Error('DEEPGRAM_API_KEY is not configured');
    }

    const deepgram = createClient(deepgramApiKey);

    // Convert File to ArrayBuffer
    const audioBuffer = await audioFile.arrayBuffer();

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        Buffer.from(audioBuffer),
        {
            model: 'nova-3',
            language: 'multi',
            smart_format: true,
        }
    );

    if (error) {
        throw new Error(`Deepgram transcription failed: ${error.message}`);
    }

    // Extract transcript text
    const transcript = result?.results?.channels[0]?.alternatives[0]?.transcript;

    if (!transcript) {
        throw new Error('No transcription result returned from Deepgram');
    }

    return transcript;
}

/**
 * Analyze transcript using Google Gemini with GUARANTEED structured output
 */
async function analyzeTranscript(transcript: string): Promise<FeedbackResponse> {
    const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!geminiApiKey) {
        throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }

    // *** CORRECTED INSTANTIATION: Using GoogleGenAI ***
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    // *** CORRECTED API CALL: Using the simplified models.generateContent ***
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // A great model for fast, reliable structured output
        contents: buildAnalysisPrompt(transcript),
        config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: FeedbackResponseSchema, // Enforces the structure
        },
    });

    // The response object structure is slightly different in the new SDK
    const text = response.text;

    const analysisResults = JSON.parse(text) as FeedbackResponse;

    return analysisResults;
}

/**
 * Build comprehensive analysis prompt for Gemini
 */
function buildAnalysisPrompt(transcript: string): string {
    const parametersDescription = EVALUATION_PARAMETERS.map(param => {
        const scoreType = param.inputType === 'PASS_FAIL'
            ? `PASS (${param.weight}) or FAIL (0)`
            : `Score from 0 to ${param.weight}`;

        return `- **${param.name}** (${param.key}): ${param.desc}. ${scoreType}`;
    }).join('\n');

    return `You are an expert call quality analyst for a collections agency. Analyze the following call transcript and evaluate it based on these parameters:

**EVALUATION CRITERIA:**
${parametersDescription}

**TRANSCRIPT:**
${transcript}

**INSTRUCTIONS:**
1. Score each parameter objectively based on the transcript.
2. For PASS_FAIL parameters: award full points if criteria met, 0 if not.
3. For SCORE parameters: award points proportionally (0 to max weight).
4. Provide overall feedback summarizing strengths and weaknesses.
5. Include specific observations with examples from the call.

Return ONLY valid JSON that strictly conforms to the provided schema. Do not include any other text, markdown, or commentary.`;
}