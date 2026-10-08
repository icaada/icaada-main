import { NextResponse } from "next/server";
import { subscriberService } from "@/Services/subscriber.service";

// GET: the link in emails → unsubscribe, then show a confirmation page.
// POST: RFC 8058 one-click unsubscribe sent by mail clients (List-Unsubscribe-Post).

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const done = await subscriberService.unsubscribeByToken(token).catch(() => false);
  return NextResponse.redirect(new URL(`/newsletter/unsubscribed?status=${done ? "ok" : "invalid"}`, request.url), 303);
}

export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const done = await subscriberService.unsubscribeByToken(token).catch(() => false);
  return new Response(done ? "Unsubscribed" : "Invalid link", { status: done ? 200 : 400 });
}
