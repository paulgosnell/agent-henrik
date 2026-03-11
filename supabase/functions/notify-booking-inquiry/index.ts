import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingInquiry {
  id: string;
  lead_id?: string;
  email: string;
  name?: string;
  phone?: string;
  travel_dates_start?: string;
  travel_dates_end?: string;
  group_size?: number;
  budget_range?: string;
  destinations_of_interest?: string[];
  themes_of_interest?: string[];
  special_requests?: string;
  itinerary_summary?: string;
  status: string;
  created_at: string;
  site: string;
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: BookingInquiry;
  schema: string;
  old_record: null | BookingInquiry;
}

/** Convert raw "user: ...\nassistant: ..." transcript into readable HTML */
function formatTranscript(raw: string): string {
  if (!raw) return '';

  // If it doesn't look like a transcript (no "user:" or "assistant:"), return as-is
  if (!raw.includes('user:') && !raw.includes('assistant:')) {
    return raw.replace(/\n/g, '<br />');
  }

  // Split on message boundaries
  const lines = raw.split(/\n(?=user:|assistant:)/);
  const parts: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('user:')) {
      const content = trimmed.replace(/^user:\s*/, '').replace(/\n/g, '<br />');
      parts.push(`<div style="margin:0 0 10px 0;">
        <span style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#999;font-weight:600;">Guest</span>
        <p style="margin:4px 0 0 0;padding:10px 14px;background:#f0f4ff;border-radius:6px;font-size:13px;line-height:1.6;color:#1a1a2e;">${content}</p>
      </div>`);
    } else if (trimmed.startsWith('assistant:')) {
      const content = trimmed.replace(/^assistant:\s*/, '').replace(/\n/g, '<br />');
      parts.push(`<div style="margin:0 0 10px 0;">
        <span style="font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#999;font-weight:600;">LIV</span>
        <p style="margin:4px 0 0 0;padding:10px 14px;background:#fff;border:1px solid #e8e8e8;border-radius:6px;font-size:13px;line-height:1.6;color:#333;">${content}</p>
      </div>`);
    }
  }

  return parts.join('');
}

