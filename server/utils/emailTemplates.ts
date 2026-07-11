const BRAND_NAME = 'Mathly'
const BRAND_COLOR = '#06b6d4'

const baseLayout = (title: string, bodyHtml: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background-color:#0f172a;padding:24px 32px;">
                <span style="font-size:20px;font-weight:700;color:#ffffff;">Math<span style="color:${BRAND_COLOR};">ly</span></span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#1f2937;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#f9fafb;color:#9ca3af;font-size:12px;text-align:center;">
                &copy; ${new Date().getFullYear()} ${BRAND_NAME}. If you didn't request this, you can safely ignore this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`

const button = (link: string, label: string) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
    <tr>
      <td style="border-radius:8px;background-color:${BRAND_COLOR};">
        <a href="${link}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>
`

const fallbackLink = (link: string) => `
  <p style="font-size:13px;color:#6b7280;word-break:break-all;margin-top:8px;">
    Or copy and paste this link into your browser:<br />
    <a href="${link}" style="color:${BRAND_COLOR};">${link}</a>
  </p>
`

type VerifyEmailOptions = {
  verifyLink: string
  username?: string
  expiresInText: string
}

export const buildVerifyEmail = ({ verifyLink, username, expiresInText }: VerifyEmailOptions) => {
  const greeting = username ? `Hi ${username},` : 'Hi there,'
  const html = baseLayout(
    'Verify your email',
    `
      <h1 style="font-size:20px;margin:0 0 16px;">Confirm your email address</h1>
      <p style="font-size:15px;line-height:1.5;margin:0;">${greeting}</p>
      <p style="font-size:15px;line-height:1.5;">Thanks for signing up for ${BRAND_NAME}! Please confirm this is your email address to activate your account.</p>
      ${button(verifyLink, 'Verify email')}
      ${fallbackLink(verifyLink)}
      <p style="font-size:13px;color:#6b7280;margin-top:24px;">This link expires in ${expiresInText}.</p>
    `,
  )

  const text = `${greeting}\n\nThanks for signing up for ${BRAND_NAME}! Confirm your email address by visiting the link below:\n\n${verifyLink}\n\nThis link expires in ${expiresInText}.\n\nIf you didn't request this, you can safely ignore this email.`

  return { html, text }
}

type ResetPasswordOptions = {
  resetLink: string
  username?: string
  expiresInText: string
}

export const buildResetPasswordEmail = ({ resetLink, username, expiresInText }: ResetPasswordOptions) => {
  const greeting = username ? `Hi ${username},` : 'Hi there,'
  const html = baseLayout(
    'Reset your password',
    `
      <h1 style="font-size:20px;margin:0 0 16px;">Reset your password</h1>
      <p style="font-size:15px;line-height:1.5;margin:0;">${greeting}</p>
      <p style="font-size:15px;line-height:1.5;">We received a request to reset the password for your ${BRAND_NAME} account. Click the button below to choose a new password.</p>
      ${button(resetLink, 'Reset password')}
      ${fallbackLink(resetLink)}
      <p style="font-size:13px;color:#6b7280;margin-top:24px;">This link expires in ${expiresInText}. If you didn't request a password reset, you can safely ignore this email — your password will not be changed.</p>
    `,
  )

  const text = `${greeting}\n\nWe received a request to reset the password for your ${BRAND_NAME} account. Visit the link below to choose a new password:\n\n${resetLink}\n\nThis link expires in ${expiresInText}. If you didn't request this, you can safely ignore this email.`

  return { html, text }
}
