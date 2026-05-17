import { NextResponse } from "next/server";
import data from "@/data/population.json";

export async function GET() {
  return NextResponse.json(data);
}
