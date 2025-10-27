Call Analysis Service built with Next.js

This project is a Next.js application designed to analyze call recordings using Deepgram for transcription and Google Gemini's structured output feature for quality scoring and feedback.

Prerequisites

API Keys: Obtain API keys for the two core services:

Deepgram: For converting audio recordings into text transcripts.

Google Gemini: For performing structured analysis on the transcripts.

Environment Variables: Create a file named .env in the root directory of your project and set the following keys. This is required for the dotenv package used in the analysis service.

# Required for the audio transcription service
DEEPGRAM_API_KEY="YOUR_DEEPGRAM_API_KEY_HERE"

# Required for the call quality analysis service (using the new @google/genai SDK)
GOOGLE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"



Installation

Install the necessary dependencies. This includes the Next.js standard dependencies plus the specific SDKs for Deepgram and Google Gemini (using the newer @google/genai package for reliable structured output).

npm install
# Ensure the specific SDKs are present:
npm install @deepgram/sdk @google/genai dotenv



Getting Started

Once dependencies are installed and your environment variables are set, run the development server:

npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev



Open http://localhost:3000 with your browser to see the result.
