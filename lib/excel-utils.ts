import * as XLSX from 'xlsx';

export interface FinanceTransaction {
  id?: string;
  item: string;
  amount: number;
  category: string;
  memo: string;
  type: 'income' | 'expense';
  source?: string;
  created_at?: string;
  date?: Date; // 기존 코드와의 호환성을 위해 추가
}

// 카테고리를 유동비/고정비/투자저축으로 분류하는 함수
const categorizeExpenseType = (category: string): 'variable' | 'fixed' | 'investment' => {
  const fixedExpenses = ['주거', '통신', '보험', '세금', '관리비', '공과금'];
  const investmentCategories = ['투자', '저축', '펀드', '주식', '부동산', '적금', '예금'];
  
  if (fixedExpenses.some(fixed => category.includes(fixed))) {
    return 'fixed';
  }
  if (investmentCategories.some(inv => category.includes(inv))) {
    return 'investment';
  }
  return 'variable';
};

export const downloadFinanceDataAsExcel = (transactions: FinanceTransaction[], fileName: string = '가계부') => {
  try {
    // 거래 데이터를 유형별로 분류
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    const variableExpenses = expenseTransactions.filter(t => categorizeExpenseType(t.category) === 'variable');
    const fixedExpenses = expenseTransactions.filter(t => categorizeExpenseType(t.category) === 'fixed');
    const investmentTransactions = expenseTransactions.filter(t => categorizeExpenseType(t.category) === 'investment');

    // 통계 계산
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalVariableExpense = variableExpenses.reduce((sum, t) => sum + t.amount, 0);
    const totalFixedExpense = fixedExpenses.reduce((sum, t) => sum + t.amount, 0);
    const totalInvestment = investmentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const remainingBalance = totalIncome - totalExpense;

    // 워크북 생성
    const workbook = XLSX.utils.book_new();

    // 1. 메인 가계부 시트 (이미지 형식)
    const mainSheetData = [];
    
    // 헤더 영역
    mainSheetData.push(['2024', '', '', '', '', '']);
    mainSheetData.push(['1', '', '', '', '', '']);
    mainSheetData.push(['', '', '', '', '', '']);
    
    // 유동비 지출 내역 그래프 영역
    mainSheetData.push(['유동비 지출 내역 그래프', '', '', '', '', '']);
    mainSheetData.push(['카테고리', '식비', '의류', '주거', '교통비', '차량유지비', '통신']);
    mainSheetData.push(['금액', 
      variableExpenses.filter(t => t.category.includes('식비')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('의류')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('주거')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('교통')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('차량')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('통신')).reduce((sum, t) => sum + t.amount, 0).toLocaleString()
    ]);
    mainSheetData.push(['카테고리', '의료', '미용', '자기계발', '문화여가', '친목', '선물/용돈']);
    mainSheetData.push(['금액',
      variableExpenses.filter(t => t.category.includes('의료')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('미용')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('자기계발')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('문화')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('친목')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('선물')).reduce((sum, t) => sum + t.amount, 0).toLocaleString()
    ]);
    mainSheetData.push(['', '', '', '', '', '']);
    
    // 유동비 지출 테이블
    mainSheetData.push(['유동비', 'EXPENSE', '', '', '', '']);
    mainSheetData.push(['일자', '범주', '상세', '결제수단', '금액', '']);
    mainSheetData.push(['일자', '범주', '상세', '결제수단', '금액', '']);
    
    // 유동비 데이터 (최대 20개 행)
    const maxRows = 20;
    for (let i = 0; i < maxRows; i++) {
      if (i < variableExpenses.length) {
        const expense = variableExpenses[i];
        mainSheetData.push([
          expense.created_at ? new Date(expense.created_at).toLocaleDateString('ko-KR') : '',
          expense.category,
          expense.item,
          expense.source || '현금',
          expense.amount.toLocaleString(),
          ''
        ]);
      } else {
        mainSheetData.push(['', '', '', '', '', '']);
      }
    }

    // 메인 시트 생성
    const mainSheet = XLSX.utils.aoa_to_sheet(mainSheetData);
    XLSX.utils.book_append_sheet(workbook, mainSheet, '가계부');

    // 2. 수입 시트
    const incomeSheetData = [];
    incomeSheetData.push(['INCOME', '', '', '', '']);
    incomeSheetData.push(['일자', '범주', '상세', '금액', '']);
    
    incomeTransactions.forEach(income => {
      incomeSheetData.push([
        income.created_at ? new Date(income.created_at).toLocaleDateString('ko-KR') : '',
        income.category,
        income.item,
        income.amount.toLocaleString(),
        ''
      ]);
    });
    
    // 합계 행 추가
    incomeSheetData.push(['합계', '', '', totalIncome.toLocaleString(), '']);
    
    const incomeSheet = XLSX.utils.aoa_to_sheet(incomeSheetData);
    XLSX.utils.book_append_sheet(workbook, incomeSheet, '수입');

    // 3. 고정비 시트
    const fixedExpenseSheetData = [];
    fixedExpenseSheetData.push(['고정비', '', '', '', '']);
    fixedExpenseSheetData.push(['일자', '범주', '상세', '금액', '']);
    
    fixedExpenses.forEach(expense => {
      fixedExpenseSheetData.push([
        expense.created_at ? new Date(expense.created_at).toLocaleDateString('ko-KR') : '',
        expense.category,
        expense.item,
        expense.amount.toLocaleString(),
        ''
      ]);
    });
    
    // 합계 행 추가
    fixedExpenseSheetData.push(['합계', '', '', totalFixedExpense.toLocaleString(), '']);
    
    const fixedExpenseSheet = XLSX.utils.aoa_to_sheet(fixedExpenseSheetData);
    XLSX.utils.book_append_sheet(workbook, fixedExpenseSheet, '고정비');

    // 4. 투자 및 저축 시트
    const investmentSheetData = [];
    investmentSheetData.push(['투자 및 저축', '', '', '', '']);
    investmentSheetData.push(['일자', '범주', '상세', '금액', '']);
    
    investmentTransactions.forEach(investment => {
      investmentSheetData.push([
        investment.created_at ? new Date(investment.created_at).toLocaleDateString('ko-KR') : '',
        investment.category,
        investment.item,
        investment.amount.toLocaleString(),
        ''
      ]);
    });
    
    // 합계 행 추가
    investmentSheetData.push(['합계', '', '', totalInvestment.toLocaleString(), '']);
    
    const investmentSheet = XLSX.utils.aoa_to_sheet(investmentSheetData);
    XLSX.utils.book_append_sheet(workbook, investmentSheet, '투자저축');

    // 5. 통계 시트
    const statsSheetData = [];
    statsSheetData.push(['TOTAL', '', '', '', '']);
    statsSheetData.push(['구분', '금액', '', '', '']);
    statsSheetData.push(['총 지출', totalExpense.toLocaleString(), '', '', '']);
    statsSheetData.push(['여유 잔금', remainingBalance.toLocaleString(), '', '', '']);
    statsSheetData.push(['', '', '', '', '']);
    statsSheetData.push(['상세 내역', '', '', '', '']);
    statsSheetData.push(['총 수입', totalIncome.toLocaleString(), '', '', '']);
    statsSheetData.push(['유동비 지출', totalVariableExpense.toLocaleString(), '', '', '']);
    statsSheetData.push(['고정비 지출', totalFixedExpense.toLocaleString(), '', '', '']);
    statsSheetData.push(['투자/저축', totalInvestment.toLocaleString(), '', '', '']);

    const statsSheet = XLSX.utils.aoa_to_sheet(statsSheetData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, '통계');

    // 파일 다운로드
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('엑셀 다운로드 오류:', error);
    return false;
  }
};

