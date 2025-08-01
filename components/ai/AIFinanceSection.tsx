import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  Download,
  Edit3
} from '@/components/ui/common';
import { cn, generateUniqueId, handleError, showSuccess } from '@/lib/utils';

interface FinanceTransaction {
  id: string;
  item: string;
  amount: number;
  category: string;
  memo: string;
  type: 'income' | 'expense';
  source?: string;
  timestamp: Date;
}

interface FinanceChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

interface FinanceAnalysis {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryBreakdown: Record<string, number>;
  monthlyStats: Record<string, { income: number; expense: number }>;
}

interface AIFinanceSectionProps {
  onBackToMenu?: () => void;
}

const AIFinanceSection: React.FC<AIFinanceSectionProps> = ({ onBackToMenu }) => {
  const { user } = useAuth();

  // 상태 관리
  const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>([]);
  const [financeChatMessages, setFinanceChatMessages] = useState<FinanceChatMessage[]>([]);
  const [financeChatInput, setFinanceChatInput] = useState('');
  const [isFinanceChatLoading, setIsFinanceChatLoading] = useState(false);
  const [financeAnalysis, setFinanceAnalysis] = useState<FinanceAnalysis>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    categoryBreakdown: {},
    monthlyStats: {}
  });
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // 거래 추가 폼 상태 관리
  const [newTransaction, setNewTransaction] = useState({
    item: '',
    amount: '',
    category: '',
    memo: '',
    type: 'expense' as 'income' | 'expense',
    source: ''
  });

  const expenseCategories = [
    '식비', '교통비', '주거비', '통신비', '의료비', '교육비', 
    '문화생활', '쇼핑', '여행', '기타'
  ];

  const incomeCategories = [
    '급여', '용돈', '투자수익', '부업', '기타수입'
  ];

  // 거래 내역 불러오기
  const loadFinanceData = async () => {
    try {
      const saved = localStorage.getItem('financeTransactions');
      if (saved) {
        const transactions = JSON.parse(saved);
        setFinanceTransactions(transactions.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp)
        })));
      }
      updateFinanceAnalysis();
    } catch (error) {
      handleError(error, '가계부 데이터 로드');
    }
  };

  // 거래 분석 업데이트
  const updateFinanceAnalysis = () => {
    const analysis: FinanceAnalysis = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      categoryBreakdown: {},
      monthlyStats: {}
    };

    financeTransactions.forEach(transaction => {
      if (transaction.type === 'income') {
        analysis.totalIncome += transaction.amount;
      } else {
        analysis.totalExpense += transaction.amount;
        analysis.categoryBreakdown[transaction.category] = 
          (analysis.categoryBreakdown[transaction.category] || 0) + transaction.amount;
      }

      const month = transaction.timestamp.toISOString().slice(0, 7);
      if (!analysis.monthlyStats[month]) {
        analysis.monthlyStats[month] = { income: 0, expense: 0 };
      }
      if (transaction.type === 'income') {
        analysis.monthlyStats[month].income += transaction.amount;
      } else {
        analysis.monthlyStats[month].expense += transaction.amount;
      }
    });

    analysis.balance = analysis.totalIncome - analysis.totalExpense;
    setFinanceAnalysis(analysis);
  };

  // 거래 추가
  const addFinanceTransaction = async (transaction: Omit<FinanceTransaction, 'id' | 'timestamp'>) => {
    const newTransaction: FinanceTransaction = {
      id: generateUniqueId(),
      ...transaction,
      timestamp: new Date()
    };

    setFinanceTransactions(prev => [newTransaction, ...prev]);
    
    // localStorage에 저장
    const savedTransactions = JSON.parse(localStorage.getItem('financeTransactions') || '[]');
    savedTransactions.unshift(newTransaction);
    localStorage.setItem('financeTransactions', JSON.stringify(savedTransactions));
    
    updateFinanceAnalysis();
    showSuccess('거래가 추가되었습니다!');
  };

  // 거래 삭제
  const deleteFinanceTransaction = (id: string) => {
    setFinanceTransactions(prev => prev.filter(t => t.id !== id));
    
    // localStorage에서도 삭제
    const savedTransactions = JSON.parse(localStorage.getItem('financeTransactions') || '[]');
    const filteredTransactions = savedTransactions.filter((t: any) => t.id !== id);
    localStorage.setItem('financeTransactions', JSON.stringify(filteredTransactions));
    
    updateFinanceAnalysis();
    showSuccess('거래가 삭제되었습니다.');
  };

  // 챗봇 메시지 추가
  const addFinanceChatMessage = (type: 'user' | 'ai', message: string) => {
    const newMessage: FinanceChatMessage = {
      id: generateUniqueId(),
      type,
      message,
      timestamp: new Date()
    };
    setFinanceChatMessages(prev => [...prev, newMessage]);
  };

  // AI 응답 생성
  const generateFinanceAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // 간단한 키워드 기반 응답
    if (lowerMessage.includes('총') || lowerMessage.includes('전체')) {
      if (lowerMessage.includes('수입') || lowerMessage.includes('수익')) {
        return `이번 달 총 수입은 ${financeAnalysis.totalIncome.toLocaleString()}원입니다. 💰`;
      } else if (lowerMessage.includes('지출') || lowerMessage.includes('비용')) {
        return `이번 달 총 지출은 ${financeAnalysis.totalExpense.toLocaleString()}원입니다. 💸`;
      } else {
        return `이번 달 총 수입: ${financeAnalysis.totalIncome.toLocaleString()}원, 총 지출: ${financeAnalysis.totalExpense.toLocaleString()}원, 잔액: ${financeAnalysis.balance.toLocaleString()}원입니다. 📊`;
      }
    }
    
    if (lowerMessage.includes('카테고리') || lowerMessage.includes('분류')) {
      const topCategories = Object.entries(financeAnalysis.categoryBreakdown)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
      
      if (topCategories.length > 0) {
        const categoryText = topCategories.map(([category, amount]) => 
          `${category}: ${amount.toLocaleString()}원`
        ).join(', ');
        return `가장 많이 지출한 카테고리는 ${categoryText}입니다. 📈`;
      }
    }
    
    if (lowerMessage.includes('절약') || lowerMessage.includes('팁')) {
      return `절약 팁: 1) 카드 사용 내역을 정기적으로 확인하세요 2) 불필요한 구독 서비스를 해지하세요 3) 장보기 전에 목록을 작성하세요 4) 대중교통을 활용하세요 💡`;
    }
    
    // 기본 응답
    const responses = [
      "가계부에 대해 궁금한 점이 있으시면 언제든 물어보세요! 💰",
      "수입, 지출, 카테고리별 분석 등 다양한 정보를 제공해드릴 수 있어요 📊",
      "절약 팁이나 재정 관리 조언도 도와드릴 수 있습니다 💡",
      "특정 카테고리나 기간의 지출을 분석해드릴까요? 🤔"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // 챗봇 메시지 전송
  const sendFinanceChatMessage = async (message: string) => {
    if (!message.trim() || isFinanceChatLoading) return;
    
    addFinanceChatMessage('user', message);
    setFinanceChatInput('');
    setIsFinanceChatLoading(true);
    
    try {
      // 약간의 지연을 두어 자연스러운 대화 느낌 연출
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const aiResponse = generateFinanceAIResponse(message);
      addFinanceChatMessage('ai', aiResponse);
    } catch (error) {
      handleError(error, 'AI 응답 생성');
      addFinanceChatMessage('ai', '죄송해요, 잠시 문제가 있었네요. 다시 말씀해주세요 😊');
    } finally {
      setIsFinanceChatLoading(false);
    }
  };

  // 거래 추가 처리
  const handleAddTransaction = () => {
    if (!newTransaction.item || !newTransaction.amount || !newTransaction.category) {
      showSuccess('모든 필수 항목을 입력해주세요.');
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      showSuccess('올바른 금액을 입력해주세요.');
      return;
    }

    addFinanceTransaction({
      item: newTransaction.item,
      amount,
      category: newTransaction.category,
      memo: newTransaction.memo,
      type: newTransaction.type,
      source: newTransaction.source
    });

    // 폼 초기화
    setNewTransaction({
      item: '',
      amount: '',
      category: '',
      memo: '',
      type: 'expense',
      source: ''
    });
    setShowAddTransaction(false);
  };

  // 챗봇 초기화
  const resetFinanceChat = () => {
    setFinanceChatMessages([]);
    setFinanceChatInput('');
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadFinanceData();
  }, []);

  // 분석 업데이트
  useEffect(() => {
    updateFinanceAnalysis();
  }, [financeTransactions]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-purple-800 to-purple-900">
      <Card className="w-full max-w-6xl text-center border-2 border-purple-700 shadow-2xl bg-gradient-to-br from-purple-900/90 to-purple-800/95 relative z-20">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-4xl font-extrabold text-white drop-shadow-lg mb-2">AI 가계부</CardTitle>
              <CardDescription className="text-purple-100 text-xl">스마트한 가계부 관리와 AI 어시스턴트</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddTransaction(!showAddTransaction)}
                className="border-purple-300 text-purple-100 hover:bg-purple-800"
              >
                {showAddTransaction ? '거래 추가 닫기' : '거래 추가'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="border-purple-300 text-purple-100 hover:bg-purple-800"
              >
                {showAnalysis ? '분석 닫기' : '분석 보기'}
              </Button>
              <Button
                variant="outline"
                onClick={onBackToMenu}
                className="border-purple-300 text-purple-100 hover:bg-purple-800"
              >
                돌아가기
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 거래 추가 폼 */}
          {showAddTransaction && (
            <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-600">
              <h3 className="text-xl font-bold text-white mb-4">💰 거래 추가</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-purple-100 text-sm font-medium mb-2">거래 유형</label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
                    className="w-full rounded-lg px-3 py-2 bg-white/10 text-white border border-purple-400 focus:border-purple-300 focus:outline-none"
                  >
                    <option value="expense">지출</option>
                    <option value="income">수입</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-purple-100 text-sm font-medium mb-2">항목</label>
                  <input
                    type="text"
                    value={newTransaction.item}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, item: e.target.value }))}
                    placeholder="거래 항목을 입력하세요"
                    className="w-full rounded-lg px-3 py-2 bg-white/10 text-white placeholder-purple-200 border border-purple-400 focus:border-purple-300 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-purple-100 text-sm font-medium mb-2">금액</label>
                  <input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="금액을 입력하세요"
                    className="w-full rounded-lg px-3 py-2 bg-white/10 text-white placeholder-purple-200 border border-purple-400 focus:border-purple-300 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-purple-100 text-sm font-medium mb-2">카테고리</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-lg px-3 py-2 bg-white/10 text-white border border-purple-400 focus:border-purple-300 focus:outline-none"
                  >
                    <option value="">카테고리 선택</option>
                    {newTransaction.type === 'expense' 
                      ? expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                      : incomeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)
                    }
                  </select>
                </div>
                
                <div>
                  <label className="block text-purple-100 text-sm font-medium mb-2">메모</label>
                  <input
                    type="text"
                    value={newTransaction.memo}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, memo: e.target.value }))}
                    placeholder="메모 (선택사항)"
                    className="w-full rounded-lg px-3 py-2 bg-white/10 text-white placeholder-purple-200 border border-purple-400 focus:border-purple-300 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-purple-100 text-sm font-medium mb-2">결제 수단</label>
                  <input
                    type="text"
                    value={newTransaction.source}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, source: e.target.value }))}
                    placeholder="현금, 카드 등"
                    className="w-full rounded-lg px-3 py-2 bg-white/10 text-white placeholder-purple-200 border border-purple-400 focus:border-purple-300 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 justify-center mt-4">
                <Button
                  onClick={handleAddTransaction}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  거래 추가
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddTransaction(false)}
                  className="border-purple-300 text-purple-100 hover:bg-purple-800"
                >
                  취소
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽: 가계부 요약 */}
            <div className="space-y-4">
              <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-600">
                <h3 className="text-xl font-bold text-white mb-4">📊 가계부 요약</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-200">총 수입</span>
                    <span className="text-green-400 font-bold">
                      {financeAnalysis.totalIncome.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-200">총 지출</span>
                    <span className="text-red-400 font-bold">
                      {financeAnalysis.totalExpense.toLocaleString()}원
                    </span>
                  </div>
                  <div className="border-t border-purple-600 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200 font-bold">잔액</span>
                      <span className={cn(
                        "font-bold",
                        financeAnalysis.balance >= 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {financeAnalysis.balance.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI 챗봇 */}
              <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-600 h-96 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-white">💬 AI 가계부 어시스턴트</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFinanceChat}
                    className="border-purple-300 text-purple-100 hover:bg-purple-800"
                  >
                    초기화
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                  {financeChatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2",
                        msg.type === 'user' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-purple-700/50 text-purple-100'
                      )}>
                        <div className="text-sm">{msg.message}</div>
                        <div className="text-xs mt-1 opacity-70">
                          {msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isFinanceChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-purple-700/50 text-purple-100 px-3 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  {financeChatMessages.length === 0 && (
                    <div className="text-purple-200 text-center py-4">
                      AI 가계부 어시스턴트에게 물어보세요!<br/>
                      "이번 달 총 지출 얼마야?"<br/>
                      "절약 팁 알려줘"
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={financeChatInput}
                    onChange={(e) => setFinanceChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && financeChatInput.trim() && !isFinanceChatLoading) {
                        sendFinanceChatMessage(financeChatInput.trim());
                      }
                    }}
                    placeholder="가계부에 대해 물어보세요..."
                    className="flex-1 rounded px-3 py-2 bg-purple-900/50 text-purple-100 border border-purple-700 focus:border-purple-400 focus:outline-none"
                    lang="ko"
                    inputMode="text"
                    autoComplete="off"
                    spellCheck="false"
                    disabled={isFinanceChatLoading}
                  />
                  <Button
                    onClick={() => sendFinanceChatMessage(financeChatInput.trim())}
                    disabled={!financeChatInput.trim() || isFinanceChatLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4"
                  >
                    전송
                  </Button>
                </div>
              </div>
            </div>

            {/* 오른쪽: 거래 내역 */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-600">
                <h3 className="text-xl font-bold text-white mb-4">📋 거래 내역</h3>
                {financeTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">💰</div>
                    <p className="text-purple-200">아직 거래 내역이 없습니다.</p>
                    <Button
                      onClick={() => setShowAddTransaction(true)}
                      className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      첫 거래 추가하기
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {financeTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-purple-700/30 rounded-lg border border-purple-600"
                      >
                        <div className="flex items-center gap-3">
                                                     <div className={cn(
                             "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold",
                             transaction.type === 'income' ? 'bg-green-600' : 'bg-red-600'
                           )}>
                             {transaction.type === 'income' ? '↑' : '↓'}
                           </div>
                          <div>
                            <div className="text-white font-medium">{transaction.item}</div>
                            <div className="text-purple-200 text-sm">
                              {transaction.category} • {transaction.timestamp.toLocaleDateString('ko-KR')}
                            </div>
                            {transaction.memo && (
                              <div className="text-purple-300 text-xs">{transaction.memo}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-bold",
                            transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                          )}>
                            {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()}원
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteFinanceTransaction(transaction.id)}
                            className="border-red-300 text-red-100 hover:bg-red-800"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 분석 결과 */}
              {showAnalysis && (
                <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-600">
                  <h3 className="text-xl font-bold text-white mb-4">📈 분석 결과</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-purple-200 font-medium mb-2">카테고리별 지출</h4>
                      <div className="space-y-2">
                        {Object.entries(financeAnalysis.categoryBreakdown)
                          .sort(([,a], [,b]) => b - a)
                          .map(([category, amount]) => (
                            <div key={category} className="flex justify-between items-center">
                              <span className="text-purple-200">{category}</span>
                              <span className="text-red-400 font-medium">
                                {amount.toLocaleString()}원
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-purple-200 font-medium mb-2">월별 통계</h4>
                      <div className="space-y-2">
                        {Object.entries(financeAnalysis.monthlyStats)
                          .sort(([a], [b]) => b.localeCompare(a))
                          .slice(0, 3)
                          .map(([month, stats]) => (
                            <div key={month} className="border border-purple-600 rounded p-2">
                              <div className="text-purple-200 text-sm">{month}</div>
                              <div className="flex justify-between text-xs">
                                <span className="text-green-400">+{stats.income.toLocaleString()}원</span>
                                <span className="text-red-400">-{stats.expense.toLocaleString()}원</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIFinanceSection; 