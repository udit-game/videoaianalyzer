// src/app/api/analyze-call/route.ts
import { NextResponse } from 'next/server';
import { analyzeCallRecording } from '@/services/ai-analysis.service';

// 📡 This is now purely the HTTP controller/handler layer.
export async function POST(request: Request) {
  try {
    // 1. HTTP Layer: Extract the file from the request body
    const formData = await request.formData();
    const audioFile = formData.get('audioFile');

    if (!(audioFile instanceof File)) {
      return NextResponse.json({ error: 'Audio file not found or invalid format.' }, { status: 400 });
    }

    // 2. HTTP Layer: Call the service layer (separation of concerns!)
    const results = await analyzeCallRecording(audioFile);

    // 3. HTTP Layer: Return the response
    return NextResponse.json(results, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    // Ensure sensitive internal errors are not exposed
    return NextResponse.json({ error: 'Internal server error during analysis. Check logs.' }, { status: 500 });
  }
}