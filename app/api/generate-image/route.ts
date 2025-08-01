import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt, style, userName, userAge, userGender, userNationality, characterId, panelNumber, totalPanels, maintainConsistency } = await request.json()
    
    console.log("원본 프롬프트:", prompt)
    console.log("스타일:", style)
    console.log("사용자 정보:", { userName, userAge, userGender, userNationality, characterId, panelNumber, totalPanels })
    
    // 새로운 스토리 기반 프롬프트 구조를 처리
    let cleanPrompt = "";
    
    // 프롬프트에서 구조화된 정보를 추출
    const nameMatch = prompt.match(/Name:\s*([^\n]+)/i);
    const ageMatch = prompt.match(/Age:\s*([^\n]+)/i);
    const genderMatch = prompt.match(/Gender:\s*([^\n]+)/i);
    const nationalityMatch = prompt.match(/Nationality:\s*([^\n]+)/i);
    const characterIdMatch = prompt.match(/Character ID:\s*([^\n]+)/i);
    const sceneMatch = prompt.match(/Scene:\s*([^\n]+)/i);
    const moodMatch = prompt.match(/Mood:\s*([^\n]+)/i);
    const styleMatch = prompt.match(/Style:\s*([^\n]+)/i);
    const keywordsMatch = prompt.match(/Keywords:\s*([^\n]+)/i);
    const panelMatch = prompt.match(/Panel:\s*([^\n]+)/i);
    const descriptionMatch = prompt.match(/Description:\s*([^\n]+)/i);
    const characterDetailsMatch = prompt.match(/Character Details:([\s\S]*?)(?=\n\n|$)/i);
    
    const name = nameMatch?.[1]?.trim() || userName || "person";
    const age = ageMatch?.[1]?.trim() || userAge || "";
    const gender = genderMatch?.[1]?.trim() || userGender || "";
    const nationality = nationalityMatch?.[1]?.trim() || userNationality || "Korean";
    const extractedCharacterId = characterIdMatch?.[1]?.trim() || characterId || `${name}_${gender}_${nationality}`;
    const scene = sceneMatch?.[1]?.trim() || "";
    const mood = moodMatch?.[1]?.trim() || "warm, emotional";
    const stylePrompt = styleMatch?.[1]?.trim() || "";
    const keywords = keywordsMatch?.[1]?.trim() || "";
    const panel = panelMatch?.[1]?.trim() || "";
    const description = descriptionMatch?.[1]?.trim() || "";
    const characterDetails = characterDetailsMatch?.[1]?.trim() || "";
    
    // 스타일별 프롬프트 매핑
    const stylePrompts = {
      classic: "classic old book illustration, golden light, vintage, magical, open book, glowing, ornate, detailed, masterpiece, fantasy, brown and gold, soft focus, high detail, storybook art",
      ghibli: "ghibli style, soft pastel, dreamy, magical, anime, beautiful, cinematic, Studio Ghibli inspired",
      elegant: "elegant illustration, fine art, gold accents, luxury, soft light, ornate, sophisticated",
      childhood: "children's book, cute, playful, bright, watercolor, simple, innocent, colorful",
      watercolor: "watercolor, soft, dreamy, delicate, flowing, artistic",
      oil: "oil painting, rich texture, vibrant, classic, artistic",
      sketch: "sketch, pencil, hand-drawn, simple, artistic",
    };
    
    const selectedStyle = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.classic;
    
    // 스토리 기반 프롬프트를 구성
    let storyPrompt = "";
    
    if (scene) {
      // 장면 설명에서 한글 키워드를 추출
      const koreanNouns = (scene.match(/[가-힣]{2,}/g) || []).filter((w: string) => w.length > 1);
      
             // 키워드 번역 사전
       const keywordTranslations: { [key: string]: string } = {
         '할머니': 'grandmother',
         '할아버지': 'grandfather',
         '어머니': 'mother',
         '아버지': 'father',
         '가족': 'family',
         '친구': 'friends',
         '학교': 'school',
         '교실': 'classroom',
         '선생님': 'teacher',
         '동네': 'neighborhood',
         '집': 'house',
         '놀이터': 'playground',
         '공원': 'park',
         '추석': 'Korean Thanksgiving',
         '설날': 'Korean New Year',
         '한복': 'hanbok',
         '전통': 'traditional',
         '문화': 'culture',
         '음식': 'food',
         '놀이': 'play',
         '학습': 'learning',
         '성장': 'growth',
         '꿈': 'dream',
         '희망': 'hope',
         '사랑': 'love',
         '우정': 'friendship',
         '행복': 'happiness',
         '기쁨': 'joy',
         '웃음': 'laughter',
         '추억': 'memory',
         '기억': 'memory',
         '순간': 'moment',
         '경험': 'experience',
         '일': 'work',
         '직장': 'workplace',
         '회사': 'company',
         '동료': 'colleague',
         '성공': 'success',
         '도전': 'challenge',
         '미래': 'future',
         '현재': 'present',
         '감사': 'gratitude',
         '평화': 'peace',
         '만족': 'contentment',
         '감동': 'emotion',
         '로맨틱': 'romantic',
         '아름다운': 'beautiful',
         '특별한': 'special',
         '소중한': 'precious',
         '따뜻한': 'warm',
         '감성적인': 'emotional',
         '낭만적인': 'romantic'
       };
      
      // 번역된 키워드를 생성
      const translatedKeywords = koreanNouns
        .map((word: string) => ({ original: word, translated: keywordTranslations[word] }))
        .filter((item: { original: string; translated: string | undefined }) => item.translated)
        .map((item: { original: string; translated: string | undefined }) => item.translated!)
        .slice(0, 5);
      
      // 성별 정보를 더 명확하게 처리
      const genderInfo = gender.includes('남성') || gender.includes('boy') ? 'young boy' : 'young girl';
      const characterInfo = characterDetails || genderInfo;
      
      // 캐릭터 일관성을 위한 프롬프트를 구성
      const consistencyNote = maintainConsistency ? `Maintain consistent character appearance for ${extractedCharacterId} across all panels. ` : "";
      
      if (translatedKeywords.length > 0) {
        storyPrompt = `${description}. The scene shows a ${genderInfo} at age ${age}, ${characterInfo}, ${translatedKeywords.join(', ')}. ${mood} atmosphere, warm and nostalgic feeling. ${consistencyNote}High quality, detailed artwork, no text, culturally neutral style.`;
      } else {
        storyPrompt = `${description}. The scene shows a ${genderInfo} at age ${age}, ${characterInfo}, ${keywords}. ${mood} atmosphere, warm and nostalgic feeling. ${consistencyNote}High quality, detailed artwork, no text, culturally neutral style.`;
      }
    } else {
      // 기본 프롬프트
      const genderInfo = gender.includes('남성') || gender.includes('boy') ? 'young boy' : 'young girl';
      const characterInfo = characterDetails || genderInfo;
      const consistencyNote = maintainConsistency ? `Maintain consistent character appearance for ${extractedCharacterId} across all panels. ` : "";
      storyPrompt = `${description}. The scene shows a ${genderInfo} at age ${age}, ${characterInfo}, ${keywords}. ${mood} atmosphere, warm and nostalgic feeling. ${consistencyNote}High quality, detailed artwork, no text, culturally neutral style.`;
    }
    
    cleanPrompt = storyPrompt;
    
    console.log("정리된 프롬프트:", cleanPrompt)

    // OpenAI API 키를 확인
    const openaiApiKey = process.env.OPENAI_API_KEY
    
    console.log("OPENAI_API_KEY 존재 여부:", !!openaiApiKey)
    
    if (!openaiApiKey) {
      console.warn("OpenAI API Key가 설정되지 않았습니다. 플레이스홀더 이미지를 반환합니다.")
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return NextResponse.json({
        imageUrl: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}&blur=2`,
        success: true,
      })
    }

    // OpenAI DALL-E 3 API를 호출
    try {
      console.log("OpenAI DALL-E 3 API 호출 시작...");
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: cleanPrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          style: "vivid"
        }),
      })

      console.log("OpenAI API 응답 상태:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("OpenAI API 응답 데이터:", JSON.stringify(data, null, 2))
        
        const imageUrl = data.data?.[0]?.url
        console.log("OpenAI에서 추출된 이미지 URL:", imageUrl)
        
        if (imageUrl) {
          return NextResponse.json({
            imageUrl: imageUrl,
            success: true,
            model: "dall-e-3"
          })
        }
      } else {
        const errorText = await response.text()
        console.error("OpenAI API 오류 응답:", errorText)
      }
    } catch (openaiError) {
      console.error("OpenAI API 오류:", openaiError)
    }

    // API 실패 시 플레이스홀더를 반환
    console.error("OpenAI API 실패")
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return NextResponse.json({
      imageUrl: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}&blur=2`,
      success: true,
      model: "placeholder"
    })
  } catch (error) {
    console.error("이미지 생성 오류:", error)
    return NextResponse.json({
      imageUrl: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}&blur=2`,
      success: true,
      model: "placeholder",
      error: "이미지 생성에 실패했습니다."
    })
  }
}