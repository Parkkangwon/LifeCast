import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 });
    }

    const { data: messages, error } = await supabase
      .from('finance_chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('채팅 메시지 조회 오류:', error);
      return NextResponse.json({ error: '채팅 메시지를 불러오는데 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, message } = body;

    if (!userId || !type || !message) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
    }

    const { data: chatMessage, error } = await supabase
      .from('finance_chat_messages')
      .insert({
        user_id: userId,
        type,
        message
      })
      .select()
      .single();

    if (error) {
      console.error('채팅 메시지 저장 오류:', error);
      return NextResponse.json({ error: '채팅 메시지를 저장하는데 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ message: chatMessage });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('finance_chat_messages')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('채팅 메시지 삭제 오류:', error);
      return NextResponse.json({ error: '채팅 메시지를 삭제하는데 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 