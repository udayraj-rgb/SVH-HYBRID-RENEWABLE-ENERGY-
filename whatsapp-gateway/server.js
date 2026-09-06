const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 5001;
const authPath = path.join(__dirname, 'auth_info_baileys');

let sock = null;
let isConnected = false;
let latestQrDataUrl = null;
let latestPairingCode = null;
let connectedUser = null;
let isInitializing = false;
let enrollmentRequests = [];
const processedMessageIds = new Set();

function cleanAuthFolder() {
  try {
    if (fs.existsSync(authPath)) {
      fs.rmSync(authPath, { recursive: true, force: true });
      console.log('[WhatsApp Gateway] Cleaned stale auth session folder on disk.');
    }
  } catch (e) {
    console.error('[WhatsApp Gateway] Error cleaning auth folder:', e.message);
  }
}

async function initBaileys() {
  if (isInitializing) {
    console.log('[WhatsApp Gateway] Already initializing, skipping duplicate call.');
    return;
  }
  isInitializing = true;

  try {
    if (!fs.existsSync(authPath)) {
      fs.mkdirSync(authPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

    sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: ['Windows', 'Chrome', '122.0.0'],
      syncFullHistory: false,
    });

    sock.ev.on('creds.update', saveCreds);

    // Incoming Message Listener (Auto-Enrollment & Facility Operator Notification)
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      try {
        if (!messages || messages.length === 0) return;
        const m = messages[0];
        if (!m.message) return;
        if (m.key.fromMe) return; // CRITICAL: Never process own outgoing messages

        const msgId = m.key.id;
        if (msgId) {
          if (processedMessageIds.has(msgId)) return;
          processedMessageIds.add(msgId);
          if (processedMessageIds.size > 200) {
            const first = processedMessageIds.values().next().value;
            processedMessageIds.delete(first);
          }
        }

        const senderJid = m.key.remoteJid || '';
        if (senderJid.endsWith('@g.us') || senderJid === 'status@broadcast') return;

        const rawSender = senderJid.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '');
        const cleanPhone = rawSender.startsWith('91') ? rawSender : (rawSender.length === 10 ? '91' + rawSender : rawSender);

        const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
        if (!text) return;

        console.log(`[WhatsApp Incoming] From: +${cleanPhone} | Message: "${text.substring(0, 80)}..."`);

        const lower = text.toLowerCase();
        const isEnrollRequest = lower.includes('enroll') || 
                                lower.includes('register') || 
                                lower.includes('opt in') || 
                                lower.includes('green hour') || 
                                lower.includes('tejas grid') || 
                                (lower.includes('name:') && (lower.includes('reg') || lower.includes('hostel')));

        if (isEnrollRequest) {
          console.log(`[WhatsApp Auto-Enrollment] Detected enrollment trigger from +${cleanPhone}`);

          // Extract Name
          let studentName = '';
          const nameMatch = text.match(/Name:\s*([^\n\r]+)/i) || text.match(/I am\s+([A-Za-z\s]+)/i);
          if (nameMatch && nameMatch[1]) {
            studentName = nameMatch[1].trim().replace(/[*_\[\]]/g, '').slice(0, 50);
          }
          if (!studentName || studentName.toLowerCase().includes('enter your name')) {
            studentName = `Student ${cleanPhone.slice(-4)}`;
          }

          // Extract Reg No
          let regNo = '';
          const regMatch = text.match(/Reg(?:\s*No)?:\s*([^\n\r]+)/i) || text.match(/\b(2[0-9][A-Z]{2,4}[0-9]{3,5})\b/i);
          if (regMatch && regMatch[1]) {
            regNo = regMatch[1].trim().replace(/[*_\[\]]/g, '').toUpperCase().slice(0, 25);
          }
          if (!regNo || regNo.toLowerCase().includes('enter your reg')) {
            regNo = `24BCE${cleanPhone.slice(-4)}`;
          }

          // Extract Hostel
          let hostelId = 1;
          let hostelName = 'Block A (Aryabhata)';
          if (lower.includes('bhaskara') || lower.includes('block b')) {
            hostelId = 2;
            hostelName = 'Block B (Bhaskara)';
          } else if (lower.includes('charaka') || lower.includes('raman') || lower.includes('block c')) {
            hostelId = 3;
            hostelName = 'Block C (Raman)';
          }

          // 1. Post to Spring Boot Orchestrator to enroll in PostgreSQL database
          try {
            const res = await fetch('http://localhost:8080/api/v1/students/enroll', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: studentName,
                registrationNumber: regNo,
                phoneNumber: cleanPhone,
                hostelId: hostelId,
              }),
            });
            const enrolledData = await res.json();
            console.log(`[WhatsApp Auto-Enrollment] PostgreSQL Result:`, enrolledData?.status || 'enrolled');
          } catch (dbErr) {
            console.error('[WhatsApp Auto-Enrollment] DB call error:', dbErr.message);
          }

          // 2. Add to enrollment queue for Facility Operator UI
          const enrollmentObj = {
            id: Date.now(),
            phone: cleanPhone,
            name: studentName,
            registrationNumber: regNo,
            hostel: hostelName,
            timestamp: new Date().toISOString(),
            message: text,
            source: 'whatsapp_qr_scan',
          };
          enrollmentRequests.unshift(enrollmentObj);
          if (enrollmentRequests.length > 50) enrollmentRequests.pop();

          // 3. Send automated confirmation reply back to the student
          const replyMsg = `🎉 *WELCOME TO TEJAS GRID!* ⚡\n\nHello *${studentName}*! 👋\nYou have been successfully enrolled in the *Campus Student Directory*.\n\n🎓 *Reg No:* ${regNo}\n🏢 *Hostel:* ${hostelName}\n🪙 *Starting Balance:* 100 Karma Points (KP)\n\n_Facility Operator has received your enrollment notification. You will receive live WhatsApp alerts whenever campus renewable power is deficient. Turn off appliances during Green Hours to earn rewards!_`;

          try {
            await sock.sendMessage(senderJid, { text: replyMsg });
            console.log(`[WhatsApp Auto-Reply] Sent confirmation to +${cleanPhone}`);
          } catch (replyErr) {
            console.warn(`[WhatsApp Auto-Reply] Failed to send reply to +${cleanPhone}:`, replyErr.message);
          }

          // 4. Send WhatsApp Notification to Facility Operator
          const operatorPhone = process.env.OPERATOR_PHONE || '918238893551';
          const operatorJid = `${operatorPhone}@s.whatsapp.net`;
          if (cleanPhone !== operatorPhone) {
            const operatorAlert = `🔔 *NEW STUDENT ENROLLMENT ALERT (FACILITY OPERATOR)* ⚡\n\nA student has joined via Hostel Leaderboard WhatsApp QR!\n\n👤 *Student Name:* ${studentName}\n🎓 *Reg No:* ${regNo}\n🏢 *Hostel:* ${hostelName}\n📱 *WhatsApp Mobile:* +${cleanPhone}\n\n✅ *Status:* Automatically enrolled into Student Directory (PostgreSQL) with 100 Karma Points.\n\n🌐 View in Facility Operator Hub: http://localhost:3000/facility`;
            try {
              await sock.sendMessage(operatorJid, { text: operatorAlert });
              console.log(`[WhatsApp Operator Alert] Dispatched enrollment notification to Facility Operator (+${operatorPhone})`);
            } catch (opErr) {
              console.warn(`[WhatsApp Operator Alert] Failed to notify operator:`, opErr.message);
            }
          }
        }
      } catch (upsertErr) {
        console.error('[WhatsApp Incoming Error]:', upsertErr.message);
      }
    });

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          latestQrDataUrl = await QRCode.toDataURL(qr, {
            margin: 2,
            scale: 8,
            color: { dark: '#000000', light: '#ffffff' },
          });
          isConnected = false;
          console.log('[WhatsApp Gateway] Fresh QR code generated. Access at http://localhost:5001/');
        } catch (qrErr) {
          console.error('[WhatsApp Gateway] QR generation error:', qrErr.message);
        }
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error)?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;
        isConnected = false;
        latestQrDataUrl = null;
        latestPairingCode = null;
        connectedUser = null;
        isInitializing = false;

        console.log(`[WhatsApp Gateway] Connection closed (${statusCode}). IsLoggedOut: ${isLoggedOut}`);

        if (isLoggedOut) {
          console.log('[WhatsApp Gateway] Session invalid/logged out. Wiping session files and restarting fresh...');
          cleanAuthFolder();
          setTimeout(initBaileys, 2000);
        } else {
          console.log('[WhatsApp Gateway] Reconnecting in 3 seconds...');
          setTimeout(initBaileys, 3000);
        }
      } else if (connection === 'open') {
        isConnected = true;
        isInitializing = false;
        latestQrDataUrl = null;
        latestPairingCode = null;
        connectedUser = sock.user?.id ? sock.user.id.split(':')[0] : 'Linked';
        console.log('\n==========================================================');
        console.log(` ✅ WHATSAPP GATEWAY ONLINE & CONNECTED TO: +${connectedUser}`);
        console.log(' Ready to dispatch direct alerts to students!');
        console.log('==========================================================\n');
      }
    });
  } catch (err) {
    console.error('[WhatsApp Gateway] Initialization error:', err.message);
    isInitializing = false;
    setTimeout(initBaileys, 5000);
  }
}

