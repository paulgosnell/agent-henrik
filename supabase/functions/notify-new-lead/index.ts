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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: WebhookPayload = await req.json();

    // Only process INSERT events for leads table
    if (payload.type !== 'INSERT' || payload.table !== 'leads') {
      return new Response('Skipped - not a lead insert', {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const lead = payload.record;

    // Skip contact_form leads - they get booking inquiry email instead
    if (lead.source === 'contact_form') {
      return new Response('Skipped - contact form leads get booking inquiry email', {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const adminEmail = Deno.env.get('ADMIN_EMAIL');

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response('Email service not configured', { status: 500 });
    }

    if (!adminEmail) {
      console.error('ADMIN_EMAIL not configured');
      return new Response('Admin email not configured', { status: 500 });
    }

    // Format preferences for email
    let preferencesText = 'No preferences captured';
    if (lead.preferences) {
      const prefs = lead.preferences;
      preferencesText = `
Interest: ${prefs.interest_summary || 'General inquiry'}

${prefs.travel_details ? `Travel Details:
- Number of people: ${prefs.travel_details.people || 'N/A'}
- Budget: ${prefs.travel_details.budget || 'N/A'}
- Ideal Dates & Duration: ${prefs.travel_details.dates || 'N/A'}

` : ''}${prefs.chat_context ? `Context:
- Type: ${prefs.chat_context.type}
- ${prefs.chat_context.name ? `Name: ${prefs.chat_context.name}` : ''}
- ${prefs.chat_context.category ? `Category: ${prefs.chat_context.category}` : ''}
- ${prefs.chat_context.themes?.length ? `Themes: ${prefs.chat_context.themes.join(', ')}` : ''}
- ${prefs.chat_context.location ? `Location: ${prefs.chat_context.location}` : ''}
` : ''}

${prefs.storyteller_inquiry ? `Storyteller Inquiry:
- Topic: ${prefs.storyteller_inquiry.topic || 'N/A'}
- Activity: ${prefs.storyteller_inquiry.activity_type || 'N/A'}
- Type: ${prefs.storyteller_inquiry.inquiry_type || 'N/A'}
- Group Size: ${prefs.storyteller_inquiry.group_size || 'N/A'}
- Dates: ${prefs.storyteller_inquiry.preferred_dates || 'N/A'}
- Budget: ${prefs.storyteller_inquiry.budget_range || 'N/A'}
` : ''}`;
    }

    // Create email subject based on site and source
    const siteLabel = lead.site === 'sweden' ? 'Luxury Travel Sweden' : 'Agent Henrik';
    const subject = `🆕 New Lead from ${siteLabel} - ${lead.name || lead.email}`;

    // Send email via Resend
    // TODO: For production, verify luxurytravelsweden.com domain in Resend and update to:
    // from: 'LIV Notifications <notifications@luxurytravelsweden.com>'
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LIV Notifications <onboarding@resend.dev>',
        to: [adminEmail],
        subject: subject,
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea; }
    .info-row { display: flex; margin-bottom: 12px; }
    .info-label { font-weight: 600; min-width: 120px; color: #666; }
    .info-value { color: #333; }
    .preferences { background: #fff3cd; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 4px solid #ffc107; }
    .preferences pre { margin: 0; white-space: pre-wrap; font-size: 13px; }
    .footer { text-align: center; color: #666; font-size: 13px; margin-top: 20px; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🆕 New Lead Captured</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">From ${siteLabel}</p>
    </div>
    <div class="content">
      <div class="info-box">
        <h2 style="margin-top: 0; color: #667eea;">Contact Information</h2>
        <div class="info-row">
          <div class="info-label">Name:</div>
          <div class="info-value">${lead.name || 'Not provided'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Email:</div>
          <div class="info-value"><a href="mailto:${lead.email}">${lead.email}</a></div>
        </div>
        <div class="info-row">
          <div class="info-label">Phone:</div>
          <div class="info-value">${lead.phone || 'Not provided'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Country:</div>
          <div class="info-value">${lead.country || 'Not provided'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Source:</div>
          <div class="info-value">${lead.source}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Lead ID:</div>
          <div class="info-value" style="font-family: monospace; font-size: 12px;">${lead.id}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Created:</div>
          <div class="info-value">${new Date(lead.created_at).toLocaleString('en-US', { timeZone: 'Europe/Stockholm', dateStyle: 'medium', timeStyle: 'short' })} CET</div>
        </div>
      </div>

      <div class="preferences">
        <h3 style="margin-top: 0; color: #856404;">Travel Preferences & Context</h3>
        <pre>${preferencesText}</pre>
      </div>

      <div style="text-align: center;">
        <a href="https://luxurytravelsweden.com/admin/leads.html" class="cta-button">
          View in CMS Dashboard →
        </a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated notification from ${siteLabel} CRM.</p>
      <p style="color: #999; font-size: 11px;">Lead notifications are sent in real-time when visitors provide their contact information.</p>
    </div>
  </div>
</body>
</html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log('✅ Admin email sent successfully:', emailResult);

    // Send confirmation email to the visitor
    // TODO: For production, update to: from: 'LIV <noreply@luxurytravelsweden.com>'
    const visitorEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LIV <onboarding@resend.dev>',
        to: [lead.email],
        subject: 'Thank you for your message',
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.8;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .content {
      background: #ffffff;
      padding: 0;
    }
    .content p {
      margin: 0 0 20px 0;
      font-size: 16px;
      line-height: 1.8;
      color: #333;
    }
    .whatsapp {
      color: #1a1a1a;
      text-decoration: none;
      font-weight: 600;
    }
    .signature {
      margin-top: 30px;
      font-style: italic;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>We truly appreciate you reaching out. Your request has been received, and one of our curators will respond within 24 hours.</p>

      <p>For urgent matters, please contact us on WhatsApp at <a href="https://wa.me/46703872264" class="whatsapp">+46 (0)70 387 2264</a>.</p>

      <p class="signature">Kind regards,<br>LIV</p>
    </div>
  </div>
</body>
</html>
        `,
      }),
    });

    if (!visitorEmailResponse.ok) {
      const errorText = await visitorEmailResponse.text();
      console.error('Visitor email error:', errorText);
      // Don't throw - admin email was successful, just log the visitor email error
    } else {
      const visitorEmailResult = await visitorEmailResponse.json();
      console.log('✅ Visitor confirmation email sent:', visitorEmailResult);
    }

    return new Response(
      JSON.stringify({
        success: true,
        adminEmailId: emailResult.id,
        lead: lead.email
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in notify-new-lead function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
