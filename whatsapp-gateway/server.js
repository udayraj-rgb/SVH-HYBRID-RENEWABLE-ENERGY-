const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 5001;

let sock = null;
let isConnected = false;
let latestQrDataUrl = null;
let latestPairingCode = null;
let connectedUser = null;
let authState = null;
let saveCredentials = null;

async function initBaileys() {
  const authPath = path.join(__dirname, 'auth_info_baileys');
  const { state, saveCreds } = await useMultiFileAuthState(authPath);
  authState = state;
  saveCredentials = saveCreds;

  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

  sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Windows', 'Chrome', '120.0.0'],
    syncFullHistory: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      latestQrDataUrl = await QRCode.toDataURL(qr, {
        margin: 2,
        scale: 8,
        color: { dark: '#000000', light: '#ffffff' },
      });
      isConnected = false;
      console.log('[WhatsApp Gateway] Fresh QR code generated. Visit http://localhost:5001/');
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      isConnected = false;
      latestQrDataUrl = null;
      latestPairingCode = null;
      console.log(`[WhatsApp Gateway] Connection closed (${statusCode}). Reconnecting: ${shouldReconnect}`);

      if (shouldReconnect) {
        setTimeout(initBaileys, 3000);
      } else {
        console.log('[WhatsApp Gateway] Logged out. Cleaned session.');
      }
    } else if (connection === 'open') {
      isConnected = true;
      latestQrDataUrl = null;
      latestPairingCode = null;
      connectedUser = sock.user?.id ? sock.user.id.split(':')[0] : 'Linked';
      console.log('\n==========================================================');
      console.log(` ✅ WHATSAPP GATEWAY ONLINE & CONNECTED TO: +${connectedUser}`);
      console.log(' Ready to dispatch direct alerts to students!');
      console.log('==========================================================\n');
    }
  });
}

// 1. Status API
app.get('/api/status', (req, res) => {
  res.json({
    connected: isConnected,
    user: connectedUser,
    hasQr: Boolean(latestQrDataUrl),
    pairingCode: latestPairingCode,
  });
});

// 2. Real-Time QR Image API
app.get('/api/qr', (req, res) => {
  res.json({ qr: latestQrDataUrl });
});

