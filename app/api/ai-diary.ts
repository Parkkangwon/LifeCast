import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt, mode } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'No OpenAI API key' }, { status: 500 });
  }

  let openaiUrl = 'https://api.openai.com/v1/chat/completions';
  let messages = [];
  let model = 'gpt-3.5-turbo';

  if (mode === 'image') {
    openaiUrl = 'https://api.openai.com/v1/images/generations';
  }

  try {
    let result;
    if (mode === 'image') {
      // DALL-E 이미지 생성
      const res = await fetch(openaiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt,
          n: 1,
          size: '512x512',
        }),
      });
      result = await res.json();
      return NextResponse.json({ image: result.data?.[0]?.url || null });
    } else {
      // 텍스트 기반 (자동완성, 감정분석, 요약)
      if (mode === 'auto') {
        messages = [
          { role: 'system', content: '너는 감성적이고 창의적인 한국어 일기 작가야. 사용자가 쓴 일기를 이어서 자연스럽게 완성해줘.' },
          { role: 'user', content: prompt },
        ];
      } else if (mode === 'emotion') {
        messages = [
          { role: 'system', content: '너는 감정 분석가야. 사용자가 쓴 일기의 감정(예: 행복, 슬픔, 분노, 불안, 설렘 등)을 한글로 한 단어로만 분석해줘.' },
          { role: 'user', content: prompt },
        ];
      } else if (mode === 'summary') {
        messages = [
          { role: 'system', content: '너는 요약 전문가야. 사용자가 쓴 일기를 1~2문장으로 간결하게 요약해줘.' },
          { role: 'user', content: prompt },
        ];
      } else {
        messages = [
          { role: 'user', content: prompt },
        ];
      }
      const res = await fetch(openaiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
        }),
      });
      result = await res.json();
      return NextResponse.json({ result: result.choices?.[0]?.message?.content || '' });
    }
  } catch (e) {
    return NextResponse.json({ error: 'OpenAI API error', detail: String(e) }, { status: 500 });
  }
} 