// 1. Status API
app.get('/api/status', (req, res) => {
  res.json({
    connected: isConnected,
    user: connectedUser,
    hasQr: Boolean(latestQrDataUrl),
    pairingCode: latestPairingCode,
    pendingEnrollments: enrollmentRequests.length,
  });
});

// 2. Real-Time QR Image API
app.get('/api/qr', (req, res) => {
  res.json({ qr: latestQrDataUrl, connected: isConnected, user: connectedUser });
});

// 3. 8-Digit Pairing Code API
app.post('/api/pair', async (req, res) => {
  const { phone } = req.body;
  const rawNumber = String(phone || '918238893551').replace(/[^0-9]/g, '');
  const cleanPhone = rawNumber.startsWith('91') ? rawNumber : '91' + rawNumber;

  if (isConnected) {
    return res.json({ connected: true, message: `Already connected to +${connectedUser}` });
  }

  if (!sock) {
    await initBaileys();
  }

  try {
    let attempts = 0;
    while (!sock && attempts < 10) {
      await new Promise((r) => setTimeout(r, 400));
      attempts++;
    }

    const code = await sock.requestPairingCode(cleanPhone);
    const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
    latestPairingCode = formattedCode;
    console.log(`\n🔑 8-DIGIT PAIRING CODE FOR +${cleanPhone}: [ ${formattedCode} ]\n`);
    return res.json({ code: formattedCode, phone: cleanPhone });
  } catch (err) {
    console.error('Pairing code error:', err.message);
    if (err.message && (err.message.includes('Closed') || err.message.includes('not opened'))) {
      cleanAuthFolder();
      setTimeout(initBaileys, 1000);
    }
    return res.status(500).json({ error: err.message });
  }
});