// 3. 8-Digit Pairing Code API (No camera/scanning required!)
app.post('/api/pair', async (req, res) => {
  const { phone } = req.body;
  const rawNumber = String(phone || '918238893551').replace(/[^0-9]/g, '');
  const cleanPhone = rawNumber.startsWith('91') ? rawNumber : '91' + rawNumber;

  if (!sock) {
    return res.status(503).json({ error: 'Socket not initialized' });
  }

  if (isConnected) {
    return res.json({ connected: true, message: `Already connected to +${connectedUser}` });
  }

  try {
    const code = await sock.requestPairingCode(cleanPhone);
    const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
    latestPairingCode = formattedCode;
    console.log(`\n🔑 8-DIGIT PAIRING CODE FOR +${cleanPhone}: [ ${formattedCode} ]\n`);
    return res.json({ code: formattedCode, phone: cleanPhone });
  } catch (err) {
    console.error('Pairing code error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// 4. Send Alert to Single Student
app.post('/api/send', async (req, res) => {
  const phone = req.body?.phone || req.body?.phoneNumber || req.query?.phone;
  const message = req.body?.message || req.query?.message;

  if (!phone || !message) {
    return res.status(400).json({ error: 'phone and message are required' });
  }

  if (!isConnected || !sock) {
    return res.status(503).json({ error: 'WhatsApp gateway not linked yet.' });
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
      // Send to both user.id and device to ensure sync in self chat
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

// 5. Batch Broadcast to Multiple Students
app.post('/api/broadcast', async (req, res) => {
  let phones = req.body?.phones;
  if (!phones && req.body?.phone) phones = [req.body.phone];
  if (!phones && req.body?.phoneNumber) phones = [req.body.phoneNumber];
  if (typeof phones === 'string') {
    try { phones = JSON.parse(phones); } catch(e) { phones = [phones]; }
  }

  const message = req.body?.message || req.query?.message;

  if (!Array.isArray(phones) || phones.length === 0 || !message) {
    return res.status(400).json({ error: 'phones array and message are required' });
  }

  if (!isConnected || !sock) {
    return res.status(503).json({ error: 'WhatsApp gateway not linked yet.' });
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
    const jid = (isSelf && sock.user?.id) ? sock.user.id : `${cleanPhone}@s.whatsapp.net`;

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

// 6. Interactive Pairing Portal UI
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TEJAS GRID — WhatsApp Dispatcher Setup</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #080c14; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
        .card { background: #111827; border: 1px solid #1f2937; border-radius: 28px; padding: 36px; max-width: 520px; width: 100%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); }
        h1 { font-size: 26px; font-weight: 800; margin: 0 0 6px; color: #10b981; }
        p.subtitle { color: #9ca3af; font-size: 13px; margin: 0 0 24px; }
        .tab-buttons { display: flex; background: #1f2937; border-radius: 14px; padding: 4px; margin-bottom: 24px; gap: 4px; }
        .tab-btn { flex: 1; padding: 10px; border: none; border-radius: 10px; font-weight: 700; font-size: 12px; cursor: pointer; color: #9ca3af; background: transparent; transition: all 0.2s; }
        .tab-btn.active { background: #10b981; color: #ffffff; }
        .qr-box { background: white; padding: 16px; border-radius: 20px; display: inline-block; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .qr-box img { width: 220px; height: 220px; display: block; }
        .code-display { font-family: ui-monospace, monospace; font-size: 32px; font-weight: 900; letter-spacing: 4px; color: #34d399; background: #030712; padding: 16px 24px; border-radius: 16px; border: 2px dashed #059669; margin: 16px 0; user-select: all; }
        .phone-input { width: 100%; padding: 14px; border-radius: 14px; border: 1px solid #374151; background: #1f2937; color: white; font-size: 15px; font-weight: 600; text-align: center; margin-bottom: 12px; outline: none; }
        .phone-input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
        .action-btn { width: 100%; padding: 14px; border-radius: 14px; border: none; background: #10b981; color: white; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .action-btn:hover { background: #059669; }
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
          <div class="status-badge ${isConnected ? 'connected' : 'waiting'}">
            ${isConnected ? '✓ GATEWAY ONLINE & CONNECTED' : '⏳ READY TO LINK SENDER'}
          </div>
        </div>

        <div id="connected-content" style="${isConnected ? '' : 'display:none;'}">
          <p style="font-size: 15px; color: #e2e8f0;">Linked to sender number: <strong style="color:#34d399;">+<span id="connected-user">${connectedUser || ''}</span></strong></p>
          <div style="background:#064e3b/30; border:1px solid #059669; padding:16px; border-radius:16px; margin:20px 0; color:#a7f3d0; font-size:13px;">
            The Virtual Power Plant is fully authorized! Every time campus load exceeds solar generation, alerts are dispatched directly into student WhatsApp inboxes.
          </div>
        </div>

        <div id="pairing-tabs" style="${isConnected ? 'display:none;' : ''}">
          <div class="tab-buttons">
            <button class="tab-btn active" id="btn-tab-code" onclick="switchTab('code')">📲 8-Digit Pairing Code (Easiest)</button>
            <button class="tab-btn" id="btn-tab-qr" onclick="switchTab('qr')">📷 QR Code Scan</button>
          </div>

          <!-- Tab 1: Pairing Code Mode (No Camera Needed) -->
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
              <img id="qr-img" src="${latestQrDataUrl || ''}" alt="WhatsApp QR Code" />
            </div>
            <div class="instructions">
              <strong>How to Scan:</strong>
              <ol>
                <li>Open <strong>WhatsApp</strong> &gt; <strong>Linked Devices</strong> &gt; <strong>Link a Device</strong></li>
                <li>Point camera at this QR code (auto-refreshes every 3 seconds)</li>
              </ol>
            </div>
          </div>
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
              alert('Error: ' + (data.error || 'Failed to get code'));
            }
          } catch(e) {
            alert('Request failed: ' + e.message);
          } finally {
            btn.disabled = false;
            btn.innerText = 'Get 8-Digit Pairing Code';
          }
        }

        // Auto-polling for status and fresh QR image
        setInterval(async () => {
          try {
            const res = await fetch('/api/status');
            const data = await res.json();

            if (data.connected) {
              document.getElementById('connected-content').style.display = 'block';
              document.getElementById('pairing-tabs').style.display = 'none';
              document.getElementById('connected-user').innerText = data.user || 'Linked';
              document.getElementById('status-area').innerHTML = '<div class="status-badge connected">✓ GATEWAY ONLINE & CONNECTED</div>';
            } else {
              // Fetch latest QR if on QR tab
              if (document.getElementById('tab-qr-panel').style.display === 'block') {
                const qrRes = await fetch('/api/qr');
                const qrData = await qrRes.json();
                if (qrData.qr) {
                  document.getElementById('qr-img').src = qrData.qr;
                }
              }
            }
          } catch(e) {}
        }, 3000);
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`[TEJAS WhatsApp Broadcaster] HTTP API listening on port ${PORT}`);
  initBaileys();
});
