// 로컬 스토리지 전용 모드
console.log('📱 로컬 스토리지 모드로 실행됩니다.');

// 환경 변수 설정 안내
if (typeof window !== 'undefined') {
  console.log('💡 Supabase 설정이 필요하시면 .env.local 파일에 다음 내용을 추가하세요:');
  console.log(`
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
  `);
}

export interface FinanceTransaction {
  id?: string;
  user_id?: string;
  item: string;
  amount: number;
  category: string;
  memo: string;
  type: 'income' | 'expense';
  source?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FinanceChatMessage {
  id?: string;
  user_id?: string;
  type: 'user' | 'ai';
  message: string;
  timestamp?: string;
}

// 거래 내역을 조회
export const getFinanceTransactions = async (userId: string): Promise<FinanceTransaction[]> => {
  try {
    console.log('거래 내역 조회 시작 - userId:', userId);
    
    if (!userId) {
      console.error('userId가 없습니다.');
      return [];
    }

    console.log('📱 로컬 스토리지 모드로 실행 중...');
    return getLocalFinanceTransactions(userId);
  } catch (error) {
    console.error('❌ 거래 내역 조회 실패:', error, { userId });
    return [];
  }
};

// 로컬 스토리지에서 거래 내역을 조회 (fallback)
const getLocalFinanceTransactions = (userId: string): FinanceTransaction[] => {
  try {
    const localData = localStorage.getItem(`finance_transactions_${userId}`);
    if (localData) {
      const transactions = JSON.parse(localData);
      console.log('📱 로컬 스토리지에서 거래 내역 불러옴:', transactions.length, '개');
      return transactions;
    }
    console.log('📱 로컬 스토리지에 거래 내역이 없습니다.');
    return [];
  } catch (error) {
    console.error('❌ 로컬 스토리지 읽기 실패:', error);
    return [];
  }
};

// 거래 내역을 추가
export const addFinanceTransaction = async (transaction: Omit<FinanceTransaction, 'id' | 'created_at' | 'updated_at'>): Promise<FinanceTransaction | null> => {
  try {
    console.log('거래 내역 추가 시작:', transaction);
    
    if (!transaction.user_id) {
      console.error('user_id가 없습니다.');
      return null;
    }

    console.log('📱 로컬 스토리지 모드로 실행 중...');
    return addLocalFinanceTransaction(transaction);
  } catch (error) {
    console.error('❌ 거래 내역 추가 실패:', error, { transaction });
    return null;
  }
};

// 로컬 스토리지에 거래 내역을 추가 (fallback)
const addLocalFinanceTransaction = (transaction: Omit<FinanceTransaction, 'id' | 'created_at' | 'updated_at'>): FinanceTransaction | null => {
  try {
    const userId = transaction.user_id;
    if (!userId) {
      console.error('❌ user_id가 없어서 로컬 저장이 불가능합니다.');
      return null;
    }

    const newTransaction: FinanceTransaction = {
      ...transaction,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const localData = localStorage.getItem(`finance_transactions_${userId}`);
    const existingTransactions = localData ? JSON.parse(localData) : [];
    existingTransactions.unshift(newTransaction);
    
    localStorage.setItem(`finance_transactions_${userId}`, JSON.stringify(existingTransactions));
    console.log('📱 로컬 스토리지에 거래 내역 저장됨:', newTransaction);
    
    return newTransaction;
  } catch (error) {
    console.error('❌ 로컬 스토리지 저장 실패:', error);
    return null;
  }
};

// 거래 내역 수정
export const updateFinanceTransaction = async (id: string, updates: Partial<FinanceTransaction>): Promise<FinanceTransaction | null> => {
  try {
    console.log('📱 로컬 스토리지에서 거래 내역 수정 중...');
    return updateLocalFinanceTransaction(id, updates);
  } catch (error) {
    console.error('❌ 거래 내역 수정 실패:', error);
    return null;
  }
};

// 로컬 스토리지에서 거래 내역 수정
const updateLocalFinanceTransaction = (id: string, updates: Partial<FinanceTransaction>): FinanceTransaction | null => {
  try {
    // 모든 사용자의 거래 내역에서 해당 ID 찾기
    const keys = Object.keys(localStorage).filter(key => key.startsWith('finance_transactions_'));
    
    for (const key of keys) {
      const localData = localStorage.getItem(key);
      if (localData) {
        const transactions = JSON.parse(localData);
        const index = transactions.findIndex((t: FinanceTransaction) => t.id === id);
        
        if (index !== -1) {
          transactions[index] = { ...transactions[index], ...updates, updated_at: new Date().toISOString() };
          localStorage.setItem(key, JSON.stringify(transactions));
          console.log('📱 로컬 스토리지에서 거래 내역 수정됨:', transactions[index]);
          return transactions[index];
        }
      }
    }
    
    console.warn('⚠️ 수정할 거래 내역을 찾을 수 없습니다:', id);
    return null;
  } catch (error) {
    console.error('❌ 로컬 스토리지 수정 실패:', error);
    return null;
  }
};

// 거래 내역 삭제
export const deleteFinanceTransaction = async (id: string): Promise<boolean> => {
  try {
    console.log('📱 로컬 스토리지에서 거래 내역 삭제 중...');
    return deleteLocalFinanceTransaction(id);
  } catch (error) {
    console.error('❌ 거래 내역 삭제 실패:', error);
    return false;
  }
};

// 로컬 스토리지에서 거래 내역 삭제
const deleteLocalFinanceTransaction = (id: string): boolean => {
  try {
    // 모든 사용자의 거래 내역에서 해당 ID 찾기
    const keys = Object.keys(localStorage).filter(key => key.startsWith('finance_transactions_'));
    
    for (const key of keys) {
      const localData = localStorage.getItem(key);
      if (localData) {
        const transactions = JSON.parse(localData);
        const index = transactions.findIndex((t: FinanceTransaction) => t.id === id);
        
        if (index !== -1) {
          transactions.splice(index, 1);
          localStorage.setItem(key, JSON.stringify(transactions));
          console.log('📱 로컬 스토리지에서 거래 내역 삭제됨:', id);
          return true;
        }
      }
    }
    
    console.warn('⚠️ 삭제할 거래 내역을 찾을 수 없습니다:', id);
    return false;
  } catch (error) {
    console.error('❌ 로컬 스토리지 삭제 실패:', error);
    return false;
  }
};

// 채팅 메시지 조회
export const getFinanceChatMessages = async (userId: string): Promise<FinanceChatMessage[]> => {
  try {
    console.log('📱 로컬 스토리지에서 채팅 메시지 조회 중...');
    return getLocalFinanceChatMessages(userId);
  } catch (error) {
    console.error('❌ 채팅 메시지 조회 실패:', error);
    return [];
  }
};

// 로컬 스토리지에서 채팅 메시지 조회
const getLocalFinanceChatMessages = (userId: string): FinanceChatMessage[] => {
  try {
    const localData = localStorage.getItem(`finance_chat_messages_${userId}`);
    if (localData) {
      const messages = JSON.parse(localData);
      console.log('📱 로컬 스토리지에서 채팅 메시지 불러옴:', messages.length, '개');
      return messages;
    }
    console.log('📱 로컬 스토리지에 채팅 메시지가 없습니다.');
    return [];
  } catch (error) {
    console.error('❌ 로컬 스토리지 읽기 실패:', error);
    return [];
  }
};

// 채팅 메시지 추가
export const addFinanceChatMessage = async (message: Omit<FinanceChatMessage, 'id' | 'timestamp'>): Promise<FinanceChatMessage | null> => {
  try {
    console.log('📱 로컬 스토리지에 채팅 메시지 추가 중...');
    return addLocalFinanceChatMessage(message);
  } catch (error) {
    console.error('❌ 채팅 메시지 추가 실패:', error);
    return null;
  }
};

// 로컬 스토리지에 채팅 메시지 추가
const addLocalFinanceChatMessage = (message: Omit<FinanceChatMessage, 'id' | 'timestamp'>): FinanceChatMessage | null => {
  try {
    const userId = message.user_id;
    if (!userId) {
      console.error('❌ user_id가 없어서 로컬 저장이 불가능합니다.');
      return null;
    }

    const newMessage: FinanceChatMessage = {
      ...message,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    const localData = localStorage.getItem(`finance_chat_messages_${userId}`);
    const existingMessages = localData ? JSON.parse(localData) : [];
    existingMessages.push(newMessage);
    
    localStorage.setItem(`finance_chat_messages_${userId}`, JSON.stringify(existingMessages));
    console.log('📱 로컬 스토리지에 채팅 메시지 저장됨:', newMessage);
    
    return newMessage;
  } catch (error) {
    console.error('❌ 로컬 스토리지 저장 실패:', error);
    return null;
  }
};

// 채팅 메시지 삭제 (사용자별 전체 삭제)
export const clearFinanceChatMessages = async (userId: string): Promise<boolean> => {
  try {
    console.log('📱 로컬 스토리지에서 채팅 메시지 삭제 중...');
    return clearLocalFinanceChatMessages(userId);
  } catch (error) {
    console.error('❌ 채팅 메시지 삭제 실패:', error);
    return false;
  }
};

// 로컬 스토리지에서 채팅 메시지 삭제
const clearLocalFinanceChatMessages = (userId: string): boolean => {
  try {
    localStorage.removeItem(`finance_chat_messages_${userId}`);
    console.log('📱 로컬 스토리지에서 채팅 메시지 삭제됨:', userId);
    return true;
  } catch (error) {
    console.error('❌ 로컬 스토리지 삭제 실패:', error);
    return false;
  }
};

// 통계 계산 함수들
export const calculateFinanceStats = (transactions: FinanceTransaction[]) => {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // 카테고리별 지출 통계
  const categoryStats = expenseTransactions.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = { total: 0, count: 0 };
    }
    acc[category].total += transaction.amount;
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  return {
    totalIncome,
    totalExpense,
    balance,
    categoryStats,
    transactionCount: transactions.length,
    incomeCount: incomeTransactions.length,
    expenseCount: expenseTransactions.length
  };
};

// 월별 통계 계산
export const calculateMonthlyStats = (transactions: FinanceTransaction[], year: number, month: number) => {
  const monthlyTransactions = transactions.filter(transaction => {
    if (!transaction.created_at) return false;
    const date = new Date(transaction.created_at);
    return date.getFullYear() === year && date.getMonth() === month - 1;
  });

  return calculateFinanceStats(monthlyTransactions);
}; 