// 4. Session Reset / Logout API
const handleReset = async (req, res) => {
  try {
    isConnected = false;
    latestQrDataUrl = null;
    latestPairingCode = null;
    connectedUser = null;
    isInitializing = false;

    if (sock) {
      try {
        sock.end(new Error('Manual session reset'));
      } catch (_) {}
      sock = null;
    }

    cleanAuthFolder();
    setTimeout(initBaileys, 1500);

    return res.json({
      status: 'success',
      message: 'Session wiped clean. Fresh QR and pairing socket reinitializing.',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
app.post('/api/reset', handleReset);
app.get('/api/reset', handleReset);

// 5. Enrollment Requests API (For Facility Operator UI)
app.get('/api/enrollments', (req, res) => {
  res.json({ enrollments: enrollmentRequests });
});

// 6. Direct Self-Enrollment Endpoint (From Kiosk or Web UI)
app.post('/api/enroll', async (req, res) => {
  const { name, registrationNumber, phoneNumber, hostelId, hostel } = req.body;
  const cleanPhone = String(phoneNumber || '').replace(/[^0-9]/g, '');

  if (!cleanPhone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    // Call Spring Boot Orchestrator
    const springRes = await fetch('http://localhost:8080/api/v1/students/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name || `Student ${cleanPhone.slice(-4)}`,
        registrationNumber: registrationNumber || `24BCE${cleanPhone.slice(-4)}`,
        phoneNumber: cleanPhone,
        hostelId: hostelId || 1,
      }),
    });
    const studentData = await springRes.json();

    // Send confirmation to student WhatsApp if gateway is online
    const studentName = name || `Student ${cleanPhone.slice(-4)}`;
    const studentReg = registrationNumber || `24BCE${cleanPhone.slice(-4)}`;
    const studentHostel = hostel || 'Block A (Aryabhata)';

    if (isConnected && sock) {
      const confirmMsg = `🎉 *WELCOME TO TEJAS GRID!* ⚡\n\nHello *${studentName}*! 👋\nYou have been successfully registered into the *Campus Student Directory*.\n\n🎓 *Reg No:* ${studentReg}\n🏢 *Hostel:* ${studentHostel}\n🪙 *Starting Balance:* 100 Karma Points (KP)\n\n_Facility Operator has verified your profile. You will receive live WhatsApp alerts during campus electricity deficits!_`;

      const jid = `${cleanPhone}@s.whatsapp.net`;
      sock.sendMessage(jid, { text: confirmMsg }).catch((e) => {
        console.warn('Could not send WhatsApp welcome message:', e.message);
      });
    }

    // Record in queue
    enrollmentRequests.unshift({
      id: Date.now(),
      phone: cleanPhone,
      name: studentName,
      registrationNumber: studentReg,
      hostel: studentHostel,
      timestamp: new Date().toISOString(),
      source: 'kiosk_or_web',
    });

    // Send alert to Facility Operator
    const operatorPhone = process.env.OPERATOR_PHONE || '918238893551';
    const operatorJid = `${operatorPhone}@s.whatsapp.net`;
    if (cleanPhone !== operatorPhone && isConnected && sock) {
      const operatorAlert = `🔔 *NEW STUDENT ENROLLMENT ALERT (KIOSK TOUCHSCREEN)* ⚡\n\nA student just registered via the Public Kiosk screen!\n\n👤 *Student Name:* ${studentName}\n🎓 *Reg No:* ${studentReg}\n🏢 *Hostel:* ${studentHostel}\n📱 *WhatsApp:* +${cleanPhone}\n\n✅ *Status:* Registered in Student Directory (PostgreSQL) with 100 KP.\n🌐 View in Hub: http://localhost:3000/facility`;
      sock.sendMessage(operatorJid, { text: operatorAlert }).catch((e) => {
        console.warn('Could not notify operator of kiosk enrollment:', e.message);
      });
    }

    return res.json({
      status: 'success',
      message: `Enrolled ${studentName} successfully in PostgreSQL Student Directory!`,
      data: studentData,
    });
  } catch (err) {
    console.error('Enrollment error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 7. Send Alert to Single Student
app.post('/api/send', async (req, res) => {
  const phone = req.body?.phone || req.body?.phoneNumber || req.query?.phone;
  const message = req.body?.message || req.query?.message;

  if (!phone || !message) {
    return res.status(400).json({ error: 'phone and message are required' });
  }

  if (!isConnected || !sock) {
    return res.status(503).json({
      error: 'WhatsApp gateway not linked yet.',
      hint: 'Please link WhatsApp at http://localhost:5001',
    });
  }

  let cleanPhone = String(phone).replace(/[^0-9]/g, '');
  if (!cleanPhone.startsWith('91') && cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  const selfNum = sock.user?.id?.split(':')[0]?.replace(/[^0-9]/g, '');
  const isSelf = cleanPhone === selfNum;

  try {
    let result;
    if (isSelf && sock.user?.id) {
      result = await sock.sendMessage(sock.user.id, { text: message });
      console.log(`[WhatsApp Self-Message Sent] To: +${cleanPhone} | ID: ${result?.key?.id}`);
    } else {
      const jid = `${cleanPhone}@s.whatsapp.net`;
      result = await sock.sendMessage(jid, { text: message });
      console.log(`[WhatsApp Outbound Sent] To: +${cleanPhone} | ID: ${result?.key?.id}`);
    }
    return res.json({ status: 'dispatched', to: cleanPhone, isSelf, messageId: result?.key?.id });
  } catch (err) {
    console.error(`[WhatsApp Error] Failed sending to +${cleanPhone}:`, err.message);
    return res.status(500).json({ error: err.message });
  }
});

// 8. Batch Broadcast to Multiple Students
app.post('/api/broadcast', async (req, res) => {
  let phones = req.body?.phones;
  if (!phones && req.body?.phone) phones = [req.body.phone];
  if (!phones && req.body?.phoneNumber) phones = [req.body.phoneNumber];
  if (typeof phones === 'string') {
    try {
      phones = JSON.parse(phones);
    } catch (e) {
      phones = [phones];
    }
  }

  const message = req.body?.message || req.query?.message;

  if (!Array.isArray(phones) || phones.length === 0 || !message) {
    return res.status(400).json({ error: 'phones array and message are required' });
  }

  if (!isConnected || !sock) {
    return res.status(503).json({
      error: 'WhatsApp gateway not linked yet.',
      hint: 'Please link WhatsApp at http://localhost:5001',
    });
  }

  console.log(`[WhatsApp Broadcast] Sending to ${phones.length} students...`);
  const dispatched = [];
  const selfNum = sock.user?.id?.split(':')[0]?.replace(/[^0-9]/g, '');

  for (const p of phones) {
    let cleanPhone = String(p).replace(/[^0-9]/g, '');
    if (!cleanPhone.startsWith('91') && cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }

    const isSelf = cleanPhone === selfNum;
    const jid = isSelf && sock.user?.id ? sock.user.id : `${cleanPhone}@s.whatsapp.net`;

    try {
      const sent = await sock.sendMessage(jid, { text: message });
      dispatched.push({ phone: cleanPhone, status: 'sent', isSelf, id: sent?.key?.id });
      await new Promise((r) => setTimeout(r, 600));
    } catch (e) {
      dispatched.push({ phone: cleanPhone, status: 'failed', error: e.message });
    }
  }

  return res.json({ status: 'completed', count: dispatched.length, dispatched });
});

// 9. Interactive Pairing & Management Portal UI
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TEJAS GRID — WhatsApp Dispatcher Control</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #080c14; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
        .card { background: #111827; border: 1px solid #1f2937; border-radius: 28px; padding: 36px; max-width: 540px; width: 100%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); }
        h1 { font-size: 26px; font-weight: 800; margin: 0 0 6px; color: #10b981; }
        p.subtitle { color: #9ca3af; font-size: 13px; margin: 0 0 24px; }
        .tab-buttons { display: flex; background: #1f2937; border-radius: 14px; padding: 4px; margin-bottom: 24px; gap: 4px; }
        .tab-btn { flex: 1; padding: 10px; border: none; border-radius: 10px; font-weight: 700; font-size: 12px; cursor: pointer; color: #9ca3af; background: transparent; transition: all 0.2s; }
        .tab-btn.active { background: #10b981; color: #ffffff; }
        .qr-box { background: white; padding: 16px; border-radius: 20px; display: inline-block; box-shadow: 0 10px 30px rgba(0,0,0,0.5); min-height: 240px; min-width: 240px; }
        .qr-box img { width: 220px; height: 220px; display: block; }
        .code-display { font-family: ui-monospace, monospace; font-size: 32px; font-weight: 900; letter-spacing: 4px; color: #34d399; background: #030712; padding: 16px 24px; border-radius: 16px; border: 2px dashed #059669; margin: 16px 0; user-select: all; }
        .phone-input { width: 100%; padding: 14px; border-radius: 14px; border: 1px solid #374151; background: #1f2937; color: white; font-size: 15px; font-weight: 600; text-align: center; margin-bottom: 12px; outline: none; }
        .phone-input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
        .action-btn { width: 100%; padding: 14px; border-radius: 14px; border: none; background: #10b981; color: white; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .action-btn:hover { background: #059669; }
        .reset-btn { width: 100%; padding: 11px; border-radius: 12px; border: 1px solid #ef4444; background: transparent; color: #ef4444; font-size: 12px; font-weight: 700; cursor: pointer; margin-top: 14px; transition: all 0.2s; }
        .reset-btn:hover { background: #ef4444; color: white; }
        .status-badge { display: inline-block; padding: 8px 18px; border-radius: 9999px; font-weight: 700; font-size: 12px; margin-bottom: 20px; }
        .connected { background: #064e3b; color: #6ee7b7; border: 1px solid #059669; }
        .waiting { background: #451a03; color: #fde68a; border: 1px solid #d97706; }
        .instructions { text-align: left; background: #0f172a; padding: 16px 20px; border-radius: 16px; margin-top: 20px; font-size: 12px; color: #cbd5e1; border: 1px solid #1e293b; }
        .instructions ol { margin: 0; padding-left: 20px; }
        .instructions li { margin-bottom: 6px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>⚡ TEJAS GRID</h1>
        <p class="subtitle">Autonomous Campus WhatsApp Broadcaster</p>

        <div id="status-area">
          <div class="status-badge waiting" id="badge">⏳ INITIALIZING GATEWAY...</div>
        </div>

        <div id="connected-content" style="display:none;">
          <p style="font-size: 15px; color: #e2e8f0;">Linked to sender number: <strong style="color:#34d399;">+<span id="connected-user"></span></strong></p>
          <div style="background:rgba(6,78,59,0.3); border:1px solid #059669; padding:16px; border-radius:16px; margin:20px 0; color:#a7f3d0; font-size:13px;">
            The Virtual Power Plant is fully authorized! Every time campus load exceeds solar generation, alerts and voucher notifications are dispatched directly to WhatsApp. Incoming student enrollment messages are automatically parsed and added to the Student Directory.
          </div>
          <button class="reset-btn" onclick="resetSession()">Disconnect & Link Another Number</button>
        </div>

        <div id="pairing-tabs">
          <div class="tab-buttons">
            <button class="tab-btn active" id="btn-tab-code" onclick="switchTab('code')">📲 8-Digit Pairing Code (Recommended)</button>
            <button class="tab-btn" id="btn-tab-qr" onclick="switchTab('qr')">📷 QR Code Scan</button>
          </div>

          <!-- Tab 1: Pairing Code Mode -->
          <div id="tab-code-panel">
            <p style="color:#94a3b8; font-size:12px; margin-bottom:12px;">Enter your phone number to get an 8-character pairing code:</p>
            <input type="text" id="target-phone" class="phone-input" value="918238893551" placeholder="Enter phone with country code (e.g. 918238893551)" />
            <button class="action-btn" id="btn-get-code" onclick="requestCode()">Get 8-Digit Pairing Code</button>

            <div id="code-result" style="display:none;">
              <p style="color:#94a3b8; font-size:12px; margin-top:16px; margin-bottom:4px;">Enter this code on your phone:</p>
              <div class="code-display" id="display-code">----</div>
              <div class="instructions">
                <strong>How to Enter Code on Phone:</strong>
                <ol>
                  <li>Open <strong>WhatsApp</strong> on your phone</li>
                  <li>Tap <strong>3 dots (⋮)</strong> or <strong>Settings</strong></li>
                  <li>Tap <strong>Linked Devices</strong> &gt; <strong>Link a Device</strong></li>
                  <li>Tap <strong>"Link with phone number instead"</strong> at the bottom</li>
                  <li>Type the 8-digit code shown above</li>
                </ol>
              </div>
            </div>
          </div>

          <!-- Tab 2: Live Auto-Refreshing QR Code -->
          <div id="tab-qr-panel" style="display:none;">
            <div class="qr-box">
              <img id="qr-img" src="" alt="Waiting for WhatsApp QR..." style="display:none;" />
              <div id="qr-loading" style="padding-top:90px; color:#6b7280; font-size:13px; font-weight:600;">
                Generating live QR code...
              </div>
            </div>
            <div class="instructions">
              <strong>How to Scan:</strong>
              <ol>
                <li>Open <strong>WhatsApp</strong> &gt; <strong>Linked Devices</strong> &gt; <strong>Link a Device</strong></li>
                <li>Point camera at this QR code (auto-refreshes automatically)</li>
              </ol>
            </div>
          </div>

          <button class="reset-btn" onclick="resetSession()">🔄 Reset Session & Generate New Code/QR</button>
        </div>
      </div>

      <script>
        function switchTab(tab) {
          document.getElementById('tab-code-panel').style.display = tab === 'code' ? 'block' : 'none';
          document.getElementById('tab-qr-panel').style.display = tab === 'qr' ? 'block' : 'none';
          document.getElementById('btn-tab-code').className = 'tab-btn ' + (tab === 'code' ? 'active' : '');
          document.getElementById('btn-tab-qr').className = 'tab-btn ' + (tab === 'qr' ? 'active' : '');
        }

        async function requestCode() {
          const btn = document.getElementById('btn-get-code');
          const phone = document.getElementById('target-phone').value;
          btn.disabled = true;
          btn.innerText = 'Requesting Code from WhatsApp...';

          try {
            const res = await fetch('/api/pair', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone })
            });
            const data = await res.json();
            if (data.code) {
              document.getElementById('display-code').innerText = data.code;
              document.getElementById('code-result').style.display = 'block';
            } else if (data.connected) {
              location.reload();
            } else {
              alert('Notice: ' + (data.error || 'Failed to get code. Try clicking Reset Session below.'));
            }
          } catch(e) {
            alert('Request failed: ' + e.message);
          } finally {
            btn.disabled = false;
            btn.innerText = 'Get 8-Digit Pairing Code';
          }
        }

        async function resetSession() {
          if (!confirm('Reset WhatsApp session? This will generate a fresh pairing session.')) return;
          try {
            await fetch('/api/reset', { method: 'POST' });
            alert('Session reset! Reloading...');
            location.reload();
          } catch(e) {
            alert('Reset failed: ' + e.message);
          }
        }

        setInterval(async () => {
          try {
            const res = await fetch('/api/status');
            const data = await res.json();

            if (data.connected) {
              document.getElementById('connected-content').style.display = 'block';
              document.getElementById('pairing-tabs').style.display = 'none';
              document.getElementById('connected-user').innerText = data.user || 'Linked';
              document.getElementById('badge').className = 'status-badge connected';
              document.getElementById('badge').innerText = '✓ GATEWAY ONLINE & CONNECTED';
            } else {
              document.getElementById('connected-content').style.display = 'none';
              document.getElementById('pairing-tabs').style.display = 'block';
              document.getElementById('badge').className = 'status-badge waiting';
              document.getElementById('badge').innerText = '⏳ READY TO LINK SENDER';

              const qrRes = await fetch('/api/qr');
              const qrData = await qrRes.json();
              if (qrData.qr) {
                const qrImg = document.getElementById('qr-img');
                qrImg.src = qrData.qr;
                qrImg.style.display = 'block';
                document.getElementById('qr-loading').style.display = 'none';
              }
            }
          } catch(e) {}
        }, 2500);
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`[TEJAS WhatsApp Broadcaster] HTTP API listening on port ${PORT}`);
  initBaileys();
});
