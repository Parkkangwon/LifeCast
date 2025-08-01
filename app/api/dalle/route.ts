import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, n = 1, size = '1024x1024' } = body;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        n,
        size,
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      throw new Error(`DALL-E API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('DALL-E API error:', error);
    return NextResponse.json(
      { error: 'DALL-E API 호출 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 