import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(express.json());

// ---------------------------------------------------------
// Supabase 클라이언트 및 안전 초기화 헬퍼 (API Key 누출 방지)
// ---------------------------------------------------------
let supabaseClient: any = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    
    // 환경 변수 설정 여부 안전 검사 (서버 크래시 방지)
    if (
      !url || 
      !anonKey || 
      url.includes("your-project") || 
      anonKey.includes("your-anon-key") ||
      url === "MY_SUPABASE_URL" ||
      anonKey === "MY_SUPABASE_ANON_KEY"
    ) {
      console.warn("⚠️ Supabase 환경 변수가 아직 완전하게 구성되지 않았습니다. 실시간 DB 등록 기능은 로컬 가상 모드로 대체 작동합니다.");
      return null;
    }
    
    supabaseClient = createClient(url, anonKey);
  }
  return supabaseClient;
}

// ---------------------------------------------------------
// Gemini AI API 설정 및 헬퍼
// ---------------------------------------------------------
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not properly configured");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ---------------------------------------------------------
// API 엔드포인트
// ---------------------------------------------------------

// 1. AI 입찰 가이드 및 추천 리포트 생성
app.post("/api/ai/recommend", async (req, res) => {
  const { process, address, area, notes } = req.body;

  try {
    const ai = getGeminiClient();
    const prompt = `인테리어 역경매 플랫폼 '시공파트너'입니다. 아래의 현장 정보를 분석하고, 이 공사의 예상 입찰 금액 범위(최소/최대)와 시공업체 매칭 및 자재 선정 가이드라인을 JSON 형식으로 작성해 주세요.
    
    공정: ${process}
    지역/주소: ${address}
    평수: ${area}평
    특이사항/메모: ${notes}
    
    반드시 다음 JSON 형식을 정확히 지켜서 응답해주세요:
    {
      "estimatedLow": 예상_최소_입찰가_숫자만,
      "estimatedHigh": 예상_최고_입찰가_숫자만,
      "recommendations": ["AI 기반 매칭 추천 및 시공업체 유의사항 3가지 이상"],
      "keyFactors": ["해당 공정 견적 결정에 큰 영향을 미치는 핵심 요인 3가지 이상"]
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["estimatedLow", "estimatedHigh", "recommendations", "keyFactors"],
          properties: {
            estimatedLow: { type: Type.INTEGER, description: "예상 최소 시공 금액(원 단위)" },
            estimatedHigh: { type: Type.INTEGER, description: "예상 최대 시공 금액(원 단위)" },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "해당 현장 추천 시공 팁 및 주의사항"
            },
            keyFactors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "견적에 영향을 미치는 핵심 요인"
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text.trim()));
  } catch (error) {
    console.warn("Gemini API call failed, serving fallback simulated recommendations.", error);
    // Fallback: Gemini가 없거나 에러가 나면 지능적인 기본값을 서빙함
    let basePrice = 2000000;
    if (process === "타일") basePrice = 2800000;
    else if (process === "도배") basePrice = 1800000;
    else if (process === "목공") basePrice = 3500000;
    else if (process === "전기") basePrice = 1500000;
    else if (process === "설비") basePrice = 2200000;
    else if (process === "철거") basePrice = 1200000;

    const areaMultiplier = Number(area) ? Number(area) / 30 : 1;
    const finalPrice = Math.round(basePrice * areaMultiplier);

    res.json({
      estimatedLow: Math.round(finalPrice * 0.85),
      estimatedHigh: Math.round(finalPrice * 1.15),
      recommendations: [
        `${process} 시공 경력 5년 이상의 숙련된 반장을 추천하며, 하자 보수 보증 여부를 확인하세요.`,
        "주변 이웃 주민 민원 방지를 위해 소음 공정이 있는 경우 사전에 미리 관리사무소 신고를 권장합니다.",
        "자재 수급 및 양생 일정을 고려해 공사 완료일 기준 여유 일정을 1~2일 확보하는 것이 안전합니다.",
        "도면 정보가 명확할수록 시공업자들의 견적 오차가 줄어들어 합리적인 입찰이 가능해집니다."
      ],
      keyFactors: [
        `현장 평수(${area}평) 및 벽면 상태에 따른 기본 자재 투입량`,
        `지리적 접근성 및 가재 도구 이동 동선(주차 및 엘리베이터 유무)`,
        "공기 일정 단축 및 야간/주말 작업 진행 필요 여부",
        "디테일 요구사항 및 프리미엄 자재(친환경/친수성 등) 변경 여부"
      ],
      isFallback: true
    });
  }
});

// 2. 푸시 알림 타이틀 및 바디 자동 생성
app.post("/api/ai/notification", async (req, res) => {
  const { process, address, area } = req.body;

  try {
    const ai = getGeminiClient();
    const prompt = `인테리어 B2B 역경매 서비스에서 현장 공사가 등록되었습니다. 시공업자들에게 앱 푸시 알림을 발송하려 합니다.
    업자의 관심을 끌 수 있고 전문성이 돋보이는 모바일 푸시 알림 제목(Title)과 본문(Body)을 작성해 주세요.
    
    공정: ${process}
    주소/지역: ${address}
    평수: ${area}평
    
    반드시 다음 JSON 형식을 정확히 지켜서 응답해주세요:
    {
      "title": "푸시 알림 제목",
      "body": "푸시 알림 본문 메시지"
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "body"],
          properties: {
            title: { type: Type.STRING },
            body: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text.trim()));
  } catch (error) {
    console.warn("Gemini API call failed, serving fallback notifications.", error);
    res.json({
      title: `🔔 [신규입찰] ${address.split(" ").slice(0, 2).join(" ")} ${area}평 ${process}공사`,
      body: `지정 공정: ${process} | 일정에 맞춰 지금 견적을 제안하고 일감을 선점하세요!`,
      isFallback: true
    });
  }
});

