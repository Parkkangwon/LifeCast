import React, { useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { SectionCard } from "@/components/ui/section-card";
import { ImageGallery } from "@/components/ui/image-gallery";
import { QuestionAnswer } from "@/components/ui/question-answer";
import { supabase } from "@/lib/supabase";
import { getSectionIcon } from "@/lib/autobiography-utils";
import { getProxiedImageUrl } from "@/lib/image-utils";
import type { StorySection, Blog } from "@/types/blog";

interface AutobiographyFlipBookProps {
  sections: StorySection[];
}

// 3D 이미지 흔들림 효과
const tiltStyle = {
  transition: 'transform 0.3s cubic-bezier(.25,.8,.25,1)',
  willChange: 'transform',
};
const tiltHover = {
  transform: 'rotateY(6deg) scale(1.04)',
  boxShadow: '0 8px 32px 0 rgba(80,60,20,0.18)',
};

export default function AutobiographyFlipBook({ sections }: AutobiographyFlipBookProps) {
  // 각 섹션을 양면(이미지/텍스트)로 분리
  const doublePages = sections.map(section => ({ section }));

  // 음성 읽기
  const speakRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speakText = (text: string) => {
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = "ko-KR";
    utter.rate = 1.0;
    utter.pitch = 1.1;
    window.speechSynthesis.speak(utter);
    speakRef.current = utter;
  };
  const stopSpeak = () => {
    window.speechSynthesis.cancel();
    speakRef.current = null;
  };

  // 수정 상태: { [sectionIdx]: { [qIdx]: { value, isEditing, saveMsg } } }
  const [editValues, setEditValues] = useState<{
    [sectionIdx: number]: {
      [qIdx: number]: { value: string; isEditing: boolean; saveMsg: string }
    }
  }>({});

  const handleEditChange = (sectionIdx: number, qIdx: number, value: string) => {
    setEditValues(prev => ({
      ...prev,
      [sectionIdx]: {
        ...(prev[sectionIdx] || {}),
        [qIdx]: {
          ...(prev[sectionIdx]?.[qIdx] || {}),
          value,
        },
      },
    }));
  };
  const handleEditStart = (sectionIdx: number, qIdx: number, origValue: string) => {
    setEditValues(prev => ({
      ...prev,
      [sectionIdx]: {
        ...(prev[sectionIdx] || {}),
        [qIdx]: {
          value: origValue,
          isEditing: true,
          saveMsg: "",
        },
      },
    }));
  };
  const handleEditCancel = (sectionIdx: number, qIdx: number, origValue: string) => {
    setEditValues(prev => ({
      ...prev,
      [sectionIdx]: {
        ...(prev[sectionIdx] || {}),
        [qIdx]: {
          value: origValue,
          isEditing: false,
          saveMsg: "",
        },
      },
    }));
  };
  const handleEditSave = async (sectionIdx: number, qIdx: number, section: StorySection) => {
    setEditValues(prev => ({
      ...prev,
      [sectionIdx]: {
        ...(prev[sectionIdx] || {}),
        [qIdx]: {
          ...prev[sectionIdx]?.[qIdx],
          saveMsg: "저장 중...",
        },
      },
    }));
    // answers 배열 복사 후 수정
    const newAnswers = [...(section.answers || [])];
    const newValue = editValues[sectionIdx]?.[qIdx]?.value ?? newAnswers[qIdx] ?? "";
    newAnswers[qIdx] = newValue;
    // supabase 업데이트
    const { error } = await supabase
      .from("autobiographies")
      .update({ sections: [{ ...section, answers: newAnswers }] })
      .eq("id", section.id);
    setEditValues(prev => ({
      ...prev,
      [sectionIdx]: {
        ...(prev[sectionIdx] || {}),
        [qIdx]: {
          value: newValue,
          isEditing: false,
          saveMsg: error ? "저장 실패: " + error.message : "저장되었습니다!",
        },
      },
    }));
  };

  return (
    <div className="flex justify-center items-center w-full h-full font-serif" style={{fontFamily:'Nanum Myeongjo, serif'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@700&family=Nanum+Pen+Script&display=swap');
        .magic-cover {
          background: radial-gradient(ellipse at 60% 40%, #fffbe6 60%, #ffe5c2 80%, #e0b97a 100%), linear-gradient(135deg, #f7e7ce 0%, #e6d0b1 100%);
          box-shadow: 0 0 60px 10px #ffe5c2, 0 0 120px 40px #f7e7ce;
          border: 4px solid #e0b97a;
          position: relative;
          overflow: hidden;
        }
        .magic-cover::before {
          content: '';
          position: absolute;
          left: 10%; top: 10%; width: 80%; height: 80%;
          background: radial-gradient(circle, #fffbe6 0%, transparent 80%);
          opacity: 0.5;
          filter: blur(12px);
          pointer-events: none;
        }
        .magic-glow {
          position: absolute; left: 50%; top: 20%; width: 120px; height: 120px;
          background: radial-gradient(circle, #fffbe6 0%, #ffe5c2 60%, transparent 100%);
          opacity: 0.7; filter: blur(16px); transform: translate(-50%,0);
          animation: magic-glow 3s infinite alternate;
        }
        @keyframes magic-glow {
          0% { opacity: 0.5; }
          100% { opacity: 0.9; }
        }
        .star-twinkle {
          position: absolute; pointer-events: none;
          width: 18px; height: 18px; background: radial-gradient(circle, #fffbe6 60%, #ffd700 100%);
          border-radius: 50%; opacity: 0.7;
          animation: twinkle 2.5s infinite alternate;
        }
        @keyframes twinkle {
          0% { opacity: 0.3; filter: blur(2px); }
          100% { opacity: 1; filter: blur(0.5px); }
        }
        .luxury-page {
          background: linear-gradient(120deg, #fdf6e3 60%, #f5e1c0 100%);
          box-shadow: 0 2px 24px 0 #e0b97a33;
          border-radius: 1.5rem;
          border: 1.5px solid #e0b97a;
        }
        .luxury-page .section-card {
          background: rgba(255,255,255,0.92);
          box-shadow: 0 2px 16px 0 #e0b97a22;
        }
        .luxury-page h2, .luxury-page h3, .luxury-page h4 {
          font-family: 'Nanum Myeongjo', serif;
        }
        .luxury-page .image-3d {
          transition: transform 0.3s cubic-bezier(.25,.8,.25,1);
          will-change: transform;
        }
        .luxury-page .image-3d:hover {
          transform: rotateY(6deg) scale(1.04);
          box-shadow: 0 8px 32px 0 rgba(80,60,20,0.18);
        }
      `}</style>
      <HTMLFlipBook
        width={480}
        height={700}
        size="stretch"
        minWidth={320}
        maxWidth={600}
        minHeight={500}
        maxHeight={900}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        className="rounded-2xl shadow-2xl"
      >
        {/* 표지 */}
        <div className="magic-cover flex flex-col items-center justify-center h-full w-full rounded-2xl relative">
          <div className="magic-glow" />
          {[...Array(8)].map((_,i)=>(
            <div key={i} className="star-twinkle" style={{left:`${10+Math.random()*80}%`,top:`${10+Math.random()*80}%`,animationDelay:`${Math.random()*2.5}s`}} />
          ))}
          <h1 className="text-5xl font-extrabold text-amber-900 mb-4 drop-shadow-lg" style={{fontFamily:'Nanum Myeongjo, serif',letterSpacing:'0.08em'}}>마법의 자서전</h1>
          <p className="text-2xl text-amber-700 mb-6 font-handletter" style={{fontFamily:'Nanum Pen Script, cursive'}}>AI와 함께 만든 나만의 인생 이야기</p>
          <div className="mt-8 text-center text-amber-800 text-lg opacity-80">책장을 넘겨보세요!</div>
        </div>
        {/* 각 섹션을 양면(이미지/텍스트)로 분리 */}
        {doublePages.map(({ section }, idx) => [
          // 왼쪽: 이미지 4컷
          <div key={`img-${idx}`} className="luxury-page flex flex-col h-full w-full items-center justify-center overflow-y-auto" style={{ minHeight: 0, flex: 1 }}>
            <h2 className="text-xl font-bold text-amber-800 mb-4">{section.title} - 이미지</h2>
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs mx-auto flex-1" style={{ minHeight: 0 }}>
              {(() => {
                let imgs: string[] = [];
                if (section.illustration) {
                  if (typeof section.illustration === "string") {
                    try { imgs = JSON.parse(section.illustration); } catch { imgs = []; }
                  } else if (Array.isArray(section.illustration)) {
                    imgs = section.illustration;
                  }
                }
                return imgs.slice(0, 4).map((img: string, imgIdx: number) => (
                  <div key={`imgbox-${idx}-${imgIdx}`} className="image-3d aspect-square rounded-xl overflow-hidden border-2 border-amber-200 shadow bg-white flex items-center justify-center h-full" style={{ minHeight: 0 }}>
                    <img 
                      src={getProxiedImageUrl(img)} 
                      alt={`이미지${imgIdx + 1}`} 
                      className="object-cover w-full h-full" 
                      style={{ minHeight: 0 }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src && target.src.includes('oaidalleapiprodscus.blob.core.windows.net')) {
                          target.src = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}&blur=2`;
                        }
                      }}
                    />
                  </div>
                ));
              })()}
            </div>
          </div>,
          // 오른쪽: 자서전 텍스트
          <div key={`txt-${idx}`} className="luxury-page flex flex-col h-full w-full p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-amber-800">{section.title} - 자서전</h2>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold shadow hover:bg-amber-200 transition"
                  onClick={()=>{
                    const text = section.questions.map((q:string,ix:number)=>`${ix+1}번 질문: ${q}\n답변: ${section.answers?.[ix]||''}`).join('\n');
                    speakText(text);
                  }}
                >📢 음성으로 읽어주기</button>
                <button
                  className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-sm font-semibold shadow hover:bg-gray-300 transition"
                  onClick={stopSpeak}
                >🔇 멈춤</button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {section.questions?.map((question: string, qIndex: number) => {
                const editState = editValues[idx]?.[qIndex] || { value: section.answers?.[qIndex] || "", isEditing: false, saveMsg: "" };
                return (
                  <div key={qIndex} className="mb-8 last:mb-0">
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full">
                        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {qIndex + 1}
                        </div>
                        <h3 className="font-semibold text-amber-800">{question}</h3>
                      </div>
                    </div>
                    {editState.isEditing ? (
                      <div className="mb-2">
                        <textarea
                          className="w-full rounded border border-amber-300 p-2 text-base"
                          value={editState.value}
                          onChange={e => handleEditChange(idx, qIndex, e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            className="px-3 py-1 rounded bg-amber-500 text-white font-bold hover:bg-amber-600"
                            onClick={() => handleEditSave(idx, qIndex, section)}
                          >수정 저장</button>
                          <button
                            className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-bold hover:bg-gray-300"
                            onClick={() => handleEditCancel(idx, qIndex, section.answers?.[qIndex] || "")}
                          >취소</button>
                        </div>
                        {editState.saveMsg && <div className="text-green-700 text-sm mt-1">{editState.saveMsg}</div>}
                      </div>
                    ) : (
                      <div className="bg-white bg-opacity-80 rounded-lg p-6 shadow-sm border border-amber-200">
                        <div className="relative">
                          <QuestionAnswer
                            question={question}
                            answer={editState.value}
                            questionNumber={qIndex}
                          />
                          <button
                            className="absolute top-2 right-2 px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded shadow hover:bg-amber-200"
                            onClick={() => handleEditStart(idx, qIndex, section.answers?.[qIndex] || "")}
                          >수정</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ]).flat()}
        {/* 뒷표지 */}
        <div className="magic-cover flex flex-col items-center justify-center h-full w-full rounded-2xl relative">
          <div className="magic-glow" />
          {[...Array(8)].map((_,i)=>(
            <div key={i} className="star-twinkle" style={{left:`${10+Math.random()*80}%`,top:`${10+Math.random()*80}%`,animationDelay:`${Math.random()*2.5}s`}} />
          ))}
          <h2 className="text-3xl font-bold text-amber-900 mb-2 drop-shadow-lg" style={{fontFamily:'Nanum Myeongjo, serif'}}>THE END</h2>
          <p className="text-lg text-amber-700 mb-4 font-handletter" style={{fontFamily:'Nanum Pen Script, cursive'}}>나만의 인생 이야기, 완성!</p>
          <button
            className="mt-4 px-4 py-2 rounded-full bg-amber-200 text-amber-900 font-bold shadow hover:bg-amber-300 transition"
            onClick={stopSpeak}
          >🔇 음성 멈추기</button>
        </div>
      </HTMLFlipBook>
    </div>
  );
} 