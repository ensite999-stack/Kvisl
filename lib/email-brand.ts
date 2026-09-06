const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://kvisl.com').replace(/\/$/, '');

export const KVISL_NEWSLETTER_FROM = 'Kvisl <newsletter@kvisl.com>';
export const KVISL_REPLY_TO = 'distributary@kvisl.com';
export const KVISL_LIST_ID = 'Kvisl Newsletter <newsletter.kvisl.com>';

export function escapeEmailHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function brandedEmailHtml({
  preheader,
  eyebrow,
  title,
  bodyHtml,
  unsubscribeUrl
}: {
  preheader: string;
  eyebrow?: string;
  title: string;
  bodyHtml: string;
  unsubscribeUrl: string;
}) {
  const year = new Date().getUTCFullYear();
  const logoUrl = `${siteUrl}/kvisl-wordmark.svg`;
  const safePreheader = escapeEmailHtml(preheader);
  const safeEyebrow = eyebrow ? escapeEmailHtml(eyebrow) : '';
  const safeTitle = escapeEmailHtml(title);
  const safeUnsubscribe = escapeEmailHtml(unsubscribeUrl);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title>${safeTitle}</title></head><body style="margin:0;background-color:#ffffff;color:#161616;"><span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">${safePreheader}</span><table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td bgcolor="#ffffff" style="background-color:#ffffff;padding-top:38px;padding-right:20px;padding-bottom:38px;padding-left:20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:600px;margin-left:auto;margin-right:auto;"><tr><td style="padding-bottom:34px;"><table cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td width="38" height="38" bgcolor="#111111" align="center" valign="middle" style="width:38px;height:38px;background-color:#111111;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:38px;color:#ffffff;text-align:center;">K</td><td width="14" style="width:14px;font-size:1px;line-height:1px;">&nbsp;</td><td valign="middle"><img src="${logoUrl}" width="154" height="32" border="0" alt="Kvisl" style="width:154px;height:32px;display:block;border:0;outline:none;text-decoration:none;color:#111111;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:32px;"></td></tr></table></td></tr>${safeEyebrow ? `<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:#6d6d6d;letter-spacing:1.4px;text-transform:uppercase;padding-bottom:11px;">${safeEyebrow}</td></tr>` : ''}<tr><td style="font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:43px;color:#161616;font-weight:400;padding-bottom:18px;">${safeTitle}</td></tr><tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;color:#333333;padding-bottom:34px;">${bodyHtml}</td></tr><tr><td style="border-top-width:1px;border-top-style:solid;border-top-color:#d9d9d9;padding-top:18px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;color:#777777;"><strong style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;color:#444444;font-weight:600;">Sparking Thought, Growing Wild.</strong><br>© ${year} Kvisl. All rights reserved.<br><a href="${siteUrl}" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;color:#555555;text-decoration:underline;">kvisl.com</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="mailto:${KVISL_REPLY_TO}" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;color:#555555;text-decoration:underline;">Contact</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${safeUnsubscribe}" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;color:#555555;text-decoration:underline;">Unsubscribe</a></td></tr></table></td></tr></table></body></html>`;
}

export function brandedEmailText(content: string, unsubscribeUrl: string) {
  const year = new Date().getUTCFullYear();
  return `${content}\n\nSparking Thought, Growing Wild.\n© ${year} Kvisl. All rights reserved.\nhttps://kvisl.com\nContact: ${KVISL_REPLY_TO}\nUnsubscribe: ${unsubscribeUrl}`;
}
