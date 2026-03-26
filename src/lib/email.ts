/**
 * Email module — GoHighLevel webhook for ALL emails.
 *
 * Signup/Auth emails:
 *   - sendAthleteWelcomeEmail (on /api/auth/register)
 *   - sendCoachVerificationPendingEmail (on /coaches/signup)
 *
 * Notification emails:
 *   - sendNewMessageToAthleteEmail
 *   - sendReplyToCoachEmail
 *   - sendFamilyMessageNotificationEmail
 *   - sendFamilyInviteEmail
 *   - sendDailyDigestEmail
 */

// ─── Constants ──────────────────────────────────────────────────────────────
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://strikingshowcase.com";
const DEFAULT_FROM_NAME = "Striking Showcase";
const DEFAULT_FROM_EMAIL =
  process.env.GHL_FROM_EMAIL ?? "noreply@strikingshowcase.com";
const GHL_WEBHOOK_URL =
  process.env.GHL_WEBHOOK_URL ||
  "https://services.leadconnectorhq.com/hooks/TiIvB0jM6X8SSY9reRY3/webhook-trigger/997c406d-611c-4882-b796-1624a153ae2f";

// ─── Core send function ─────────────────────────────────────────────────────

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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      toEmail,
      fromName: fromName || DEFAULT_FROM_NAME,
      fromEmail: fromEmail || DEFAULT_FROM_EMAIL,
      subject,
      body,
    }),
  });

  if (!response.ok) {
    console.error("GoHighLevel webhook failed:", response.status);
    return null;
  }

  return response.json().catch(() => ({ success: true }));
}

// ─── HTML helpers ───────────────────────────────────────────────────────────

