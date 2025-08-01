import React, { useState, useRef } from "react";
import { getProxiedImageUrl } from "@/lib/image-utils";
import { Button } from "@/components/ui/button";

export default function AIDiary({ onBack }: { onBack: () => void }) {
  const [aiDiaryText, setAIDiaryText] = useState("");
  const [aiDiaryResult, setAIDiaryResult] = useState("");
  const [aiDiaryImage, setAIDiaryImage] = useState("");
  const [aiDiaryLoading, setAIDiaryLoading] = useState(false);
  const [aiDiaryError, setAIDiaryError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  async function handleAIDiaryAutoComplete() {
    setAIDiaryLoading(true); setAIDiaryError("");
    try {
      const res = await fetch("/api/ai-diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiDiaryText, mode: "auto" })
      });
      const data = await res.json();
      if (data.result) setAIDiaryText(aiDiaryText + "\n" + data.result);
      else setAIDiaryError("AI 자동완성 실패");
    } catch (e) { setAIDiaryError("AI 자동완성 오류"); }
    setAIDiaryLoading(false);
  }
  async function handleAIDiaryEmotion() {
    setAIDiaryLoading(true); setAIDiaryError("");
    try {
      const res = await fetch("/api/ai-diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiDiaryText, mode: "emotion" })
      });
      const data = await res.json();
      if (data.result) setAIDiaryResult("감정: " + data.result);
      else setAIDiaryError("감정 분석 실패");
    } catch (e) { setAIDiaryError("감정 분석 오류"); }
    setAIDiaryLoading(false);
  }
  async function handleAIDiarySummary() {
    setAIDiaryLoading(true); setAIDiaryError("");
    try {
      const res = await fetch("/api/ai-diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiDiaryText, mode: "summary" })
      });
      const data = await res.json();
      if (data.result) setAIDiaryResult("요약: " + data.result);
      else setAIDiaryError("요약 실패");
    } catch (e) { setAIDiaryError("요약 오류"); }
    setAIDiaryLoading(false);
  }
  async function handleAIDiaryImage() {
    setAIDiaryLoading(true); setAIDiaryError("");
    try {
      const res = await fetch("/api/ai-diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiDiaryText, mode: "image" })
      });
      const data = await res.json();
      if (data.image) setAIDiaryImage(data.image);
      else setAIDiaryError("이미지 생성 실패");
    } catch (e) { setAIDiaryError("이미지 생성 오류"); }
    setAIDiaryLoading(false);
  }
  function handleAIDiarySave() {
    try {
      localStorage.setItem("aiDiaryText", aiDiaryText);
      setAIDiaryResult("저장 완료!");
    } catch (e) { setAIDiaryError("저장 오류"); }
  }
  function handleAIDiaryLoad() {
    try {
      const saved = localStorage.getItem("aiDiaryText");
      if (saved) setAIDiaryText(saved);
    } catch {}
  }
  function startVoiceInput() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setAIDiaryError("브라우저가 음성 인식을 지원하지 않습니다.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAIDiaryText((prev: string) => prev + (prev ? "\n" : "") + transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  }
  function stopVoiceInput() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100 p-4">
      <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-2xl border-2 border-yellow-200 p-8 relative">
        <h1 className="text-4xl font-bold text-center mb-6 text-yellow-900 drop-shadow-lg">AI 일기</h1>
        <div className="flex gap-2 mb-2">
          <Button onClick={isRecording ? stopVoiceInput : startVoiceInput} variant={isRecording ? "destructive" : "outline"}>
            {isRecording ? "녹음 중지" : "음성 입력"}
          </Button>
          <Button onClick={handleAIDiaryLoad} variant="outline">불러오기</Button>
          <Button onClick={onBack} variant="outline">돌아가기</Button>
        </div>
        <textarea
          className="w-full min-h-[160px] rounded-lg border border-yellow-300 p-4 text-lg font-serif mb-4"
          placeholder="오늘의 일기를 자유롭게 작성해보세요..."
          value={aiDiaryText}
          onChange={e => setAIDiaryText(e.target.value)}
          lang="ko"
          inputMode="text"
          autoComplete="off"
          spellCheck="false"
        />
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <Button className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-400 text-white font-bold" onClick={handleAIDiaryAutoComplete} disabled={aiDiaryLoading}>AI 자동완성</Button>
          <Button className="flex-1 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold" onClick={handleAIDiaryEmotion} disabled={aiDiaryLoading}>감정 분석</Button>
          <Button className="flex-1 bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold" onClick={handleAIDiarySummary} disabled={aiDiaryLoading}>요약</Button>
          <Button className="flex-1 bg-gradient-to-r from-amber-400 to-yellow-200 text-brown-900 font-bold" onClick={handleAIDiaryImage} disabled={aiDiaryLoading}>이미지 생성</Button>
        </div>
        {aiDiaryResult && <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-900">{aiDiaryResult}</div>}
        {aiDiaryError && <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded text-red-700">{aiDiaryError}</div>}
        {aiDiaryImage && (
  <img 
    src={getProxiedImageUrl(aiDiaryImage)} 
    alt="AI Diary" 
    className="w-full rounded-lg mt-4"
    onError={(e) => {
      const target = e.target as HTMLImageElement;
      if (target.src && target.src.includes('oaidalleapiprodscus.blob.core.windows.net')) {
        target.src = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}&blur=2`;
      }
    }}
  />
)}
        <div className="flex gap-2 mt-4">
          <Button onClick={handleAIDiarySave} variant="outline">저장</Button>
        </div>
      </div>
    </div>
  );
} 