export const downloadMonthlyReportAsExcel = (
  transactions: FinanceTransaction[], 
  year: number, 
  month: number,
  fileName: string = '월간보고서'
) => {
  try {
    // 해당 월의 거래만 필터링
    const monthlyTransactions = transactions.filter(transaction => {
      if (!transaction.created_at) return false;
      const date = new Date(transaction.created_at);
      return date.getFullYear() === year && date.getMonth() === month - 1;
    });

    // 거래 데이터를 유형별로 분류
    const incomeTransactions = monthlyTransactions.filter(t => t.type === 'income');
    const expenseTransactions = monthlyTransactions.filter(t => t.type === 'expense');
    
    const variableExpenses = expenseTransactions.filter(t => categorizeExpenseType(t.category) === 'variable');
    const fixedExpenses = expenseTransactions.filter(t => categorizeExpenseType(t.category) === 'fixed');
    const investmentTransactions = expenseTransactions.filter(t => categorizeExpenseType(t.category) === 'investment');

    // 통계 계산
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalVariableExpense = variableExpenses.reduce((sum, t) => sum + t.amount, 0);
    const totalFixedExpense = fixedExpenses.reduce((sum, t) => sum + t.amount, 0);
    const totalInvestment = investmentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const remainingBalance = totalIncome - totalExpense;

    // 워크북 생성
    const workbook = XLSX.utils.book_new();

    // 1. 메인 월간 가계부 시트
    const mainSheetData = [];
    
    // 헤더 영역
    mainSheetData.push([`${year}`, '', '', '', '', '']);
    mainSheetData.push([`${month}`, '', '', '', '', '']);
    mainSheetData.push(['', '', '', '', '', '']);
    
    // 유동비 지출 내역 그래프 영역
    mainSheetData.push(['유동비 지출 내역 그래프', '', '', '', '', '']);
    mainSheetData.push(['카테고리', '식비', '의류', '주거', '교통비', '차량유지비', '통신']);
    mainSheetData.push(['금액', 
      variableExpenses.filter(t => t.category.includes('식비')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('의류')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('주거')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('교통')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('차량')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('통신')).reduce((sum, t) => sum + t.amount, 0).toLocaleString()
    ]);
    mainSheetData.push(['카테고리', '의료', '미용', '자기계발', '문화여가', '친목', '선물/용돈']);
    mainSheetData.push(['금액',
      variableExpenses.filter(t => t.category.includes('의료')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('미용')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('자기계발')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('문화')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('친목')).reduce((sum, t) => sum + t.amount, 0).toLocaleString(),
      variableExpenses.filter(t => t.category.includes('선물')).reduce((sum, t) => sum + t.amount, 0).toLocaleString()
    ]);
    mainSheetData.push(['', '', '', '', '', '']);
    
    // 유동비 지출 테이블
    mainSheetData.push(['유동비', 'EXPENSE', '', '', '', '']);
    mainSheetData.push(['일자', '범주', '상세', '결제수단', '금액', '']);
    mainSheetData.push(['일자', '범주', '상세', '결제수단', '금액', '']);
    
    // 유동비 데이터 (최대 20개 행)
    const maxRows = 20;
    for (let i = 0; i < maxRows; i++) {
      if (i < variableExpenses.length) {
        const expense = variableExpenses[i];
        mainSheetData.push([
          expense.created_at ? new Date(expense.created_at).toLocaleDateString('ko-KR') : '',
          expense.category,
          expense.item,
          expense.source || '현금',
          expense.amount.toLocaleString(),
          ''
        ]);
      } else {
        mainSheetData.push(['', '', '', '', '', '']);
      }
    }

    // 메인 시트 생성
    const mainSheet = XLSX.utils.aoa_to_sheet(mainSheetData);
    XLSX.utils.book_append_sheet(workbook, mainSheet, '월간가계부');

    // 2. 수입 시트
    const incomeSheetData = [];
    incomeSheetData.push(['INCOME', '', '', '', '']);
    incomeSheetData.push(['일자', '범주', '상세', '금액', '']);
    
    incomeTransactions.forEach(income => {
      incomeSheetData.push([
        income.created_at ? new Date(income.created_at).toLocaleDateString('ko-KR') : '',
        income.category,
        income.item,
        income.amount.toLocaleString(),
        ''
      ]);
    });
    
    // 합계 행 추가
    incomeSheetData.push(['합계', '', '', totalIncome.toLocaleString(), '']);
    
    const incomeSheet = XLSX.utils.aoa_to_sheet(incomeSheetData);
    XLSX.utils.book_append_sheet(workbook, incomeSheet, '수입');

    // 3. 고정비 시트
    const fixedExpenseSheetData = [];
    fixedExpenseSheetData.push(['고정비', '', '', '', '']);
    fixedExpenseSheetData.push(['일자', '범주', '상세', '금액', '']);
    
    fixedExpenses.forEach(expense => {
      fixedExpenseSheetData.push([
        expense.created_at ? new Date(expense.created_at).toLocaleDateString('ko-KR') : '',
        expense.category,
        expense.item,
        expense.amount.toLocaleString(),
        ''
      ]);
    });
    
    // 합계 행 추가
    fixedExpenseSheetData.push(['합계', '', '', totalFixedExpense.toLocaleString(), '']);
    
    const fixedExpenseSheet = XLSX.utils.aoa_to_sheet(fixedExpenseSheetData);
    XLSX.utils.book_append_sheet(workbook, fixedExpenseSheet, '고정비');

    // 4. 투자 및 저축 시트
    const investmentSheetData = [];
    investmentSheetData.push(['투자 및 저축', '', '', '', '']);
    investmentSheetData.push(['일자', '범주', '상세', '금액', '']);
    
    investmentTransactions.forEach(investment => {
      investmentSheetData.push([
        investment.created_at ? new Date(investment.created_at).toLocaleDateString('ko-KR') : '',
        investment.category,
        investment.item,
        investment.amount.toLocaleString(),
        ''
      ]);
    });
    
    // 합계 행 추가
    investmentSheetData.push(['합계', '', '', totalInvestment.toLocaleString(), '']);
    
    const investmentSheet = XLSX.utils.aoa_to_sheet(investmentSheetData);
    XLSX.utils.book_append_sheet(workbook, investmentSheet, '투자저축');

    // 5. 통계 시트
    const statsSheetData = [];
    statsSheetData.push(['TOTAL', '', '', '', '']);
    statsSheetData.push(['구분', '금액', '', '', '']);
    statsSheetData.push(['총 지출', totalExpense.toLocaleString(), '', '', '']);
    statsSheetData.push(['여유 잔금', remainingBalance.toLocaleString(), '', '', '']);
    statsSheetData.push(['', '', '', '', '']);
    statsSheetData.push(['상세 내역', '', '', '', '']);
    statsSheetData.push(['총 수입', totalIncome.toLocaleString(), '', '', '']);
    statsSheetData.push(['유동비 지출', totalVariableExpense.toLocaleString(), '', '', '']);
    statsSheetData.push(['고정비 지출', totalFixedExpense.toLocaleString(), '', '', '']);
    statsSheetData.push(['투자/저축', totalInvestment.toLocaleString(), '', '', '']);

    const statsSheet = XLSX.utils.aoa_to_sheet(statsSheetData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, '통계');

    // 파일 다운로드
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}_${year}년${month}월_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('월간 보고서 다운로드 오류:', error);
    return false;
  }
}; 