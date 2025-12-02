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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: WebhookPayload = await req.json();

    // Only process INSERT events for booking_inquiries table
    if (payload.type !== 'INSERT' || payload.table !== 'booking_inquiries') {
      return new Response('Skipped - not a booking inquiry insert', {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const inquiry = payload.record;
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

    // Get lead info if available
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let leadInfo = '';
    let leadId = inquiry.lead_id;

    // If no lead_id provided, look up by email
    if (!leadId && inquiry.email) {
      const { data: leadByEmail } = await supabase
        .from('leads')
        .select('id, country, preferences')
        .eq('email', inquiry.email)
        .eq('site', inquiry.site)
        .single();

      if (leadByEmail) {
        leadId = leadByEmail.id;
        leadInfo = `
Country: ${leadByEmail.country || 'Not provided'}
Previous Interest: ${leadByEmail.preferences?.interest_summary || 'None'}`;
      } else {
        // No lead exists - create one from the booking inquiry
        console.log('Creating new lead from booking inquiry:', inquiry.email);

        const { data: newLead, error: leadError } = await supabase
          .from('leads')
          .insert({
            email: inquiry.email,
            name: inquiry.name,
            phone: inquiry.phone,
            source: 'liv_chat',
            status: 'new',
            site: inquiry.site,
            preferences: {
              travel_dates_start: inquiry.travel_dates_start,
              travel_dates_end: inquiry.travel_dates_end,
              group_size: inquiry.group_size,
              budget_range: inquiry.budget_range,
              destinations_of_interest: inquiry.destinations_of_interest,
              themes_of_interest: inquiry.themes_of_interest,
              special_requests: inquiry.special_requests
            }
          })
          .select('id')
          .single();

        if (leadError) {
          console.error('Error creating lead:', leadError);
        } else if (newLead) {
          leadId = newLead.id;
          leadInfo = '\n🆕 New lead created from this booking inquiry';
          console.log('✅ New lead created:', leadId);
        }
      }
    } else if (leadId) {
      const { data: lead } = await supabase
        .from('leads')
        .select('country, preferences')
        .eq('id', leadId)
        .single();

      if (lead) {
        leadInfo = `
Country: ${lead.country || 'Not provided'}
Previous Interest: ${lead.preferences?.interest_summary || 'None'}`;
      }
    }

    // Update booking inquiry with lead_id if we have one
    if (leadId && !inquiry.lead_id) {
      await supabase
        .from('booking_inquiries')
        .update({ lead_id: leadId })
        .eq('id', inquiry.id);
    }

    // Format dates
    const formatDate = (dateStr?: string) => {
      if (!dateStr) return 'Not specified';
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Create email subject based on site
    const siteLabel = inquiry.site === 'sweden' ? 'Luxury Travel Sweden' : 'Agent Henrik';
    const subject = `📋 New Booking Inquiry from ${siteLabel} - ${inquiry.name || inquiry.email}`;

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
    .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #22c55e; }
    .info-row { display: flex; margin-bottom: 12px; }
    .info-label { font-weight: 600; min-width: 140px; color: #666; }
    .info-value { color: #333; flex: 1; }
    .trip-details { background: #dbeafe; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 4px solid #3b82f6; }
    .trip-details h3 { margin-top: 0; color: #1e40af; }
    .special-requests { background: #fef3c7; padding: 15px; border-radius: 6px; margin-top: 15px; border-left: 4px solid #f59e0b; }
    .special-requests pre { margin: 0; white-space: pre-wrap; font-size: 13px; }
    .footer { text-align: center; color: #666; font-size: 13px; margin-top: 20px; }
    .cta-button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; margin: 2px; }
    .badge-destination { background: #dbeafe; color: #1e40af; }
    .badge-theme { background: #fce7f3; color: #be185d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 New Booking Inquiry</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">From ${siteLabel}</p>
    </div>
    <div class="content">
      <div class="info-box">
        <h2 style="margin-top: 0; color: #22c55e;">Contact Information</h2>
        <div class="info-row">
          <div class="info-label">Name:</div>
          <div class="info-value">${inquiry.name || 'Not provided'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Email:</div>
          <div class="info-value"><a href="mailto:${inquiry.email}">${inquiry.email}</a></div>
        </div>
        <div class="info-row">
          <div class="info-label">Phone:</div>
          <div class="info-value">${inquiry.phone || 'Not provided'}</div>
        </div>
        ${leadInfo ? `<div class="info-row">
          <div class="info-label">Lead Info:</div>
          <div class="info-value"><pre style="margin: 0; font-size: 13px;">${leadInfo}</pre></div>
        </div>` : ''}
        <div class="info-row">
          <div class="info-label">Inquiry ID:</div>
          <div class="info-value" style="font-family: monospace; font-size: 12px;">${inquiry.id}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Submitted:</div>
          <div class="info-value">${new Date(inquiry.created_at).toLocaleString('en-US', { timeZone: 'Europe/Stockholm', dateStyle: 'medium', timeStyle: 'short' })} CET</div>
        </div>
      </div>

      <div class="trip-details">
        <h3>Trip Details</h3>
        <div class="info-row">
          <div class="info-label">Travel Dates:</div>
          <div class="info-value">${formatDate(inquiry.travel_dates_start)} - ${formatDate(inquiry.travel_dates_end)}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Group Size:</div>
          <div class="info-value">${inquiry.group_size || 'Not specified'} ${inquiry.group_size === 1 ? 'person' : 'people'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Budget Range:</div>
          <div class="info-value">${inquiry.budget_range || 'Not specified'}</div>
        </div>
        ${inquiry.destinations_of_interest?.length ? `
        <div class="info-row">
          <div class="info-label">Destinations:</div>
          <div class="info-value">
            ${inquiry.destinations_of_interest.map(d => `<span class="badge badge-destination">${d}</span>`).join('')}
          </div>
        </div>` : ''}
        ${inquiry.themes_of_interest?.length ? `
        <div class="info-row">
          <div class="info-label">Themes:</div>
          <div class="info-value">
            ${inquiry.themes_of_interest.map(t => `<span class="badge badge-theme">${t}</span>`).join('')}
          </div>
        </div>` : ''}
      </div>

      ${inquiry.special_requests || inquiry.itinerary_summary ? `
      <div class="special-requests">
        <h3 style="margin-top: 0; color: #b45309;">Special Requests & Details</h3>
        ${inquiry.special_requests ? `<div style="margin-bottom: 10px;"><strong>Special Requests:</strong><br>${inquiry.special_requests}</div>` : ''}
        ${inquiry.itinerary_summary ? `<div><strong>Itinerary Summary:</strong><br>${inquiry.itinerary_summary}</div>` : ''}
      </div>` : ''}

      <div style="text-align: center;">
        <a href="https://app.supabase.com/project/fjnfsabvuiyzuzfhxzcc/editor" class="cta-button">
          View in Supabase Dashboard →
        </a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated notification from ${siteLabel} contact form.</p>
      <p style="color: #999; font-size: 11px;">You'll receive this email every time someone submits a booking inquiry, even if they're an existing lead.</p>
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
    console.log('✅ Booking inquiry email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailResult.id,
        inquiry: inquiry.email
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in notify-booking-inquiry function:', error);
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
