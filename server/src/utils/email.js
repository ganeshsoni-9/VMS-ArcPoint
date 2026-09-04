import nodemailer from "nodemailer";

/**
 * Create SMTP transporter
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // SMTP credentials missing
  if (!user || !pass) {
    console.warn(
      "SMTP credentials not configured. Email notification skipped."
    );
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

/**
 * Generic email sender
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
}) {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      return false;
    }

    const from =
      process.env.SMTP_FROM || process.env.SMTP_USER;

    const info = await transporter.sendMail({
      from: `VMS Architecture Office <${from}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(
      "Email sent successfully:",
      info.messageId
    );

    return true;
  } catch (err) {
    console.error(
      "Failed to send email notification:",
      err.message
    );

    // Email failure should NOT fail approval/rejection
    return false;
  }
}

/**
 * Visitor Approved Email
 */
export async function sendVisitorApprovedEmail({
  visitorEmail,
  visitorName,
  employeeName,
  visitorPassId,
  purpose,
  visitDate,
}) {
  if (!visitorEmail) {
    console.warn(
      "Visitor email not available. Approval email skipped."
    );
    return false;
  }

  const formattedDate = visitDate
    ? new Date(visitDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Today";

  const subject =
    "Your Visit Request has been Approved - VMS";

  /**
   * Plain text email
   */
  const text = `Dear ${visitorName || "Visitor"},

Your request to meet ${
    employeeName || "our team member"
  } has been approved successfully.

Visitor Pass ID: ${visitorPassId || "N/A"}
Purpose of Visit: ${purpose || "N/A"}
Visit Date: ${formattedDate}

Please carry a valid ID and check in with the reception desk upon arrival.

Regards,
VMS - Architecture Office`;

  /**
   * HTML email
   */
  const html = `
    <div style="
      font-family: Arial, Helvetica, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
    ">

      <!-- Header -->
      <div style="
        background-color: #2563eb;
        padding: 22px;
        border-radius: 8px;
        color: #ffffff;
        text-align: center;
        margin-bottom: 24px;
      ">
        <h2 style="
          margin: 0;
          font-size: 22px;
        ">
          Visit Request Approved
        </h2>

        <p style="
          margin: 6px 0 0 0;
          font-size: 13px;
          opacity: 0.9;
        ">
          VMS - Architecture Office
        </p>
      </div>

      <!-- Greeting -->
      <p style="
        color: #374151;
        font-size: 15px;
        margin-bottom: 10px;
      ">
        Dear <strong>${visitorName || "Visitor"}</strong>,
      </p>

      <p style="
        color: #374151;
        font-size: 14px;
        line-height: 1.6;
      ">
        Your request to meet
        <strong>${employeeName || "our team member"}</strong>
        has been approved successfully.
      </p>

      <!-- Visit Details -->
      <div style="
        background-color: #eff6ff;
        border: 1px solid #dbeafe;
        padding: 16px;
        border-radius: 8px;
        margin: 20px 0;
        color: #1f2937;
      ">

        <p style="margin: 7px 0; font-size: 14px;">
          <strong>Visitor Pass ID:</strong>
          <span style="
            font-family: monospace;
            color: #2563eb;
            font-weight: bold;
          ">
            ${visitorPassId || "N/A"}
          </span>
        </p>

        <p style="margin: 7px 0; font-size: 14px;">
          <strong>Employee:</strong>
          ${employeeName || "N/A"}
        </p>

        <p style="margin: 7px 0; font-size: 14px;">
          <strong>Purpose:</strong>
          ${purpose || "N/A"}
        </p>

        <p style="margin: 7px 0; font-size: 14px;">
          <strong>Visit Date:</strong>
          ${formattedDate}
        </p>

      </div>

      <!-- Instruction -->
      <div style="
        background-color: #f0fdf4;
        border: 1px solid #bbf7d0;
        padding: 14px;
        border-radius: 8px;
        margin-bottom: 20px;
      ">

        <p style="
          margin: 0;
          color: #166534;
          font-size: 14px;
          line-height: 1.6;
        ">
          Please carry a valid ID and check in with the
          reception desk upon arrival.
        </p>

      </div>

      <!-- Footer -->
      <hr style="
        border: none;
        border-top: 1px solid #e5e7eb;
        margin: 24px 0;
      " />

      <p style="
        color: #6b7280;
        font-size: 12px;
        line-height: 1.5;
        margin: 0;
      ">
        Regards,<br />
        <strong>VMS - Architecture Office</strong>
      </p>

    </div>
  `;

  return sendEmail({
    to: visitorEmail,
    subject,
    text,
    html,
  });
}

/**
 * Visitor Rejected Email
 */
export async function sendVisitorRejectedEmail({
  visitorEmail,
  visitorName,
  employeeName,
  visitorPassId,
  purpose,
  rejectionReason,
}) {
  if (!visitorEmail) {
    console.warn(
      "Visitor email not available. Rejection email skipped."
    );
    return false;
  }

  const reasonText =
    rejectionReason || "No specific reason was provided.";

  const subject =
    "Your Visit Request could not be Approved - VMS";

  /**
   * Plain text email
   */
  const text = `Dear ${visitorName || "Visitor"},

We regret to inform you that your request to meet ${
    employeeName || "our team member"
  } could not be approved.

Visitor Pass ID: ${visitorPassId || "N/A"}
Purpose of Visit: ${purpose || "N/A"}
Reason: ${reasonText}

Please contact the reception desk if you would like to reschedule your visit.

Regards,
VMS - Architecture Office`;

  /**
   * HTML email
   */
  const html = `
    <div style="
      font-family: Arial, Helvetica, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
    ">

      <!-- Header -->
      <div style="
        background-color: #dc2626;
        padding: 22px;
        border-radius: 8px;
        color: #ffffff;
        text-align: center;
        margin-bottom: 24px;
      ">
        <h2 style="
          margin: 0;
          font-size: 22px;
        ">
          Visit Request Not Approved
        </h2>

        <p style="
          margin: 6px 0 0 0;
          font-size: 13px;
          opacity: 0.9;
        ">
          VMS - Architecture Office
        </p>
      </div>

      <!-- Greeting -->
      <p style="
        color: #374151;
        font-size: 15px;
        margin-bottom: 10px;
      ">
        Dear <strong>${visitorName || "Visitor"}</strong>,
      </p>

      <p style="
        color: #374151;
        font-size: 14px;
        line-height: 1.6;
      ">
        We regret to inform you that your request to meet
        <strong>${employeeName || "our team member"}</strong>
        could not be approved.
      </p>

      <!-- Visit Details -->
      <div style="
        background-color: #fef2f2;
        border: 1px solid #fecaca;
        padding: 16px;
        border-radius: 8px;
        margin: 20px 0;
        color: #991b1b;
      ">

        <p style="
          margin: 7px 0;
          font-size: 14px;
        ">
          <strong>Visitor Pass ID:</strong>
          <span style="
            font-family: monospace;
            font-weight: bold;
          ">
            ${visitorPassId || "N/A"}
          </span>
        </p>

        <p style="
          margin: 7px 0;
          font-size: 14px;
        ">
          <strong>Employee:</strong>
          ${employeeName || "N/A"}
        </p>

        <p style="
          margin: 7px 0;
          font-size: 14px;
        ">
          <strong>Purpose:</strong>
          ${purpose || "N/A"}
        </p>

        <p style="
          margin: 7px 0;
          font-size: 14px;
        ">
          <strong>Reason:</strong>
          ${reasonText}
        </p>

      </div>

      <!-- Reschedule Message -->
      <div style="
        background-color: #f9fafb;
        border: 1px solid #e5e7eb;
        padding: 14px;
        border-radius: 8px;
        margin-bottom: 20px;
      ">

        <p style="
          margin: 0;
          color: #374151;
          font-size: 14px;
          line-height: 1.6;
        ">
          Please contact the reception desk if you would
          like to reschedule your visit.
        </p>

      </div>

      <!-- Footer -->
      <hr style="
        border: none;
        border-top: 1px solid #e5e7eb;
        margin: 24px 0;
      " />

      <p style="
        color: #6b7280;
        font-size: 12px;
        line-height: 1.5;
        margin: 0;
      ">
        Regards,<br />
        <strong>VMS - Architecture Office</strong>
      </p>

    </div>
  `;

  return sendEmail({
    to: visitorEmail,
    subject,
    text,
    html,
  });
}