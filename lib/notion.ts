// Notion API 키는 환경 변수에서 가져오거나 사용자가 입력할 수 있도록 함
const getNotionApiKey = (): string => {
  // 환경 변수에서 먼저 확인
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedApiKey = localStorage.getItem('notionApiKey');
    if (savedApiKey) {
      return savedApiKey;
    }
  }
  
  // 기본값 (실제로는 사용자가 설정해야 함)
  return process.env.NEXT_PUBLIC_NOTION_API_KEY || '';
};

const NOTION_DATABASE_ID = ''; // 사용자가 설정할 수 있도록 빈 값으로 시작

export interface NotionPage {
  id: string;
  title: string;
  content: string;
  created_time: string;
  last_edited_time: string;
  properties: any;
}

export interface NotionDatabase {
  id: string;
  title: string;
  properties: any;
}

// Notion API 프록시 호출 함수
const callNotionAPI = async (action: string, params: any = {}) => {
  const apiKey = getNotionApiKey();
  if (!apiKey) {
    throw new Error('Notion API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.');
  }

  const response = await fetch('/api/notion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      apiKey,
      ...params
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `API 호출 실패: ${response.status}`);
  }

  return response.json();
};

// 데이터베이스 목록을 조회
export const getNotionDatabases = async (): Promise<NotionDatabase[]> => {
  try {
    const data = await callNotionAPI('get-databases');
    return data.results.map((db: any) => ({
      id: db.id,
      title: db.title?.[0]?.plain_text || 'Untitled Database',
      properties: db.properties
    }));
  } catch (error) {
    console.error('Notion 데이터베이스 조회 오류:', error);
    return [];
  }
};

// 페이지를 생성
export const createNotionPage = async (
  databaseId: string,
  title: string,
  content: string,
  properties: any = {}
): Promise<string | null> => {
  try {
    const data = await callNotionAPI('create-page', {
      parent: { database_id: databaseId },
      properties: {
        '제목': {
          title: [
            {
              text: {
                content: title
              }
            }
          ]
        },
        ...properties
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: content
                }
              }
            ]
          }
        }
      ]
    });
    return data.id;
  } catch (error) {
    console.error('Notion 페이지 생성 오류:', error);
    return null;
  }
};

// 페이지 조회
export const getNotionPages = async (databaseId: string): Promise<NotionPage[]> => {
  try {
    const data = await callNotionAPI('query-database', {
      databaseId,
      query: {
        sorts: [
          {
            property: 'created_time',
            direction: 'descending'
          }
        ]
      }
    });
    return data.results.map((page: any) => ({
      id: page.id,
      title: page.properties?.제목?.title?.[0]?.plain_text || 'Untitled',
      content: page.properties?.내용?.rich_text?.[0]?.plain_text || '',
      created_time: page.created_time,
      last_edited_time: page.last_edited_time,
      properties: page.properties
    }));
  } catch (error) {
    console.error('Notion 페이지 조회 오류:', error);
    return [];
  }
};

// 페이지 업데이트
export const updateNotionPage = async (
  pageId: string,
  title: string,
  content: string,
  properties: any = {}
): Promise<boolean> => {
  try {
    await callNotionAPI('update-page', {
      pageId,
      properties: {
        '제목': {
          title: [
            {
              text: {
                content: title
              }
            }
          ]
        },
        ...properties
      }
    });
    return true;
  } catch (error) {
    console.error('Notion 페이지 업데이트 오류:', error);
    return false;
  }
};

// 페이지 삭제
export const deleteNotionPage = async (pageId: string): Promise<boolean> => {
  try {
    await callNotionAPI('delete-page', { pageId });
    return true;
  } catch (error) {
    console.error('Notion 페이지 삭제 오류:', error);
    return false;
  }
};

// AI 일기 Notion 저장
export const saveAIDiaryToNotion = async (
  databaseId: string,
  diaryContent: string,
  emotion: string,
  date: string
): Promise<string | null> => {
  return createNotionPage(databaseId, `AI 일기 - ${date}`, diaryContent, {
    '감정': {
      select: {
        name: emotion
      }
    },
    '날짜': {
      date: {
        start: date
      }
    }
  });
};

// AI 가계부 Notion 저장
export const saveAIFinanceToNotion = async (
  databaseId: string,
  transaction: {
    item: string;
    amount: number;
    category: string;
    memo: string;
    type: 'income' | 'expense';
    date: string;
  }
): Promise<string | null> => {
  return createNotionPage(databaseId, `${transaction.item} - ${transaction.amount}원`, 
    `카테고리: ${transaction.category}\n메모: ${transaction.memo}`, {
    '금액': {
      number: transaction.amount
    },
    '카테고리': {
      select: {
        name: transaction.category
      }
    },
    '유형': {
      select: {
        name: transaction.type === 'income' ? '수입' : '지출'
      }
    },
    '날짜': {
      date: {
        start: transaction.date
      }
    }
  });
};

// 자서전 Notion 저장
export const saveAutobiographyToNotion = async (
  databaseId: string,
  sectionTitle: string,
  content: string,
  birthYear: number
): Promise<string | null> => {
  return createNotionPage(databaseId, `자서전 - ${sectionTitle}`, content, {
    '섹션': {
      select: {
        name: sectionTitle
      }
    },
    '출생년도': {
      number: birthYear
    }
  });
};

// Notion 연결 테스트
export const testNotionConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const data = await callNotionAPI('test-connection');
    console.log('Notion 연결 성공:', data.name);
    return { success: true, message: `연결 성공! 사용자: ${data.name}` };
  } catch (error) {
    console.error('Notion 연결 실패:', error);
    if (error instanceof Error) {
      if (error.message.includes('API 키가 설정되지 않았습니다')) {
        return { success: false, message: error.message };
      } else if (error.message.includes('401')) {
        return { success: false, message: 'API 키가 유효하지 않습니다. 올바른 API 키를 입력해주세요.' };
      } else if (error.message.includes('403')) {
        return { success: false, message: 'API 키에 권한이 없습니다. Notion 통합 설정을 확인해주세요.' };
      } else if (error.message.includes('API 호출 실패')) {
        return { success: false, message: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.' };
      }
    }
    return { success: false, message: '알 수 없는 오류가 발생했습니다.' };
  }
}; 