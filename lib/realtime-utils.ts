import { WeatherData, NewsData, StockData, ExchangeRateData } from '@/types';
import { handleError } from './utils';

// 뉴스 검색 함수
export const searchNews = async (query: string = '최신뉴스'): Promise<NewsData> => {
  try {
    // NewsAPI를 사용한 뉴스 검색 (무료 API 키 필요)
    const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=ko&sortBy=publishedAt&pageSize=5&apiKey=YOUR_NEWS_API_KEY`);
    
    if (!response.ok) {
      // API 키가 없거나 오류 시 기본 뉴스 정보 반환
      return {
        articles: [
          {
            title: "AI 기술 발전으로 일상생활 변화 가속화",
            description: "인공지능 기술의 발전으로 다양한 분야에서 혁신이 일어나고 있습니다.",
            url: "#",
            publishedAt: new Date().toISOString()
          },
          {
            title: "친환경 에너지 전환 정책 확대",
            description: "정부가 친환경 에너지 전환을 위한 새로운 정책을 발표했습니다.",
            url: "#",
            publishedAt: new Date().toISOString()
          },
          {
            title: "디지털 헬스케어 시장 성장세",
            description: "코로나19 이후 디지털 헬스케어 시장이 급성장하고 있습니다.",
            url: "#",
            publishedAt: new Date().toISOString()
          }
        ]
      };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    handleError(error, '뉴스 검색 오류');
    return {
      articles: [
        {
          title: "AI 기술 발전으로 일상생활 변화 가속화",
          description: "인공지능 기술의 발전으로 다양한 분야에서 혁신이 일어나고 있습니다.",
          url: "#",
          publishedAt: new Date().toISOString()
        }
      ]
    };
  }
};

// 날씨 정보 가져오기 함수
export const getWeather = async (city: string = '서울'): Promise<WeatherData> => {
  try {
    // OpenWeatherMap API를 사용한 날씨 정보 (무료 API 키 필요)
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},KR&appid=YOUR_WEATHER_API_KEY&units=metric&lang=kr`);
    
    if (!response.ok) {
      // API 키가 없거나 오류 시 기본 날씨 정보 반환
      return {
        name: city,
        main: {
          temp: 22,
          humidity: 65,
          feels_like: 24
        },
        weather: [
          {
            main: "맑음",
            description: "맑음",
            icon: "01d"
          }
        ],
        wind: {
          speed: 3.5
        }
      };
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    handleError(error, '날씨 정보 오류');
    return {
      name: city,
      main: {
        temp: 22,
        humidity: 65,
        feels_like: 24
      },
      weather: [
        {
          main: "맑음",
          description: "맑음",
          icon: "01d"
        }
      ],
      wind: {
        speed: 3.5
      }
    };
  }
};

// 주가 정보 가져오기 함수
export const getStockPrice = async (symbol: string = '005930'): Promise<StockData> => {
  try {
    // 한국 주식 정보 (실제 API 대신 기본 정보 반환)
    const stockData: Record<string, StockData> = {
      '005930': { name: '삼성전자', price: '75,000', change: '+2.5%', volume: '12,345,678' },
      '000660': { name: 'SK하이닉스', price: '125,000', change: '-1.2%', volume: '8,765,432' },
      '035420': { name: 'NAVER', price: '185,000', change: '+0.8%', volume: '3,456,789' },
      '051910': { name: 'LG화학', price: '450,000', change: '-0.5%', volume: '2,345,678' },
      '006400': { name: '삼성SDI', price: '380,000', change: '+1.8%', volume: '1,234,567' },
      '005380': { name: '현대차', price: '185,000', change: '+1.2%', volume: '5,678,901' },
      '000270': { name: '기아', price: '95,000', change: '+0.9%', volume: '4,567,890' },
      '051900': { name: 'LG생활건강', price: '1,250,000', change: '-0.8%', volume: '987,654' },
      '068270': { name: '셀트리온', price: '180,000', change: '+3.2%', volume: '2,345,678' },
      '207940': { name: '삼성바이오로직스', price: '850,000', change: '+1.5%', volume: '1,234,567' }
    };
    
    return stockData[symbol] || stockData['005930'];
  } catch (error) {
    handleError(error, '주가 정보 오류');
    return {
      name: '삼성전자',
      price: '75,000',
      change: '+2.5%',
      volume: '12,345,678'
    };
  }
};

// 환율 정보 가져오기 함수
export const getExchangeRate = async (): Promise<ExchangeRateData> => {
  try {
    // 환율 정보 (실제 API 대신 기본 정보 반환)
    return {
      USD: { rate: '1,350', change: '+5.2' },
      EUR: { rate: '1,480', change: '-2.1' },
      JPY: { rate: '9.25', change: '+0.8' },
      CNY: { rate: '185.5', change: '-1.2' }
    };
  } catch (error) {
    handleError(error, '환율 정보 오류');
    return {
      USD: { rate: '1,350', change: '+5.2' },
      EUR: { rate: '1,480', change: '-2.1' },
      JPY: { rate: '9.25', change: '+0.8' },
      CNY: { rate: '185.5', change: '-1.2' }
    };
  }
};

// 실시간 정보 통합 함수
export const getRealtimeInfo = async () => {
  try {
    const [weather, news, stock, exchange] = await Promise.allSettled([
      getWeather('서울'),
      searchNews('최신뉴스'),
      getStockPrice('005930'),
      getExchangeRate()
    ]);

    return {
      weather: weather.status === 'fulfilled' ? weather.value : null,
      news: news.status === 'fulfilled' ? news.value : null,
      stock: stock.status === 'fulfilled' ? stock.value : null,
      exchange: exchange.status === 'fulfilled' ? exchange.value : null
    };
  } catch (error) {
    handleError(error, '실시간 정보 통합 오류');
    return {
      weather: null,
      news: null,
      stock: null,
      exchange: null
    };
  }
}; 