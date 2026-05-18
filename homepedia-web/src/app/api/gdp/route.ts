import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/apiClient";

export async function GET() {
  try {
    const res = await apiFetch("/gdp");
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
