import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const apiKey = process.env.DEEPGRAM_API_KEY || 'b71d2681e4de82466541948b43557146bba93eeb';

    if (!apiKey) {
      return NextResponse.json({ error: 'Deepgram API key not configured' }, { status: 500 });
    }

    // Audio stream data from user's microphone
    const audioData = await req.arrayBuffer();

    if (!audioData || audioData.byteLength === 0) {
      return NextResponse.json({ error: 'No audio data received' }, { status: 400 });
    }

    // Call Deepgram Listen API using the latest flagship Nova-3 model
    // smart_format=true, punctuate=true, and model=nova-3 for highest accuracy & Nigerian student speech clarity
    const deepgramUrl = 'https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&punctuate=true';

    const response = await fetch(deepgramUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': contentType || 'audio/webm',
      },
      body: audioData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Deepgram Listen API error:', response.status, errText);
      return NextResponse.json(
        { error: `Transcription failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const transcript =
      data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

    return NextResponse.json({
      transcript: transcript.trim(),
      confidence: data.results?.channels?.[0]?.alternatives?.[0]?.confidence ?? 1.0,
      model: 'nova-3',
    });
  } catch (error: any) {
    console.error('STT Route internal error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal speech transcription error' },
      { status: 500 }
    );
  }
}
