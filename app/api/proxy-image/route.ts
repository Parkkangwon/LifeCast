import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // DALL-E 이미지 URL인지 확인
    if (!imageUrl.includes('oaidalleapiprodscus.blob.core.windows.net')) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
    }

    // 이미지 가져오기
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      // 이미지 로딩 실패 시 플레이스홀더 반환
      const placeholderResponse = await fetch(`https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}&blur=2`);
      const placeholderBuffer = await placeholderResponse.arrayBuffer();
      
      return new NextResponse(placeholderBuffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    
    // 오류 발생 시 플레이스홀더 반환
    try {
      const placeholderResponse = await fetch(`https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}&blur=2`);
      const placeholderBuffer = await placeholderResponse.arrayBuffer();
      
      return new NextResponse(placeholderBuffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (placeholderError) {
      return NextResponse.json({ error: 'Failed to load image' }, { status: 500 });
    }
  }
} 