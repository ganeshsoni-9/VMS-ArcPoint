import nodemailer from "nodemailer";

function createTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendEmail({ to, subject, text, html }) {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn("SMTP credentials not configured in environment variables. Email notification skipped.");
      return false;
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const info = await transporter.sendMail({
      from: `VMS Architecture Office <${from}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent successfully: %s", info.messageId);
    return true;
  } catch (err) {
    console.error("Failed to send email notification:", err.message);
    // Never throw error to caller - email failure must NOT fail approval/rejection operations
    return false;
  }
}

export async function sendVisitorApprovedEmail({
  employeeEmail,
  employeeName,
  visitorName,
  visitorPassId,
  purpose,
  visitDate,
}) {
  if (!employeeEmail) return;

  const subject = "Visitor Request Approved - VMS";
  const formattedDate = visitDate ? new Date(visitDate).toLocaleDateString() : "Today";

  const text = `Hello ${employeeName || "Employee"},

The visitor request for ${visitorName} has been approved successfully.
Visitor Pass ID: ${visitorPassId}
Purpose of Visit: ${purpose || "N/A"}
Visit Date: ${formattedDate}

The visitor can now be checked in by the receptionist upon arrival.

Regards,
VMS - Architecture Office`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded-radius: 8px;">
      <div style="background-color: #2563eb; padding: 16px; border-radius: 6px; color: #ffffff; text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 20px;">Visitor Request Approved</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">VMS - Architecture Office</p>
      </div>
      <p style="color: #374151; font-size: 15px;">Hello <strong>${employeeName || "Employee"}</strong>,</p>
      <p style="color: #374151; font-size: 14px; line-height: 1.5;">
        The visitor request for <strong>${visitorName}</strong> has been approved successfully.
      </p>
      <div style="background-color: #f3f4f6; padding: 14px; border-radius: 6px; margin: 16px 0; font-size: 14px; color: #1f2937;">
        <p style="margin: 4px 0;"><strong>Visitor Pass ID:</strong> <span style="font-family: monospace; color: #2563eb;">${visitorPassId}</span></p>
        <p style="margin: 4px 0;"><strong>Purpose:</strong> ${purpose || "N/A"}</p>
        <p style="margin: 4px 0;"><strong>Visit Date:</strong> ${formattedDate}</p>
      </div>
      <p style="color: #374151; font-size: 14px;">The visitor can now be checked in by the receptionist upon arrival.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #6b7280; font-size: 12px; margin: 0;">Regards,<br /><strong>VMS - Architecture Office</strong></p>
    </div>
  `;

  return sendEmail({ to: employeeEmail, subject, text, html });
}

export async function sendVisitorRejectedEmail({
  employeeEmail,
  employeeName,
  visitorName,
  visitorPassId,
  purpose,
  rejectionReason,
}) {
  if (!employeeEmail) return;

  const subject = "Visitor Request Rejected - VMS";
  const reasonText = rejectionReason || "No specific reason provided.";

  const text = `Hello ${employeeName || "Employee"},

The visitor request for ${visitorName} has been rejected.
Visitor Pass ID: ${visitorPassId}
Purpose of Visit: ${purpose || "N/A"}
Reason: ${reasonText}

Regards,
VMS - Architecture Office`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded-radius: 8px;">
      <div style="background-color: #dc2626; padding: 16px; border-radius: 6px; color: #ffffff; text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 20px;">Visitor Request Rejected</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">VMS - Architecture Office</p>
      </div>
      <p style="color: #374151; font-size: 15px;">Hello <strong>${employeeName || "Employee"}</strong>,</p>
      <p style="color: #374151; font-size: 14px; line-height: 1.5;">
        The visitor request for <strong>${visitorName}</strong> has been rejected.
      </p>
      <div style="background-color: #fef2f2; border: 1px solid #fee2e2; padding: 14px; border-radius: 6px; margin: 16px 0; font-size: 14px; color: #991b1b;">
        <p style="margin: 4px 0;"><strong>Visitor Pass ID:</strong> <span style="font-family: monospace;">${visitorPassId}</span></p>
        <p style="margin: 4px 0;"><strong>Purpose:</strong> ${purpose || "N/A"}</p>
        <p style="margin: 4px 0;"><strong>Reason:</strong> ${reasonText}</p>
      </div>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #6b7280; font-size: 12px; margin: 0;">Regards,<br /><strong>VMS - Architecture Office</strong></p>
    </div>
  `;

  return sendEmail({ to: employeeEmail, subject, text, html });
}
