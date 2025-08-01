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
  Edit3,
  Heart,
  Sparkles,
  Share2
} from '@/components/ui/common';
import { cn, generateUniqueId, handleError, showSuccess } from '@/lib/utils';

interface AlbumEntry {
  id: string;
  originalImage: string;
  transformedImage: string;
  title: string;
  description: string;
  aiDescription: string;
  style: string;
  isPublic: boolean;
  timestamp: Date;
}

interface AIAlbumSectionProps {
  onBackToMenu?: () => void;
}

const AIAlbumSection: React.FC<AIAlbumSectionProps> = ({ onBackToMenu }) => {
  const { user } = useAuth();

  // 상태 관리
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [transformedImage, setTransformedImage] = useState<string>('');
  const [isTransforming, setIsTransforming] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('원본');
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [savedAlbums, setSavedAlbums] = useState<AlbumEntry[]>([]);
  const [showAlbumBoard, setShowAlbumBoard] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const styleOptions = [
    { value: '원본', label: '원본', emoji: '🖼️' },
    { value: '동화', label: '동화 스타일', emoji: '🧚‍♀️' },
    { value: '만화', label: '만화 스타일', emoji: '🎨' },
    { value: '사진', label: '사진 스타일', emoji: '📸' },
    { value: '수채화', label: '수채화 스타일', emoji: '🎨' },
    { value: '유화', label: '유화 스타일', emoji: '🖼️' },
    { value: '스케치', label: '스케치 스타일', emoji: '✏️' },
    { value: '팝아트', label: '팝아트 스타일', emoji: '💥' }
  ];

  // 이미지 선택 처리
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
          setTransformedImage('');
          setAiDescription('');
        };
        reader.readAsDataURL(file);
      } else {
        showSuccess('이미지 파일만 선택할 수 있습니다.');
      }
    }
  };

  // 이미지 스타일 변환
  const transformImageStyle = async (imageFile: File, style: string): Promise<string | null> => {
    setIsTransforming(true);
    
    try {
      // 실제로는 OpenAI DALL-E API를 사용하여 이미지 변환
      // 여기서는 더미 이미지로 대체
      const dummyTransformedImages = {
        '동화': 'https://via.placeholder.com/400x300/FFB6C1/000000?text=동화+스타일',
        '만화': 'https://via.placeholder.com/400x300/87CEEB/000000?text=만화+스타일',
        '사진': 'https://via.placeholder.com/400x300/98FB98/000000?text=사진+스타일',
        '수채화': 'https://via.placeholder.com/400x300/DDA0DD/000000?text=수채화+스타일',
        '유화': 'https://via.placeholder.com/400x300/F0E68C/000000?text=유화+스타일',
        '스케치': 'https://via.placeholder.com/400x300/FFA07A/000000?text=스케치+스타일',
        '팝아트': 'https://via.placeholder.com/400x300/FF69B4/000000?text=팝아트+스타일'
      };
      
      // 약간의 지연을 두어 변환 중임을 표시
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      return dummyTransformedImages[style as keyof typeof dummyTransformedImages] || imagePreview;
    } catch (error) {
      handleError(error, '이미지 스타일 변환');
      return null;
    } finally {
      setIsTransforming(false);
    }
  };

  // AI 설명 생성
  const generateImageDescription = async (imageFile: File): Promise<string> => {
    setIsGeneratingDescription(true);
    
    try {
      // 실제로는 OpenAI GPT API를 사용하여 이미지 설명 생성
      // 여기서는 더미 설명으로 대체
      const dummyDescriptions = [
        "이 이미지는 아름다운 자연 풍경을 담고 있습니다. 푸른 하늘과 녹색 나무들이 조화롭게 어우러져 평화로운 분위기를 연출하고 있어요. 🌳",
        "화려한 색감과 독특한 구도가 돋보이는 작품입니다. 예술적 감각이 잘 드러나는 멋진 사진이네요! ✨",
        "따뜻한 햇살과 부드러운 그림자가 어우러진 감성적인 이미지입니다. 마음을 편안하게 해주는 아름다운 순간을 담았어요. ☀️",
        "강렬한 대비와 생동감 있는 색상이 인상적인 작품입니다. 에너지 넘치는 활기찬 분위기가 느껴져요! 💫"
      ];
      
      // 약간의 지연을 두어 생성 중임을 표시
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
      
      return dummyDescriptions[Math.floor(Math.random() * dummyDescriptions.length)];
    } catch (error) {
      handleError(error, 'AI 설명 생성');
      return '이미지 설명을 생성하는 중 오류가 발생했습니다.';
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // 스타일 변환 버튼 클릭
  const handleTransformClick = async () => {
    if (!selectedImage || selectedStyle === '원본') {
      showSuccess('이미지를 선택하고 변환할 스타일을 선택해주세요.');
      return;
    }

    const transformed = await transformImageStyle(selectedImage, selectedStyle);
    if (transformed) {
      setTransformedImage(transformed);
      showSuccess('이미지 스타일 변환이 완료되었습니다!');
    } else {
      showSuccess('이미지 변환에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // AI 설명 생성 버튼 클릭
  const handleGenerateDescription = async () => {
    if (!selectedImage) {
      showSuccess('이미지를 먼저 선택해주세요.');
      return;
    }

    const description = await generateImageDescription(selectedImage);
    setAiDescription(description);
  };

  // 앨범 저장
  const saveAlbumToBoard = async () => {
    if (!selectedImage || !albumTitle.trim()) {
      showSuccess('이미지와 제목을 입력해주세요.');
      return;
    }

    const newAlbum: AlbumEntry = {
      id: generateUniqueId(),
      originalImage: imagePreview,
      transformedImage: transformedImage || imagePreview,
      title: albumTitle,
      description: albumDescription,
      aiDescription,
      style: selectedStyle,
      isPublic,
      timestamp: new Date()
    };

    setSavedAlbums(prev => [newAlbum, ...prev]);
    
    // localStorage에 저장
    const savedAlbumsData = JSON.parse(localStorage.getItem('aiAlbums') || '[]');
    savedAlbumsData.unshift(newAlbum);
    localStorage.setItem('aiAlbums', JSON.stringify(savedAlbumsData));
    
    showSuccess('앨범이 저장되었습니다!');
    
    // 폼 초기화
    setSelectedImage(null);
    setImagePreview('');
    setTransformedImage('');
    setAlbumTitle('');
    setAlbumDescription('');
    setAiDescription('');
    setSelectedStyle('원본');
    setIsPublic(false);
  };

  // 앨범 삭제
  const deleteAlbum = (id: string) => {
    setSavedAlbums(prev => prev.filter(album => album.id !== id));
    
    // localStorage에서도 삭제
    const savedAlbumsData = JSON.parse(localStorage.getItem('aiAlbums') || '[]');
    const filteredAlbums = savedAlbumsData.filter((album: any) => album.id !== id);
    localStorage.setItem('aiAlbums', JSON.stringify(filteredAlbums));
    
    showSuccess('앨범이 삭제되었습니다.');
  };

  // 이미지 미리보기 URL 생성
  const getImagePreviewUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  // 컴포넌트 마운트 시 저장된 앨범 로드
  useEffect(() => {
    const saved = localStorage.getItem('aiAlbums');
    if (saved) {
      const albums = JSON.parse(saved);
      setSavedAlbums(albums.map((album: any) => ({
        ...album,
        timestamp: new Date(album.timestamp)
      })));
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-pink-800 to-pink-900">
      <Card className="w-full max-w-6xl text-center border-2 border-pink-700 shadow-2xl bg-gradient-to-br from-pink-900/90 to-pink-800/95 relative z-20">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-4xl font-extrabold text-white drop-shadow-lg mb-2">AI 앨범</CardTitle>
              <CardDescription className="text-pink-100 text-xl">AI로 이미지를 변환하고 아름다운 앨범을 만들어보세요</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAlbumBoard(!showAlbumBoard)}
                className="border-pink-300 text-pink-100 hover:bg-pink-800"
              >
                {showAlbumBoard ? '앨범 보드 닫기' : '앨범 보드'}
              </Button>
              <Button
                variant="outline"
                onClick={onBackToMenu}
                className="border-pink-300 text-pink-100 hover:bg-pink-800"
              >
                돌아가기
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!showAlbumBoard ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 왼쪽: 이미지 업로드 및 변환 */}
              <div className="space-y-4">
                <div className="bg-pink-800/30 rounded-lg p-4 border border-pink-600">
                  <h3 className="text-xl font-bold text-white mb-4">📸 이미지 업로드</h3>
                  
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-pink-400 rounded-lg p-6 text-center">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img
                            src={imagePreview}
                            alt="업로드된 이미지"
                            className="w-full max-h-64 object-contain rounded-lg mx-auto"
                          />
                          <Button
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreview('');
                              setTransformedImage('');
                              setAiDescription('');
                            }}
                            variant="outline"
                            className="border-pink-300 text-pink-100 hover:bg-pink-800"
                          >
                            이미지 변경
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-4xl">📷</div>
                          <p className="text-pink-200">이미지를 업로드하거나 클릭하여 선택하세요</p>
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-pink-600 hover:bg-pink-700 text-white"
                          >
                            이미지 선택
                          </Button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>

                    {selectedImage && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-pink-100 text-sm font-medium mb-2">스타일 선택</label>
                          <div className="grid grid-cols-2 gap-2">
                            {styleOptions.map((style) => (
                              <Button
                                key={style.value}
                                variant={selectedStyle === style.value ? 'default' : 'outline'}
                                onClick={() => setSelectedStyle(style.value)}
                                className={cn(
                                  "justify-start",
                                  selectedStyle === style.value 
                                    ? 'bg-pink-600 text-white' 
                                    : 'border-pink-300 text-pink-100 hover:bg-pink-800'
                                )}
                              >
                                <span className="mr-2">{style.emoji}</span>
                                {style.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={handleTransformClick}
                          disabled={isTransforming || selectedStyle === '원본'}
                          className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                        >
                          {isTransforming ? (
                            <>
                              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                              변환 중...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              스타일 변환
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={handleGenerateDescription}
                          disabled={isGeneratingDescription}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {isGeneratingDescription ? (
                            <>
                              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                              설명 생성 중...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              AI 설명 생성
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 오른쪽: 변환 결과 및 앨범 저장 */}
              <div className="space-y-4">
                {/* 변환된 이미지 */}
                {transformedImage && (
                  <div className="bg-pink-800/30 rounded-lg p-4 border border-pink-600">
                    <h3 className="text-lg font-bold text-white mb-3">🎨 변환된 이미지</h3>
                    <img
                      src={transformedImage}
                      alt="변환된 이미지"
                      className="w-full rounded-lg"
                    />
                  </div>
                )}

                {/* AI 설명 */}
                {aiDescription && (
                  <div className="bg-pink-800/30 rounded-lg p-4 border border-pink-600">
                    <h3 className="text-lg font-bold text-white mb-3">🤖 AI 설명</h3>
                    <p className="text-pink-200 text-sm leading-relaxed">
                      {aiDescription}
                    </p>
                  </div>
                )}

                {/* 앨범 저장 폼 */}
                {selectedImage && (
                  <div className="bg-pink-800/30 rounded-lg p-4 border border-pink-600">
                    <h3 className="text-lg font-bold text-white mb-3">💾 앨범 저장</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-pink-100 text-sm font-medium mb-2">제목</label>
                        <input
                          type="text"
                          value={albumTitle}
                          onChange={(e) => setAlbumTitle(e.target.value)}
                          placeholder="앨범 제목을 입력하세요"
                          className="w-full rounded-lg px-3 py-2 bg-white/10 text-white placeholder-pink-200 border border-pink-400 focus:border-pink-300 focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-pink-100 text-sm font-medium mb-2">설명</label>
                        <textarea
                          value={albumDescription}
                          onChange={(e) => setAlbumDescription(e.target.value)}
                          placeholder="앨범에 대한 설명을 입력하세요 (선택사항)"
                          className="w-full rounded-lg px-3 py-2 bg-white/10 text-white placeholder-pink-200 border border-pink-400 focus:border-pink-300 focus:outline-none resize-none"
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isPublic"
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                          className="rounded border-pink-400"
                        />
                        <label htmlFor="isPublic" className="text-pink-100 text-sm">
                          공개 앨범으로 설정
                        </label>
                      </div>
                      
                      <Button
                        onClick={saveAlbumToBoard}
                        disabled={!albumTitle.trim()}
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        앨범 저장
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* 앨범 보드 */
            <div className="bg-pink-800/30 rounded-lg p-4 border border-pink-600">
              <h3 className="text-xl font-bold text-white mb-4">📚 앨범 보드</h3>
              
              {savedAlbums.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📖</div>
                  <p className="text-pink-200">아직 저장된 앨범이 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedAlbums.map((album) => (
                    <Card key={album.id} className="bg-pink-700/50 border-pink-600">
                      <CardContent className="p-4">
                        <div className="relative mb-3">
                          <img
                            src={album.transformedImage}
                            alt={album.title}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute top-2 right-2 bg-black/50 rounded-full px-2 py-1">
                            <span className="text-white text-xs">{album.style}</span>
                          </div>
                          {album.isPublic && (
                            <div className="absolute top-2 left-2 bg-green-500 rounded-full px-2 py-1">
                              <span className="text-white text-xs">공개</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="text-white font-bold text-sm">{album.title}</h4>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-pink-300 text-pink-100 hover:bg-pink-800"
                              >
                                <Share2 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteAlbum(album.id)}
                                className="border-red-300 text-red-100 hover:bg-red-800"
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                          
                          {album.description && (
                            <p className="text-pink-200 text-xs line-clamp-2">
                              {album.description}
                            </p>
                          )}
                          
                          {album.aiDescription && (
                            <p className="text-pink-300 text-xs line-clamp-3">
                              {album.aiDescription}
                            </p>
                          )}
                          
                          <div className="text-pink-200 text-xs">
                            {album.timestamp.toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAlbumSection; 