function row(label: string, value: string | number | null | undefined): string {
  if (!value && value !== 0) return '';
  return `<tr>
    <td style="padding:8px 12px 8px 0;font-size:12px;color:#888;white-space:nowrap;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;font-size:14px;color:#1a1a2e;font-weight:500;">${value}</td>
  </tr>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: WebhookPayload = await req.json();

    if (payload.type !== 'INSERT' || payload.table !== 'booking_inquiries') {
      return new Response('Skipped', { status: 200, headers: corsHeaders });
    }

    const inquiry = payload.record;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const adminEmail = Deno.env.get('ADMIN_EMAIL');

    if (!resendApiKey || !adminEmail) {
      console.error('Missing RESEND_API_KEY or ADMIN_EMAIL');
      return new Response('Email service not configured', { status: 500 });
    }

    // Ensure there's a lead record for this visitor
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let leadId = inquiry.lead_id;

    if (!leadId && inquiry.email) {
      const { data: existing } = await supabase
        .from('leads')
        .select('id')
        .eq('email', inquiry.email)
        .single();

      if (existing) {
        leadId = existing.id;
      } else {
        // Create a lead — flag it so notify-new-lead skips the visitor email
        // (we send it ourselves below)
        const { data: newLead } = await supabase
          .from('leads')
          .insert({
            email: inquiry.email,
            name: inquiry.name,
            phone: inquiry.phone,
            source: 'contact_form',
            status: 'new',
            site: inquiry.site || 'sweden',
            preferences: { created_from_booking_inquiry: true },
          })
          .select('id')
          .single();

        if (newLead) leadId = newLead.id;
      }
    }

    // Update booking inquiry with lead_id if we now have one
    if (leadId && !inquiry.lead_id) {
      await supabase
        .from('booking_inquiries')
        .update({ lead_id: leadId })
        .eq('id', inquiry.id);
    }

    // Site-aware config
    const isSweden = (inquiry.site || 'sweden') === 'sweden';
    const brandName = isSweden ? 'Luxury Travel Sweden' : 'Agent Henrik';
    const fromAddress = isSweden
      ? 'LIV Concierge <liv@luxurytravelsweden.com>'
      : 'Agent Henrik <hello@agenthenrik.com>';
    const whatsappHref = `https://wa.me/${inquiry.phone?.replace(/\D/g, '') || '46703872264'}`;
    const replyToEmail = inquiry.email;

    // Determine if this came from LIV chat or the contact form
    const isLivChat = inquiry.special_requests?.includes('user:') || inquiry.special_requests?.includes('assistant:');
    const source = isLivChat ? 'LIV Chat' : 'Contact Form';

    const submittedAt = new Date(inquiry.created_at).toLocaleString('en-GB', {
      timeZone: 'Europe/Stockholm',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Build the Henrik notification email
    const adminHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New Booking Enquiry — ${brandName}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0f1114;padding:24px 32px;border-radius:8px 8px 0 0;">
              <p style="margin:0;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.4);font-family:Georgia,serif;">
                ${brandName}
              </p>
              <h1 style="margin:8px 0 0 0;font-size:20px;font-weight:400;color:#f3f5f6;font-family:Georgia,serif;">
                New Booking Enquiry
              </h1>
              <p style="margin:6px 0 0 0;font-size:12px;color:rgba(255,255,255,0.4);">
                ${source} &nbsp;·&nbsp; ${submittedAt} CET
              </p>
            </td>
          </tr>

          <!-- Contact details -->
          <tr>
            <td style="background:#fff;padding:28px 32px 20px 32px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
              <p style="margin:0 0 16px 0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#999;">Contact</p>
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                ${row('Name', inquiry.name)}
                ${row('Email', `<a href="mailto:${inquiry.email}" style="color:#1a1a2e;">${inquiry.email}</a>`)}
                ${row('Phone', inquiry.phone ? `<a href="tel:${inquiry.phone}" style="color:#1a1a2e;">${inquiry.phone}</a>` : null)}
              </table>

              <!-- Quick reply buttons -->
              <div style="margin:20px 0 0 0;display:flex;gap:10px;">
                <a href="mailto:${replyToEmail}?subject=Re: Your ${brandName} Enquiry" style="display:inline-block;padding:10px 20px;background:#0f1114;color:#fff;text-decoration:none;border-radius:5px;font-size:13px;font-weight:500;margin-right:10px;">
                  Reply by Email
                </a>
                ${inquiry.phone ? `<a href="${whatsappHref}" style="display:inline-block;padding:10px 20px;background:#25d366;color:#fff;text-decoration:none;border-radius:5px;font-size:13px;font-weight:500;">
                  WhatsApp
                </a>` : ''}
              </div>
            </td>
          </tr>

          ${(inquiry.group_size || inquiry.budget_range || inquiry.travel_dates_start || (inquiry.destinations_of_interest?.length) || (inquiry.themes_of_interest?.length)) ? `
          <!-- Trip details -->
          <tr>
            <td style="background:#fafafa;padding:24px 32px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;border-top:1px solid #f0f0f0;">
              <p style="margin:0 0 16px 0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#999;">Trip Details</p>
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                ${row('Group size', inquiry.group_size ? `${inquiry.group_size} ${inquiry.group_size === 1 ? 'person' : 'people'}` : null)}
                ${row('Budget', inquiry.budget_range)}
                ${row('Dates', inquiry.travel_dates_start ? `${inquiry.travel_dates_start}${inquiry.travel_dates_end ? ' → ' + inquiry.travel_dates_end : ''}` : null)}
                ${row('Destinations', inquiry.destinations_of_interest?.join(', '))}
                ${row('Themes', inquiry.themes_of_interest?.join(', '))}
              </table>
            </td>
          </tr>` : ''}

          ${inquiry.special_requests ? `
          <!-- Conversation / requests -->
          <tr>
            <td style="background:#fff;padding:24px 32px;border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;border-top:1px solid #f0f0f0;">
              <p style="margin:0 0 16px 0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#999;">
                ${isLivChat ? 'LIV Conversation' : 'Message'}
              </p>
              ${isLivChat ? formatTranscript(inquiry.special_requests) : `<p style="margin:0;font-size:14px;line-height:1.7;color:#333;">${inquiry.special_requests.replace(/\n/g, '<br />')}</p>`}
            </td>
          </tr>` : ''}

          <!-- Footer -->
          <tr>
            <td style="background:#f0f0f0;padding:16px 32px;border-radius:0 0 8px 8px;border:1px solid #e8e8e8;border-top:none;">
              <p style="margin:0;font-size:11px;color:#aaa;text-align:center;">
                Lead ID: ${inquiry.id}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const adminRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [adminEmail],
        reply_to: replyToEmail,
        subject: `Enquiry from ${inquiry.name || inquiry.email} — ${brandName}`,
        html: adminHtml,
      }),
    });

    if (!adminRes.ok) {
      const err = await adminRes.text();
      console.error('Admin email error:', err);
      throw new Error(`Failed to send admin email: ${err}`);
    }

    const adminResult = await adminRes.json();
    console.log('✅ Henrik notified:', adminResult.id);

    // Visitor confirmation — only send if notify-new-lead won't (i.e. lead was
    // just created from this inquiry, flagged with created_from_booking_inquiry)
    // For LIV chat leads the lead already existed, so notify-new-lead handles the
    // visitor email. Only send here for brand-new leads from contact form.
    const firstName = inquiry.name?.split(' ')[0] || null;
    const greeting = firstName ? `Dear ${firstName},` : 'Dear traveller,';

    const siteUrl = isSweden ? 'https://luxurytravelsweden.com' : 'https://agenthenrik.com';
    const website = isSweden ? 'luxurytravelsweden.com' : 'agenthenrik.com';
    const whatsappLabel = isSweden ? '+46 (0)70 387 2264' : '+49 160 387 2264';
    const whatsappLink = isSweden ? 'https://wa.me/46703872264' : 'https://wa.me/491603872264';

    const visitorHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${brandName}</title>