function truncatePreview(content: string, maxLen = 200): string {
  if (content.length <= maxLen) return content;
  return content.slice(0, maxLen).trimEnd() + "…";
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapHtml(innerHtml: string): string {
  return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #0d0d0d; color: #E8E6ED;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #C9A84C; margin: 0;">Striking Showcase</h1>
      </div>
      <div style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 32px;">
        ${innerHtml}
      </div>
      <p style="color: #6B687A; font-size: 11px; text-align: center; margin-top: 24px;">
        Striking Showcase — The bowling recruiting platform<br/>
        <a href="${APP_URL}/dashboard/settings" style="color: #6B687A; text-decoration: underline;">Manage notification preferences</a>
      </p>
    </div>
  `;
}

function ctaButton(text: string, url: string): string {
  return `
    <div style="text-align: center; margin: 28px 0;">
      <a href="${url}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #660033, #8B0045); color: #fff; font-weight: 600; font-size: 14px; text-decoration: none; border-radius: 10px;">
        ${escapeHtml(text)}
      </a>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// ██  Signup / Auth emails
// ═══════════════════════════════════════════════════════════════════════════

/** Coach verification pending email (sent on /coaches/signup) */
export async function sendCoachVerificationPendingEmail({
  to,
  firstName,
}: {
  to: string;
  firstName: string;
}) {
  return sendEmailViaGoHighLevel({
    toEmail: to,
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

/** Athlete welcome email (sent on /api/auth/register) */
export async function sendAthleteWelcomeEmail({
  to,
  firstName,
}: {
  to: string;
  firstName: string;
}) {
  return sendEmailViaGoHighLevel({
    toEmail: to,
    subject: "Welcome to Striking Showcase — Let's Build Your Profile!",
    body: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #0d0d0d; color: #E8E6ED;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #C9A84C; margin: 0;">Striking Showcase</h1>
        </div>
        <div style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 32px;">
          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 12px 0; color: #E8E6ED;">
            Welcome, ${firstName}! 🎳
          </h2>
          <p style="color: #9A97A6; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
            Your Striking Showcase account has been created. You're one step closer to getting discovered by college coaches.
          </p>
          <p style="color: #9A97A6; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
            Here's what to do next:
          </p>
          <ol style="color: #9A97A6; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0 0 24px 0;">
            <li>Complete your profile with stats and personal info</li>
            <li>Upload a profile photo</li>
            <li>Add your ball arsenal</li>
            <li>Upload highlight videos</li>
            <li>Add tournament results</li>
          </ol>
          <p style="color: #9A97A6; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
            The more complete your profile, the easier it is for coaches to find and evaluate you.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${APP_URL}/onboarding" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #660033, #8B0045); color: #fff; font-weight: 600; font-size: 14px; text-decoration: none; border-radius: 10px;">
              Complete Your Profile
            </a>
          </div>
        </div>
        <p style="color: #6B687A; font-size: 11px; text-align: center; margin-top: 24px;">
          Striking Showcase — The bowling recruiting platform
        </p>
      </div>
    `,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ██  Notification emails
// ═══════════════════════════════════════════════════════════════════════════

/** Coach sends message → notify athlete */
export async function sendNewMessageToAthleteEmail({
  to,
  coachName,
  coachSchool,
  messagePreview,
}: {
  to: string;
  coachName: string;
  coachSchool: string;
  messagePreview: string;
}) {
  const preview = escapeHtml(truncatePreview(messagePreview));
  return sendEmailViaGoHighLevel({
    toEmail: to,
    subject: `Coach ${coachName} from ${coachSchool} sent you a message`,
    body: wrapHtml(`
      <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 12px; color: #E8E6ED;">New Message from a Coach</h2>
      <p style="color: #9A97A6; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        <strong style="color: #E8E6ED;">${escapeHtml(coachName)}</strong> from 
        <strong style="color: #E8E6ED;">${escapeHtml(coachSchool)}</strong> sent you a message:
      </p>
      <div style="background: #252525; border-left: 3px solid #C9A84C; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 0 0 20px;">
        <p style="color: #E8E6ED; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">"${preview}"</p>
      </div>
      ${ctaButton("Read Message", `${APP_URL}/dashboard/inquiries`)}
    `),
  });
}

/** Athlete replies → notify coach */
export async function sendReplyToCoachEmail({
  to,
  athleteName,
  messagePreview,
  threadId,
}: {
  to: string;
  athleteName: string;
  messagePreview: string;
  threadId: string;
}) {
  const preview = escapeHtml(truncatePreview(messagePreview));
  return sendEmailViaGoHighLevel({
    toEmail: to,
    subject: `${athleteName} replied to your message`,
    body: wrapHtml(`
      <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 12px; color: #E8E6ED;">New Reply</h2>
      <p style="color: #9A97A6; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        <strong style="color: #E8E6ED;">${escapeHtml(athleteName)}</strong> replied to your message:
      </p>
      <div style="background: #252525; border-left: 3px solid #C9A84C; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 0 0 20px;">
        <p style="color: #E8E6ED; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">"${preview}"</p>
      </div>
      ${ctaButton("View Reply", `${APP_URL}/portal/messages?thread=${threadId}`)}
    `),
  });
}

/** Coach messages → notify family members */
export async function sendFamilyMessageNotificationEmail({
  to,
  athleteName,
  coachName,
  messagePreview,
  athleteSlug,
}: {
  to: string;
  athleteName: string;
  coachName: string;
  messagePreview: string;
  athleteSlug: string;
}) {
  const preview = escapeHtml(truncatePreview(messagePreview));
  return sendEmailViaGoHighLevel({
    toEmail: to,
    subject: `New message about ${athleteName}'s recruiting`,
    body: wrapHtml(`
      <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 12px; color: #E8E6ED;">New Recruiting Message</h2>
      <p style="color: #9A97A6; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        <strong style="color: #E8E6ED;">${escapeHtml(coachName)}</strong> sent a message regarding
        <strong style="color: #E8E6ED;">${escapeHtml(athleteName)}</strong>'s recruiting:
      </p>
      <div style="background: #252525; border-left: 3px solid #C9A84C; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 0 0 20px;">
        <p style="color: #E8E6ED; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">"${preview}"</p>
      </div>
      ${ctaButton("View Message", `${APP_URL}/family/${athleteSlug}`)}
    `),
  });
}

/** Family invite email */
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
    subject: `${athleteName} invited you to Striking Showcase`,
    body: wrapHtml(`
      <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 12px 0; color: #E8E6ED;">
        You've been invited!
      </h2>
      <p style="color: #9A97A6; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
        Hi ${escapeHtml(inviteeName)},
      </p>
      <p style="color: #9A97A6; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
        <strong style="color: #E8E6ED;">${escapeHtml(athleteName)}</strong> has invited you as a 
        <strong style="color: #E8E6ED;">${escapeHtml(relationship)}</strong> to their Striking Showcase profile. As a family member, you'll be able to:
      </p>
      <ul style="color: #9A97A6; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0 0 24px 0;">
        <li>View their full recruiting profile and stats</li>
        <li>Read and reply to coach messages</li>
        <li>Track recruiting analytics</li>
      </ul>
      ${ctaButton("Accept Invitation", acceptUrl)}
      <p style="color: #6B687A; font-size: 12px; text-align: center; margin: 0;">
        This invite expires in 7 days.
      </p>
    `),
  });
}

/** Daily digest for athlete with unread messages */
export async function sendDailyDigestEmail({
  to,
  athleteName,
  unreadCount,
  coachSummaries,
}: {
  to: string;
  athleteName: string;
  unreadCount: number;
  coachSummaries: { name: string; school: string; count: number }[];
}) {
  const coachListHtml = coachSummaries
    .map(
      (c) =>
        `<li style="margin-bottom: 8px;"><strong style="color: #E8E6ED;">${escapeHtml(c.name)}</strong> from ${escapeHtml(c.school)} — ${c.count} message${c.count > 1 ? "s" : ""}</li>`,
    )
    .join("");

  return sendEmailViaGoHighLevel({
    toEmail: to,
    subject: `You have ${unreadCount} unread message${unreadCount > 1 ? "s" : ""} on Striking Showcase`,
    body: wrapHtml(`
      <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 12px; color: #E8E6ED;">
        Hi ${escapeHtml(athleteName)}, you have unread messages!
      </h2>
      <p style="color: #9A97A6; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
        ${unreadCount} unread message${unreadCount > 1 ? "s" : ""} from college coaches:
      </p>
      <ul style="color: #9A97A6; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0 0 20px;">
        ${coachListHtml}
      </ul>
      ${ctaButton("Read Messages", `${APP_URL}/dashboard/inquiries`)}
    `),
  });
}
