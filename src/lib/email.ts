import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = "Striking Showcase <noreply@strikingshowcase.com>";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://strikingshowcase.com";

export async function sendFamilyInviteEmail({
  to,
  inviteeName,
  athleteName,
  relationship,
  inviteCode,
}: {
  to: string;
  inviteeName: string;
  athleteName: string;
  relationship: string;
  inviteCode: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY not configured — skipping email send");
    return null;
  }

  const acceptUrl = `${APP_URL}/auth/callback?invite=${encodeURIComponent(inviteCode)}`;

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${athleteName} invited you to Striking Showcase`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #0d0d0d; color: #E8E6ED;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #C9A84C; margin: 0;">Striking Showcase</h1>
        </div>
        <div style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 32px;">
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 12px 0; color: #E8E6ED;">
            You've been invited!
          </h2>
          <p style="color: #9A97A6; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
            Hi ${inviteeName},
          </p>
          <p style="color: #9A97A6; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
            <strong style="color: #E8E6ED;">${athleteName}</strong> has invited you as a <strong style="color: #E8E6ED;">${relationship}</strong> to their Striking Showcase profile. As a family member, you'll be able to:
          </p>
          <ul style="color: #9A97A6; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0 0 24px 0;">
            <li>View their full recruiting profile and stats</li>
            <li>Read and reply to coach messages</li>
            <li>Track recruiting analytics</li>
          </ul>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${acceptUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #660033, #8B0045); color: #fff; font-weight: 600; font-size: 14px; text-decoration: none; border-radius: 10px;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #6B687A; font-size: 12px; text-align: center; margin: 0;">
            This invite expires in 7 days.
          </p>
        </div>
        <p style="color: #6B687A; font-size: 11px; text-align: center; margin-top: 24px;">
          Striking Showcase — The bowling recruiting platform
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send family invite email:", error);
    return null;
  }

  return data;
}
