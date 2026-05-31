import nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const hasSmtp = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

async function sendMail({ to, subject, text, html }) {
  if (hasSmtp()) {
    try {
      const t = createTransporter();
      const info = await t.sendMail({
        from: process.env.SMTP_FROM || `"Berber.al" <${process.env.SMTP_USER}>`,
        to, subject, text, html,
      });
      console.log(`[EMAIL] Sent to ${to} — ${info.messageId}`);
      return { success: true };
    } catch (err) {
      console.error("[EMAIL ERROR]", err);
    }
  }
  console.log("\n═══════════════════════════════════════");
  console.log(`[EMAIL MOCK] To: ${to}`);
  console.log(`[EMAIL MOCK] Subject: ${subject}`);
  console.log(`[EMAIL MOCK] Body:\n${text}`);
  console.log("═══════════════════════════════════════\n");
  return { success: true, mock: true };
}

const LOGO_HTML = `<h1 style="color:#c29545;font-size:1.6rem;margin:0;">Berberi<span style="color:#1e293b;">.al</span></h1>`;

const FOOTER_HTML = `
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #f1f5f9;text-align:center;">
    <p style="font-size:0.8rem;color:#94a3b8;margin:0;">© 2026 Berber.al – Të gjitha të drejtat e rezervuara.</p>
  </div>`;

// ─── 1. OTP Email ──────────────────────────────────────────────────────────────
export async function sendOtpEmail(email, code) {
  return sendMail({
    to: email,
    subject: `Kodi juaj i verifikimit – Berber.al`,
    text: `Kodi juaj: ${code}\nSkadon pas 10 minutash.`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;color:#1e293b;">
      <div style="text-align:center;margin-bottom:24px;">${LOGO_HTML}</div>
      <h2 style="text-align:center;font-size:1.2rem;margin-bottom:8px;">Verifikoni llogarinë tuaj</h2>
      <p style="text-align:center;color:#64748b;margin-bottom:32px;">Futni kodin e mëposhtëm për të vazhduar regjistrimin.</p>
      <div style="background:#f8fafc;border:2px dashed #c29545;border-radius:12px;padding:32px;text-align:center;margin-bottom:24px;">
        <div style="letter-spacing:0.5rem;font-size:2.5rem;font-weight:800;color:#c29545;font-family:monospace;">${code}</div>
        <p style="color:#64748b;font-size:0.85rem;margin-top:12px;margin-bottom:0;">I vlefshëm për <strong>10 minuta</strong></p>
      </div>
      <p style="font-size:0.85rem;color:#94a3b8;text-align:center;margin:0;">Nëse nuk keni kërkuar këtë kod, injoroni këtë mesazh.</p>
      ${FOOTER_HTML}
    </div>`,
  });
}

// ─── 2. Booking Application Email (PENDING) ─────────────────────────────────
export async function sendBookingApplicationEmail(booking) {
  const { client, service, barber, salon, date } = booking;
  if (!client?.email) return false;

  const formattedDate = new Date(date).toLocaleDateString("sq-AL", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const formattedTime = new Date(date).toLocaleTimeString("sq-AL", {
    hour: "2-digit", minute: "2-digit",
  });

  return sendMail({
    to: client.email,
    subject: `Aplikimi juaj u dërgua – ${salon.name}`,
    text: `Përshëndetje ${client.name},\n\nAplikimi juaj për rezervim në "${salon.name}" u regjistrua me sukses!\n\nDetaje:\n- Shërbimi: ${service.name}\n- Berberi: ${barber.name}\n- Data: ${formattedDate}\n- Ora: ${formattedTime}\n\nDo të njoftoheni me email sapo salloni ta konfirmojë rezervimin tuaj.\n\nFaleminderit!\nStafi i ${salon.name}`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;color:#1e293b;">
      <div style="text-align:center;margin-bottom:24px;">${LOGO_HTML}</div>
      
      <div style="background:linear-gradient(135deg,#f8fafc,#f1f5f9);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <div style="font-size:3rem;margin-bottom:12px;">📩</div>
        <h2 style="margin:0 0 8px;color:#1e293b;font-size:1.3rem;">Aplikimi u Dërgua!</h2>
        <p style="color:#64748b;margin:0;font-size:0.95rem;">Prisni konfirmimin nga salloni</p>
      </div>

      <p style="margin-bottom:16px;">Përshëndetje <strong>${client.name}</strong>,</p>
      <p style="color:#475569;line-height:1.6;margin-bottom:24px;">
        Aplikimi juaj për rezervim në sallonin <strong>${salon.name}</strong> u regjistrua me sukses. 
        Do të njoftoheni me email sapo ta konfirmojnë rezervimin tuaj.
      </p>

      <div style="background:#f8fafc;border-left:4px solid #c29545;border-radius:8px;padding:20px;margin-bottom:24px;">
        <h3 style="margin:0 0 16px;color:#1e293b;font-size:1rem;">Detajet e Aplikimit:</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#64748b;width:40%;">✂️ Shërbimi:</td><td style="padding:6px 0;font-weight:600;">${service.name} — <span style="color:#c29545;">${service.price} L</span></td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">💈 Berberi:</td><td style="padding:6px 0;font-weight:600;">${barber.name}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">📅 Data:</td><td style="padding:6px 0;font-weight:600;text-transform:capitalize;">${formattedDate}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">🕐 Ora:</td><td style="padding:6px 0;font-weight:600;">${formattedTime}</td></tr>
        </table>
      </div>

      <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:8px;padding:16px;text-align:center;margin-bottom:24px;">
        <p style="margin:0;color:#92400e;font-size:0.9rem;">⏳ <strong>Statusi:</strong> Në pritje të konfirmimit nga salloni</p>
      </div>

      <p style="color:#64748b;font-size:0.9rem;line-height:1.6;">Faleminderit që zgjodhët <strong>${salon.name}</strong>. Ju mirëpresim!</p>
      ${FOOTER_HTML}
    </div>`,
  });
}

