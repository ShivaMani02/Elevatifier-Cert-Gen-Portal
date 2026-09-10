const http = require('http');
const https = require('https');

let pingerInterval = null;

function startKeepAlivePinger() {
  const isEnabled = process.env.KEEP_ALIVE !== 'false';
  if (!isEnabled) {
    console.log('[Pinger] Keep-alive pinger is disabled by KEEP_ALIVE=false environment setting.');
    return;
  }

  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  
  // Interval: 13 minutes (Render sleeps after 15 minutes)
  const PING_INTERVAL_MS = 13 * 60 * 1000;

  console.log(`[Pinger] Initialized Keep-Alive Service. Will ping ${baseUrl}/healthz every 13 minutes to prevent Render pod from sleeping.`);

  // Function to execute the ping
  const sendPing = () => {
    try {
      const pingUrl = `${baseUrl.replace(/\/$/, '')}/healthz`;
      const client = pingUrl.startsWith('https') ? https : http;

      const req = client.get(pingUrl, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[Pinger] Heartbeat successful at ${new Date().toISOString()} (HTTP ${res.statusCode}) - Pod kept alive.`);
        } else {
          console.warn(`[Pinger] Heartbeat responded with status ${res.statusCode}`);
        }
      });

      req.on('error', (err) => {
        // Suppress connection refused during early boot or if localhost
        console.warn(`[Pinger] Ping notice: ${err.message}`);
      });

      req.setTimeout(10000, () => {
        req.destroy();
      });
    } catch (err) {
      console.warn(`[Pinger] Ping error: ${err.message}`);
    }
  };

  // Run initial delay ping after 2 minutes, then recurring every 13 minutes
  setTimeout(() => {
    sendPing();
    pingerInterval = setInterval(sendPing, PING_INTERVAL_MS);
  }, 2 * 60 * 1000);
}

function stopKeepAlivePinger() {
  if (pingerInterval) {
    clearInterval(pingerInterval);
    pingerInterval = null;
  }
}

module.exports = {
  startKeepAlivePinger,
  stopKeepAlivePinger
};
