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

    const { data: transactions, error } = await supabase
      .from('finance_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('거래 내역 조회 오류:', error);
      return NextResponse.json({ error: '거래 내역을 불러오는데 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, item, amount, category, memo, type, source } = body;

    if (!userId || !item || !amount || !category || !type) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
    }

    const { data: transaction, error } = await supabase
      .from('finance_transactions')
      .insert({
        user_id: userId,
        item,
        amount: parseFloat(amount),
        category,
        memo: memo || '',
        type,
        source: source || '현금'
      })
      .select()
      .single();

    if (error) {
      console.error('거래 내역 저장 오류:', error);
      return NextResponse.json({ error: '거래 내역을 저장하는데 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, item, amount, category, memo, type, source } = body;

    if (!id) {
      return NextResponse.json({ error: '거래 ID가 필요합니다.' }, { status: 400 });
    }

    const updateData: any = {};
    if (item !== undefined) updateData.item = item;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (category !== undefined) updateData.category = category;
    if (memo !== undefined) updateData.memo = memo;
    if (type !== undefined) updateData.type = type;
    if (source !== undefined) updateData.source = source;

    const { data: transaction, error } = await supabase
      .from('finance_transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('거래 내역 수정 오류:', error);
      return NextResponse.json({ error: '거래 내역을 수정하는데 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '거래 ID가 필요합니다.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('finance_transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('거래 내역 삭제 오류:', error);
      return NextResponse.json({ error: '거래 내역을 삭제하는데 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 