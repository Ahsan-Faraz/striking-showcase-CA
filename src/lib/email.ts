const GHL_WEBHOOK_URL =
  process.env.GHL_WEBHOOK_URL ||
  "https://services.leadconnectorhq.com/hooks/TiIvB0jM6X8SSY9reRY3/webhook-trigger/997c406d-611c-4882-b796-1624a153ae2f";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://strikingshowcase.com";
const DEFAULT_FROM_NAME = "Striking Showcase";
const DEFAULT_FROM_EMAIL =
  process.env.GHL_FROM_EMAIL ?? "noreply@strikingshowcase.com";

type SendEmailOptions = {
  toEmail: string;
  fromName?: string;
  fromEmail?: string;
  subject: string;
  body: string;
};

export async function sendEmailViaGoHighLevel({
  toEmail,
  fromName,
  fromEmail,
  subject,
  body,
}: SendEmailOptions) {
  const response = await fetch(GHL_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      toEmail,
      fromName: fromName || DEFAULT_FROM_NAME,
      fromEmail: fromEmail || DEFAULT_FROM_EMAIL,
      subject,
      body,
    }),
  });

  if (!response.ok) {
    console.error(
      "GoHighLevel webhook send failed with status:",
      response.status,
    );
    return null;
  }

  return response.json().catch(() => ({ success: true }));
}

export async function sendCoachVerificationPendingEmail({
  to,
  firstName,
}: {
  to: string;
  firstName: string;
}) {
  return sendEmailViaGoHighLevel({
    toEmail: to,
    fromName: DEFAULT_FROM_NAME,
    fromEmail: DEFAULT_FROM_EMAIL,
    subject: "Your Striking Showcase coach account is pending verification",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1f2937;">
        <h2 style="margin: 0 0 16px; color: #7c2d12;">Welcome, ${firstName}!</h2>
        <p style="margin: 0 0 12px; line-height: 1.6;">
          Thank you for creating a coach account on Striking Showcase.
        </p>
        <p style="margin: 0 0 12px; line-height: 1.6;">
          Your account is currently under review. Our team verifies all coach accounts to protect athletes and their families.
        </p>
        <p style="margin: 0 0 12px; line-height: 1.6;">
          You'll be notified within <strong>24–48 hours</strong> once your account is verified.
        </p>
        <p style="margin: 0; line-height: 1.6;">
          In the meantime, you can browse athlete profiles and search the athlete database.
        </p>
      </div>
    `,
  });
}

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
  const acceptUrl = `${APP_URL}/auth/callback?invite=${encodeURIComponent(inviteCode)}`;

  return sendEmailViaGoHighLevel({
    toEmail: to,
    fromName: athleteName,
    fromEmail: DEFAULT_FROM_EMAIL,
    subject: `${athleteName} invited you to Striking Showcase`,
    body: `
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
}
