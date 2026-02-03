import { AIService } from "@/lib/ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { text, targetLang } = await request.json();
        if (!text || !targetLang) {
            return NextResponse.json({ error: "Missing text or targetLang" }, { status: 400 });
        }
        const result = await AIService.translate(text, targetLang);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
