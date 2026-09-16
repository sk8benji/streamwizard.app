import { Resend } from "resend";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, company, phone, callVolume, message, formType = 'demo_request', topic, ticketPriority } = body;

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Name and Email are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    const destEmail = "sk8benji@gmail.com";

    // Is this a Support Ticket or a Demo Request?
    const isSupport = formType === 'support_ticket';
    const emailSubject = isSupport
      ? `[Voice Wizard Support] ${topic || 'General Inquiry'} - ${name}`
      : `[Voice Wizard Demo Request] ${company || name} (${callVolume || 'New Lead'})`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #2563eb; padding-bottom: 16px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">
            VOICE <span style="color: #2563eb;">WIZARD</span>
          </h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">
            ${isSupport ? 'Customer Support Center Notification' : 'New Inbound Demo & Sales Inquiry'}
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0; width: 35%; color: #334155;">Full Name:</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; color: #0f172a; font-weight: 600;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0; color: #334155;">Email:</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${email}</a></td>
          </tr>
          ${company ? `
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0; color: #334155;">Company / Agency:</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; color: #0f172a;">${company}</td>
          </tr>` : ''}
          ${phone ? `
          <tr>
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0; color: #334155;">Phone:</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;"><a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a></td>
          </tr>` : ''}
          ${callVolume ? `
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0; color: #334155;">Estimated Calls:</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #7c3aed;">${callVolume}</td>
          </tr>` : ''}
          ${topic ? `
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0; color: #334155;">Support Topic:</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #0284c7;">${topic}</td>
          </tr>` : ''}
          ${ticketPriority ? `
          <tr>
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0; color: #334155;">Priority:</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; color: #dc2626; font-weight: bold;">${ticketPriority}</td>
          </tr>` : ''}
        </table>

        ${message ? `
        <div style="margin-top: 24px;">
          <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 14px;">Inquiry / Message Details:</h4>
          <div style="padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc; color: #334155; line-height: 1.6; font-size: 14px; white-space: pre-wrap;">${message}</div>
        </div>` : ''}

        <div style="margin-top: 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          Stream Wizard Notification Engine &bull; Direct submission to <strong>info@streamwizard.app</strong>
        </div>
      </div>
    `;

    if (!apiKey) {
      console.warn("RESEND_API_KEY is not set. Simulating email send in dev mode.");
      return new Response(
        JSON.stringify({ 
          success: true, 
          mock: true, 
          message: "Inquiry received (Simulation Mode). Routed to info@streamwizard.app." 
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(apiKey);
    const fromEmail = process.env.RESEND_FROM || "Stream Wizard <onboarding@resend.dev>";
    const result = await resend.emails.send({
      from: fromEmail,
      to: destEmail,
      subject: emailSubject,
      html: htmlContent,
      replyTo: email
    });

    if (result.error) {
      console.error("Resend API Error:", result.error);
      return new Response(
        JSON.stringify({ error: result.error.message || "Failed to send email." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: result.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("API Error in send-email:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