</head>
<body style="margin:0;padding:0;background:#0f1114;font-family:Georgia,'Times New Roman',serif;color:#f3f5f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1114;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <tr>
            <td style="padding:0 0 40px 0;text-align:center;border-bottom:1px solid rgba(255,255,255,0.08);">
              <a href="${siteUrl}" style="text-decoration:none;">
                <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(243,245,246,0.45);">
                  ${brandName.toUpperCase()}
                </p>
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:48px 0 40px 0;">
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.9;color:rgba(243,245,246,0.9);">${greeting}</p>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.9;color:rgba(243,245,246,0.9);">
                Thank you for reaching out. Your enquiry has been received and one of our curators will be in touch within 24 hours with next steps.
              </p>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.9;color:rgba(243,245,246,0.9);">
                For anything urgent, you are welcome to reach us directly on WhatsApp:
              </p>
              <p style="margin:0 0 40px 0;">
                <a href="${whatsappLink}" style="font-family:Georgia,serif;font-size:15px;color:#f3f5f6;text-decoration:underline;">${whatsappLabel}</a>
              </p>
              <p style="margin:0;font-size:15px;line-height:1.9;color:rgba(243,245,246,0.9);font-style:italic;">
                With warmth,<br />LIV
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 0 0 0;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
              <p style="margin:0 0 6px 0;font-family:Georgia,serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(243,245,246,0.25);">
                ${brandName}
              </p>
              <p style="margin:0;font-size:11px;color:rgba(243,245,246,0.2);">
                <a href="${siteUrl}" style="color:rgba(243,245,246,0.25);text-decoration:none;">${website}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const visitorRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [inquiry.email],
        subject: `Your enquiry — ${brandName}`,
        html: visitorHtml,
      }),
    });

    if (!visitorRes.ok) {
      const err = await visitorRes.text();
      console.error('Visitor email error (non-fatal):', err);
    } else {
      const visitorResult = await visitorRes.json();
      console.log('✅ Visitor confirmation sent:', visitorResult.id, '→', inquiry.email);
    }

    return new Response(
      JSON.stringify({ success: true, adminEmailId: adminResult.id, inquiry: inquiry.email }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in notify-booking-inquiry:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
