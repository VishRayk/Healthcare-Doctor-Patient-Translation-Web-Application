import { AIService } from "@/lib/ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { text } = await request.json();
        const summary = await AIService.summarize(text);
        return NextResponse.json({ summary });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