// ─── 3. Booking Confirmation Email (APPROVED) ────────────────────────────────
export async function sendBookingConfirmationEmail(booking) {
  const { client, service, barber, salon, date } = booking;
  if (!client?.email) {
    console.warn("[EMAIL] No client email for booking:", booking.id);
    return false;
  }

  const formattedDate = new Date(date).toLocaleDateString("sq-AL", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const formattedTime = new Date(date).toLocaleTimeString("sq-AL", {
    hour: "2-digit", minute: "2-digit",
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return sendMail({
    to: client.email,
    subject: `✅ Rezervimi u Konfirmua – ${salon.name}`,
    text: `Përshëndetje ${client.name},\n\nRezervimi juaj u konfirmua!\n\n- Shërbimi: ${service.name}\n- Berberi: ${barber.name}\n- Data: ${formattedDate}\n- Ora: ${formattedTime}\n- Çmimi: ${service.price} L\n\nJu mirëpresim!\nStafi i ${salon.name}`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;color:#1e293b;">
      <div style="text-align:center;margin-bottom:24px;">${LOGO_HTML}</div>
      
      <div style="background:linear-gradient(135deg,rgba(16,185,129,0.08),rgba(16,185,129,0.04));border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <div style="font-size:3rem;margin-bottom:12px;">✅</div>
        <h2 style="margin:0 0 8px;color:#065f46;font-size:1.3rem;">Rezervimi u Konfirmua!</h2>
        <p style="color:#047857;margin:0;font-size:0.95rem;font-weight:600;">${salon.name} ju pret</p>
      </div>

      <p style="margin-bottom:16px;">Përshëndetje <strong>${client.name}</strong>,</p>
      <p style="color:#475569;line-height:1.6;margin-bottom:24px;">
        Rezervimi juaj në <strong>${salon.name}</strong> është konfirmuar! Ju keni një takim të planifikuar.
      </p>

      <div style="background:#f8fafc;border-left:4px solid #10b981;border-radius:8px;padding:20px;margin-bottom:24px;">
        <h3 style="margin:0 0 16px;color:#1e293b;font-size:1rem;">Detajet e Rezervimit:</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#64748b;width:40%;">✂️ Shërbimi:</td><td style="padding:8px 0;font-weight:700;">${service.name}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">💈 Berberi:</td><td style="padding:8px 0;font-weight:600;">${barber.name}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">📅 Data:</td><td style="padding:8px 0;font-weight:600;text-transform:capitalize;">${formattedDate}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">🕐 Ora:</td><td style="padding:8px 0;font-weight:700;font-size:1.1rem;color:#1e293b;">${formattedTime}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">💰 Çmimi:</td><td style="padding:8px 0;font-weight:700;color:#c29545;font-size:1.1rem;">${service.price} L</td></tr>
        </table>
      </div>

      <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);border-radius:8px;padding:14px;text-align:center;margin-bottom:24px;">
        <p style="margin:0;color:#065f46;font-size:0.9rem;">📍 <strong>${salon.name}</strong>${salon.address ? ` — ${salon.address}` : ""}</p>
      </div>

      <p style="color:#64748b;font-size:0.9rem;">Faleminderit dhe shihemi së shpejti! 💈</p>
      ${FOOTER_HTML}
    </div>`,
  });
}

// ─── 4. Salon Approval Email ─────────────────────────────────────────────────
export async function sendSalonApprovalEmail(email, salonName) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return sendMail({
    to: email,
    subject: `🎉 Salloni juaj u aprovua! – Berber.al`,
    text: `Salloni "${salonName}" u aprovua! Hyni në dashboard: ${appUrl}/dashboard`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;color:#1e293b;">
      <div style="text-align:center;margin-bottom:24px;">${LOGO_HTML}</div>
      <h2 style="text-align:center;font-size:1.25rem;color:#10b981;margin-bottom:8px;">🎉 Salloni juaj u aprovua!</h2>
      <p style="color:#64748b;line-height:1.6;margin-bottom:24px;text-align:center;">
        Salloni <strong>${salonName}</strong> është aprovuar nga administratori i Berber.al!
      </p>
      <div style="background:#f8fafc;border-radius:8px;padding:20px;border-left:4px solid #10b981;margin-bottom:24px;">
        <p style="margin:0 0 10px;color:#334155;font-size:0.95rem;">Tani mund të hyni në dashboard-in tuaj për të:</p>
        <ul style="margin:0;padding-left:20px;color:#475569;font-size:0.9rem;line-height:2;">
          <li>Konfiguruar oraret e sallonit</li>
          <li>Shtuar stafin dhe shërbimet</li>
          <li>Pranuar dhe menaxhuar rezervimet online</li>
        </ul>
      </div>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${appUrl}/dashboard" style="display:inline-block;background:#c29545;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:0.95rem;box-shadow:0 4px 14px rgba(194,149,69,0.3);">
          Hap Dashboard-in →
        </a>
      </div>
      ${FOOTER_HTML}
    </div>`,
  });
}

// ─── 5. Salon Registration Application Email (PENDING) ──────────────────────────
export async function sendSalonRegistrationEmail(email, ownerName, salonName) {
  return sendMail({
    to: email,
    subject: `Aplikimi juaj për regjistrim salloni u krijua! – Berber.al`,
    text: `Përshëndetje ${ownerName},\n\nFaleminderit për regjistrimin në Berber.al!\n\nKërkesa për sallonin tuaj "${salonName}" është krijuar me sukses dhe është në proces verifikimi nga ekipi i Berber.al. Ju do të njoftoheni me email sapo llogaria dhe salloni juaj të aprovohen nga administratori.\n\nJu faleminderit për durimin!\nStafi i Berber.al`,
    html: `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;color:#1e293b;">
      <div style="text-align:center;margin-bottom:24px;">${LOGO_HTML}</div>
      <h2 style="text-align:center;font-size:1.25rem;color:#c29545;margin-bottom:8px;">Aplikimi për Regjistrim u Krijua!</h2>
      <p style="color:#64748b;line-height:1.6;margin-bottom:24px;text-align:center;">
        Përshëndetje <strong>${ownerName}</strong>,<br/><br/>
        Faleminderit për regjistrimin në platformën tonë! Kërkesa juaj për sallonin <strong>${salonName}</strong> është krijuar dhe aktualisht është në proces verifikimi nga ekipi i <strong>Berber.al</strong>.
      </p>
      <div style="background:#f8fafc;border-radius:8px;padding:20px;border-left:4px solid #c29545;margin-bottom:24px;text-align:center;">
        <p style="margin:0;color:#334155;font-size:0.95rem;">⏳ <strong>Statusi:</strong> Në pritje të aprovimit</p>
        <p style="margin:8px 0 0;color:#64748b;font-size:0.85rem;">Ju do të njoftoheni menjëherë me email sapo kërkesa juaj të aprovohet.</p>
      </div>
      <p style="color:#94a3b8;font-size:0.85rem;text-align:center;margin:0;">Ju faleminderit për durimin dhe mirëkuptimin tuaj!</p>
      ${FOOTER_HTML}
    </div>`,
  });
}
