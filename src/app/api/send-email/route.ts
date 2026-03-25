import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmailViaGoHighLevel } from "@/lib/email";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  toEmail: z.string().email(),
  fromName: z.string().min(1).max(100).optional(),
  fromEmail: z.string().email().optional(),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      toEmail,
      fromName,
      fromEmail,
      subject,
      body: messageBody,
    } = requestSchema.parse(body);

    const safeFromName = fromName?.trim() || "Striking Showcase";
    const safeBody = escapeHtml(messageBody.trim()).replace(/\r?\n/g, "<br />");

    const result = await sendEmailViaGoHighLevel({
      toEmail,
      fromName: safeFromName,
      fromEmail,
      subject: subject.trim(),
      body: safeBody,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to send email via GoHighLevel" },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      );
    }

    console.error("Test send email error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
