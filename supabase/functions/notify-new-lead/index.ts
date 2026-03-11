import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Lead {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  country?: string;
  source: string;
  preferences?: any;
  created_at: string;
  site: string;
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: Lead;
  schema: string;
  old_record: null | Lead;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: WebhookPayload = await req.json();

    // Only process INSERT events on the leads table
    if (payload.type !== 'INSERT' || payload.table !== 'leads') {
      return new Response('Skipped', { status: 200, headers: corsHeaders });
    }

    const lead = payload.record;

    // Newsletter signups get a different confirmation — skip here
    if (lead.source === 'newsletter') {
      return new Response('Skipped - newsletter handled separately', { status: 200, headers: corsHeaders });
    }

    // Contact form and LIV chat leads always create a booking_inquiry too —
    // notify-booking-inquiry handles emails for those. Skip to avoid duplicates.
    if (lead.source === 'contact-form' || lead.source === 'liv_chat') {
      return new Response('Skipped - handled by notify-booking-inquiry', { status: 200, headers: corsHeaders });
    }

    // Belt-and-suspenders: also check the preferences flag
    // (may not survive the row_to_json → jsonb_build_object → http_post pipeline)
    if (lead.preferences?.created_from_booking_inquiry) {
      return new Response('Skipped - booking inquiry lead', { status: 200, headers: corsHeaders });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response('Email service not configured', { status: 500 });
    }

    const isSweden = lead.site === 'sweden';
    const brandName = isSweden ? 'Luxury Travel Sweden' : 'Agent Henrik';
    const fromAddress = isSweden
      ? 'LIV Concierge <liv@luxurytravelsweden.com>'
      : 'Agent Henrik <hello@agenthenrik.com>';
    const whatsapp = isSweden
      ? { href: 'https://wa.me/46703872264', label: '+46 (0)70 387 2264' }
      : { href: 'https://wa.me/491603872264', label: '+49 160 387 2264' };
    const website = isSweden ? 'luxurytravelsweden.com' : 'agenthenrik.com';
    const siteUrl = isSweden ? 'https://luxurytravelsweden.com' : 'https://agenthenrik.com';

    const firstName = lead.name?.split(' ')[0] || null;
    const greeting = firstName ? `Dear ${firstName},` : 'Dear traveller,';

    // On-brand visitor confirmation email
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

          <!-- Logo -->
          <tr>
            <td style="padding:0 0 40px 0;text-align:center;border-bottom:1px solid rgba(255,255,255,0.08);">
              <a href="${siteUrl}" style="text-decoration:none;">
                <p style="margin:0;font-family:Georgia,serif;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(243,245,246,0.45);">
                  ${brandName.toUpperCase()}
                </p>
              </a>
            </td>
          </tr>

          <!-- Body -->
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
                <a href="${whatsapp.href}" style="font-family:Georgia,serif;font-size:15px;color:#f3f5f6;text-decoration:underline;">${whatsapp.label}</a>
              </p>
              <p style="margin:0;font-size:15px;line-height:1.9;color:rgba(243,245,246,0.9);font-style:italic;">
                With warmth,<br />LIV
              </p>
            </td>
          </tr>

          <!-- Footer -->
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
        to: [lead.email],
        subject: `Your enquiry — ${brandName}`,
        html: visitorHtml,
      }),
    });

    if (!visitorRes.ok) {
      const err = await visitorRes.text();
      console.error('Visitor email error:', err);
    } else {
      const result = await visitorRes.json();
      console.log('✅ Visitor confirmation sent:', result.id, '→', lead.email);
    }

    return new Response(
      JSON.stringify({ success: true, lead: lead.email }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in notify-new-lead:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
