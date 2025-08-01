import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, apiKey, ...params } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 키가 필요합니다.' },
        { status: 400 }
      );
    }

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    };

    let url = '';
    let method = 'GET';
    let requestBody = null;

    switch (action) {
      case 'test-connection':
        url = 'https://api.notion.com/v1/users/me';
        method = 'GET';
        break;
      
      case 'get-databases':
        url = 'https://api.notion.com/v1/search';
        method = 'POST';
        requestBody = {
          filter: {
            property: 'object',
            value: 'database'
          }
        };
        break;
      
      case 'create-page':
        url = 'https://api.notion.com/v1/pages';
        method = 'POST';
        requestBody = params;
        break;
      
      case 'query-database':
        url = `https://api.notion.com/v1/databases/${params.databaseId}/query`;
        method = 'POST';
        requestBody = params.query || {};
        break;
      
      case 'update-page':
        url = `https://api.notion.com/v1/pages/${params.pageId}`;
        method = 'PATCH';
        requestBody = params;
        break;
      
      case 'delete-page':
        url = `https://api.notion.com/v1/pages/${params.pageId}`;
        method = 'PATCH';
        requestBody = { archived: true };
        break;
      
      default:
        return NextResponse.json(
          { error: '지원하지 않는 액션입니다.' },
          { status: 400 }
        );
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (requestBody) {
      fetchOptions.body = JSON.stringify(requestBody);
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: `Notion API 오류: ${response.status}`,
          details: data,
          status: response.status
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Notion API 프록시 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 