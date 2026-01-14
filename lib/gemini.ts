import { GoogleGenerativeAI } from "@google/generative-ai";

export const getGeminiResponse = async (prompt: string) => {
    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    console.log("Gemini Request with key:", API_KEY ? "Present" : "Missing");

    if (!API_KEY) {
        return "Gemini API 키가 설정되지 않았습니다. .env.local 파일에 NEXT_PUBLIC_GEMINI_API_KEY를 추가하고 서버를 재시작해 주세요.";
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("Gemini API Error Details:", error);

        if (error.message?.includes("API_KEY_INVALID")) {
            return "입력된 Gemini API 키가 유효하지 않습니다. 키를 다시 확인해 주세요.";
        }

        if (error.message?.includes("location is not supported")) {
            return "현재 계정 또는 지역에서 Gemini API 접근이 제한되어 있습니다.";
        }

        return `Gemini 응답 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류"}`;
    }
};
