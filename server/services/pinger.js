/**
 * Render Free Pod Keep-Alive Service
 * Prevents Render's free tier instance from entering 15-minute idle sleep
 * by pinging its own public external URL through Render's public edge router every 9 minutes.
 */

let pingerTimer = null;

// Gathers all external public target URLs to ping
function getTargetUrls() {
  const urls = new Set();

  // 1. Render automatically sets RENDER_EXTERNAL_URL (e.g. https://elevatifier-cert-portal.onrender.com)
  if (process.env.RENDER_EXTERNAL_URL && process.env.RENDER_EXTERNAL_URL.trim()) {
    urls.add(process.env.RENDER_EXTERNAL_URL.trim().replace(/\/$/, ''));
  }

  // 2. Custom Base URL (e.g. https://certify.elevatifier.com)
  if (process.env.BASE_URL && process.env.BASE_URL.trim()) {
    const base = process.env.BASE_URL.trim().replace(/\/$/, '');
    urls.add(base);
  }

  // 3. Fallback for local development
  if (urls.size === 0) {
    const port = process.env.PORT || 3000;
    urls.add(`http://localhost:${port}`);
  }

  return Array.from(urls);
}

async function pingUrl(url) {
  const target = `${url}/healthz`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(target, {
      method: 'GET',
      headers: {
        'User-Agent': 'Elevatifier-KeepAlive/2.0 (Render Free Pod Auto-Pinger)',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log(`[Keep-Alive] Heartbeat OK: ${target} responded with HTTP ${response.status} at ${new Date().toISOString()}`);
      return true;
    } else {
      console.warn(`[Keep-Alive] Heartbeat warning: ${target} responded with HTTP ${response.status}`);
      return false;
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn(`[Keep-Alive] Ping to ${target} timed out after 15s.`);
    } else {
      console.warn(`[Keep-Alive] Ping notice for ${target}: ${err.message}`);
    }
    return false;
  }
}

async function performKeepAlivePing() {
  const targets = getTargetUrls();
  let anySuccess = false;

  for (const target of targets) {
    const ok = await pingUrl(target);
    if (ok) anySuccess = true;
  }

  // 9 minutes (540,000ms) interval ensures Render's 15-minute idle timer never fires
  const NORMAL_INTERVAL = 9 * 60 * 1000;
  // If failed (e.g. during initial DNS propagation), retry sooner in 60 seconds
  const RETRY_INTERVAL = 60 * 1000;

  const nextDelay = anySuccess ? NORMAL_INTERVAL : RETRY_INTERVAL;
  pingerTimer = setTimeout(performKeepAlivePing, nextDelay);
}

function startKeepAlivePinger() {
  const isEnabled = process.env.KEEP_ALIVE !== 'false';
  if (!isEnabled) {
    console.log('[Keep-Alive] Pinger disabled by KEEP_ALIVE=false environment variable.');
    return;
  }

  const targets = getTargetUrls();
  console.log(`[Keep-Alive] Initialized self-sustaining Render Keep-Alive Service.`);
  console.log(`[Keep-Alive] Targets: ${targets.map(t => `${t}/healthz`).join(', ')}`);
  console.log(`[Keep-Alive] Frequency: Every 9 minutes (Render sleeps at 15 minutes of inactivity).`);

  // Initial ping 35 seconds after boot (allows server and DNS to settle)
  pingerTimer = setTimeout(performKeepAlivePing, 35 * 1000);
}

function stopKeepAlivePinger() {
  if (pingerTimer) {
    clearTimeout(pingerTimer);
    pingerTimer = null;
  }
}

module.exports = {
  startKeepAlivePinger,
  stopKeepAlivePinger
};
