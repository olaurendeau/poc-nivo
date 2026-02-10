import { getObservationsForMap } from "@/lib/observations";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const observations = await getObservationsForMap();
  return NextResponse.json(observations);
}