// 3. 채팅방 AI 가이드라인 / 추천 협의 사항 메시지 생성
app.post("/api/ai/chat-suggestion", async (req, res) => {
  const { process, area, notes } = req.body;

  try {
    const ai = getGeminiClient();
    const prompt = `인테리어 업체와 시공업자가 낙찰 후 매칭되어 실시간 채팅방을 열었습니다. 
    이 공정(${process}, ${area}평, 특이사항: ${notes})의 사전 조율을 위해, 양측이 오해나 분쟁 없이 매끄럽게 합의해야 할 '채팅 사전 체크리스트' 4가지를 대화체 제안 형태로 작성해 주세요.
    
    반드시 다음 JSON 형식을 지켜주세요:
    {
      "suggestions": [
        "사전 조율용 질문/제안 문장 1",
        "사전 조율용 질문/제안 문장 2",
        "사전 조율용 질문/제안 문장 3",
        "사전 조율용 질문/제안 문장 4"
      ]
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["suggestions"],
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text.trim()));
  } catch (error) {
    console.warn("Gemini API call failed, serving fallback chat suggestions.", error);
    res.json({
      suggestions: [
        "반장님, 현장에 엘리베이터 사용이나 사다리차 진입 공간 확보가 가능한지 체크하셨나요?",
        "공사에 필요한 기본 부자재(실리콘, 시멘트, 보양재 등) 부담 주체가 누구인지 확인이 필요합니다.",
        "혹시 현장 진입 전에 소음 신고나 아파트 주민 동의서 작업은 인테리어 업체 측에서 전담 완료했는지 물어보세요.",
        "시공 하자가 발생할 경우 하자 보수 기간(예: 시공 완료 후 1년) 및 정산 승인 조건에 대해 확실히 정해두시면 안전합니다."
      ],
      isFallback: true
    });
  }
});

// 4. Supabase 연동: 신규 공사현장 입찰 등록
app.post("/api/construction-sites", async (req, res) => {
  const { title, address, size, category, region, start_date, end_date, description } = req.body;

  const supabase = getSupabaseClient();

  if (!supabase) {
    return res.json({
      success: true,
      message: "Supabase URL과 Anon Key가 아직 구성되지 않았습니다. 로컬 데모 모드로 공사 현장을 등록합니다.",
      fallback: true,
      data: { title, address, size, category, region, start_date, end_date, description }
    });
  }

  try {
    const { data, error } = await supabase
      .from("construction_sites")
      .insert([
        {
          title,
          address,
          size: Number(size) || 0,
          category,
          region,
          start_date,
          end_date,
          description
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: "성공적으로 Supabase 데이터베이스에 등록되었습니다!",
      data: data ? data[0] : { title, address, size, category, region, start_date, end_date, description }
    });
  } catch (error: any) {
    console.error("Supabase insert error details:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Supabase 테이블 삽입 중 예기치 않은 오류가 발생했습니다."
    });
  }
});

// 5. V-cell 웹훅 수신 및 Supabase 자동 연동
app.post("/api/vcell/webhook", async (req, res) => {
  const {
    title,
    address,
    region,
    size,
    area,
    category,
    process,
    start_date,
    startDate,
    end_date,
    endDate,
    description,
    notes,
    memo
  } = req.body;

  // 비셀에서 다양한 필드명으로 전송할 수 있으므로 지능적으로 값을 매핑합니다.
  const finalTitle = title || "비셀 연동 신규 현장";
  const finalAddress = address || "";
  const finalRegion = region || "";
  const finalSize = Number(size || area) || 0;
  const finalCategory = category || process || "기타";
  const finalStartDate = start_date || startDate || null;
  const finalEndDate = end_date || endDate || null;
  const finalDescription = description || notes || memo || "";

  console.log("📥 [V-cell Webhook] 데이터가 수신되었습니다:", {
    title: finalTitle,
    address: finalAddress,
    region: finalRegion,
    size: finalSize,
    category: finalCategory,
    start_date: finalStartDate,
    end_date: finalEndDate,
    description: finalDescription
  });

  const supabase = getSupabaseClient();

  if (!supabase) {
    console.warn("⚠️ Supabase 환경 변수가 설정되지 않아 웹훅 수신 테스트 시뮬레이션 모드로 작동합니다.");
    return res.status(200).json({
      success: true,
      message: "V-cell 웹훅 수신 완료 (데모 시뮬레이션 모드)",
      data: {
        title: finalTitle,
        address: finalAddress,
        region: finalRegion,
        size: finalSize,
        category: finalCategory,
        start_date: finalStartDate,
        end_date: finalEndDate,
        description: finalDescription
      }
    });
  }

  try {
    const { data, error } = await supabase
      .from("construction_sites")
      .insert([
        {
          title: finalTitle,
          address: finalAddress,
          size: finalSize,
          category: finalCategory,
          region: finalRegion,
          start_date: finalStartDate,
          end_date: finalEndDate,
          description: finalDescription
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "V-cell 현장 정보가 성공적으로 Supabase에 등록되었습니다.",
      data: data ? data[0] : null
    });
  } catch (error: any) {
    console.error("❌ [V-cell Webhook] Supabase 등록 오류:", error);
    res.status(500).json({
      success: false,
      message: "V-cell 웹훅 데이터 저장 중 서버 내부 오류가 발생했습니다.",
      error: error.message || error
    });
  }
});

export default app;
