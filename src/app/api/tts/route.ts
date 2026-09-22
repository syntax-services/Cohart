import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_COHART_VOICE } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId } = await req.json();

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Text prompt is required for speech synthesis' }, { status: 400 });
    }

    const apiKey = process.env.DEEPGRAM_API_KEY || 'b71d2681e4de82466541948b43557146bba93eeb';
    if (!apiKey) {
      return NextResponse.json({ error: 'Deepgram API key not configured' }, { status: 500 });
    }

    // Use requested voice or fall back to default Cohart Nova (Aura-2 Thalia)
    const selectedVoice = (voiceId && typeof voiceId === 'string' && voiceId.trim())
      ? voiceId.trim()
      : DEFAULT_COHART_VOICE;

    // Clean text: strip markdown symbols and tags so reading flow is clean, human, and natural
    const sanitizedText = text
      .replace(/[*#_~`>]/g, ' ')
      .replace(/\[(?:UPDATE_PROFILE|INTERACTIVE_CHOICES|MILESTONE_ACTION):[\s\S]*?\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Call Deepgram Speak API with the selected model
    // Aura-2 provides native low latency and contextual reading cadence
    const deepgramUrl = `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(selectedVoice)}`;

    const response = await fetch(deepgramUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: sanitizedText }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Deepgram Speak API error:', response.status, errText);
      return NextResponse.json(
        { error: `Speech synthesis failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error('TTS Route internal error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal speech synthesis error' },
      { status: 500 }
    );
  }
}
