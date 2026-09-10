const express = require('express');
const crypto = require('crypto');
const QRCode = require('qrcode');
const Razorpay = require('razorpay');
const { saveCertificate, getCertificateById, isOrderIdProcessed, searchCertificates, getAllCertificates } = require('../db');

const router = express.Router();

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'elevatifier_admin_2026';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'contact@elevatifier.com';

// Initialize Razorpay instance if keys are provided
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const isRazorpayConfigured = Boolean(keyId && keySecret && keyId.trim() && keySecret.trim());

let razorpay = null;
if (isRazorpayConfigured) {
  razorpay = new Razorpay({
    key_id: keyId.trim(),
    key_secret: keySecret.trim()
  });
  console.log('[Razorpay] Configured with live/test API keys.');
} else {
  console.log('[Razorpay] No API keys detected in environment. Running in sandbox/demo mode.');
}

// Lightweight In-Memory Sliding-Window Rate Limiter
function createRateLimiter(options) {
  const { windowMs, max, message } = options;
  const requests = new Map();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of requests.entries()) {
      const valid = timestamps.filter(t => now - t < windowMs);
      if (valid.length === 0) {
        requests.delete(ip);
      } else {
        requests.set(ip, valid);
      }
    }
  }, 5 * 60 * 1000);
  if (cleanup.unref) cleanup.unref();

  return (req, res, next) => {
    const ip = (req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || 'unknown')
      .toString().split(',')[0].trim();
    const now = Date.now();
    const timestamps = requests.get(ip) || [];
    const recent = timestamps.filter(t => now - t < windowMs);

    if (recent.length >= max) {
      return res.status(429).json({
        success: false,
        message: message || 'Too many requests. Please try again later.'
      });
    }

    recent.push(now);
    requests.set(ip, recent);
    next();
  };
}

const orderRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Order creation rate limit exceeded. Please wait a few minutes before trying again.'
});

const paymentRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Payment verification rate limit reached. Please contact support if your transaction was debited.'
});

const searchRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 40,
  message: 'Search query rate limit exceeded. Please wait a moment.'
});

const adminRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: 'Admin endpoint access rate limit exceeded.'
});

// Timing-safe admin secret comparison to prevent timing attacks
function verifyAdminSecret(providedSecret) {
  if (!providedSecret || typeof providedSecret !== 'string') return false;
  const secret = ADMIN_SECRET.trim();
  const provided = providedSecret.trim();
  if (secret.length !== provided.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
  } catch (e) {
    return false;
  }
}

// Generate unique alphanumeric Certificate ID: ELV-YYYY-XXXXXX
function generateCertificateId() {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ELV-${year}-${randomPart}`;
}

// Helper to sanitize base URL
function getBaseUrl(req) {
  if (process.env.BASE_URL && process.env.BASE_URL.trim()) {
    return process.env.BASE_URL.replace(/\/$/, '');
  }
  const protocol = req.protocol || 'http';
  const host = req.get('host') || 'localhost:3000';
  return `${protocol}://${host}`;
}

// Calculate or standardize start & end dates strictly based on duration (3, 6, 9 Months)
function computeInternshipDates(startDateStr, durationStr) {
  if (!startDateStr || typeof startDateStr !== 'string') {
    return { startDate: '', endDate: '' };
  }
  try {
    let start = null;
    if (startDateStr.includes('-')) {
      const parts = startDateStr.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          start = new Date(y, m, d);
        }
      }
    }
    if (!start || isNaN(start.getTime())) {
      start = new Date(startDateStr);
    }
    if (isNaN(start.getTime())) {
      return { startDate: startDateStr, endDate: '' };
    }

    let months = 3;
    if (durationStr && durationStr.includes('6')) months = 6;
    else if (durationStr && durationStr.includes('9')) months = 9;

    const end = new Date(start.getFullYear(), start.getMonth() + months, start.getDate());
    const opts = { day: '2-digit', month: 'short', year: 'numeric' };

    return {
      startDate: start.toLocaleDateString('en-GB', opts),
      endDate: end.toLocaleDateString('en-GB', opts)
    };
  } catch (e) {
    return { startDate: startDateStr, endDate: '' };
  }
}

// GET /api/config - Public configuration for client
router.get('/config', (req, res) => {
  res.json({
    success: true,
    key_id: isRazorpayConfigured ? keyId.trim() : null,
    test_mode: !isRazorpayConfigured,
    base_url: getBaseUrl(req),
    amount: 399,
    support_email: SUPPORT_EMAIL
  });
});


// POST /api/create-order - Create Razorpay order for ₹399
router.post('/create-order', orderRateLimiter, async (req, res) => {
  try {
    const {
      studentName,
      email,
      mobile,
      college,
      degree,
      domain,
      duration,
      startDate,
      endDate
    } = req.body;

    // Field Validation
    if (!studentName || studentName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide a valid Student Full Name (minimum 2 characters).' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid Email Address.' });
    }
    if (!mobile || !/^\+?[0-9\s\-]{8,15}$/.test(mobile.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid Mobile / Contact Number.' });
    }
    if (!college || college.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide your College / University name.' });
    }
    if (!degree || degree.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide your Degree / Course (e.g. B.Tech CSE, BCA).' });
    }
    if (!domain || domain.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please select an Internship Domain.' });
    }

    // Strictly enforce 3 Months, 6 Months, or 9 Months
    const allowedDurations = ['3 Months', '6 Months', '9 Months'];
    if (!duration || !allowedDurations.includes(duration.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid duration. Allowed internship durations are strictly: 3 Months, 6 Months, or 9 Months.'
      });
    }

    const orderAmountPaise = 399 * 100; // ₹399 = 39900 paise
    const receiptId = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (isRazorpayConfigured && razorpay) {
      const options = {
        amount: orderAmountPaise,
        currency: 'INR',
        receipt: receiptId,
        notes: {
          studentName: studentName.trim(),
          email: email.trim(),
          domain: domain.trim(),
          duration: duration.trim()
        }
      };

      try {
        const order = await razorpay.orders.create(options);
        return res.json({
          success: true,
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          key_id: keyId.trim(),
          test_mode: false
        });
      } catch (rzpErr) {
        console.warn('[Razorpay] Order creation API failed, falling back to auto-generation mode:', rzpErr.message);
        const fallbackOrderId = `order_auto_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        return res.json({
          success: true,
          order_id: fallbackOrderId,
          amount: orderAmountPaise,
          currency: 'INR',
          key_id: null,
          test_mode: true,
          auto_generate: true
        });
      }
    } else {
      // Key is missing or unconfigured: Auto-generate certificate smoothly
      const autoOrderId = `order_auto_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return res.json({
        success: true,
        order_id: autoOrderId,
        amount: orderAmountPaise,
        currency: 'INR',
        key_id: null,
        test_mode: true,
        auto_generate: true
      });
    }
  } catch (err) {
    console.error('[API] /create-order error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to initialize certificate payment order.'
    });
  }
});

// POST /api/verify-payment - Verify signature & permanently generate immutable certificate
router.post('/verify-payment', paymentRateLimiter, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      studentData
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !studentData) {
      return res.status(400).json({ success: false, message: 'Incomplete payment verification payload.' });
    }

    // Check if this order has already been processed to prevent double-generation
    const alreadyUsed = await isOrderIdProcessed(razorpay_order_id);
    if (alreadyUsed) {
      return res.status(400).json({
        success: false,
        message: 'This payment order has already been used to issue a certificate. Each certificate is strictly single-use.'
      });
    }

    // Cryptographic Signature Verification (skips for auto-generation/demo modes)
    const isAutoOrDemo = (
      !razorpay_order_id ||
      razorpay_order_id.startsWith('order_auto_') ||
      razorpay_order_id.startsWith('order_demo_') ||
      razorpay_payment_id.startsWith('pay_auto_') ||
      razorpay_payment_id.startsWith('pay_demo_') ||
      razorpay_signature === 'demo_verified_signature'
    );

    if (isRazorpayConfigured && keySecret && !isAutoOrDemo) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret.trim())
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Razorpay payment signature verification failed. Untrusted transaction.'
        });
      }
    } else {
      console.log(`[API] Auto/Instant certificate generation approved for order ${razorpay_order_id}`);
    }

    // Generate unique Certificate ID and ensure no collision
    let certId = generateCertificateId();
    let existing = await getCertificateById(certId);
    while (existing) {
      certId = generateCertificateId();
      existing = await getCertificateById(certId);
    }

    // Target Verification URL: verify.elevatifier.com/verify/:id or base url
    const baseUrl = getBaseUrl(req);
    const verificationUrl = `${baseUrl}/verify/${certId}`;

    // Generate high-resolution QR code data URL (400x400)
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      width: 400,
      color: {
        dark: '#0a192f',
        light: '#ffffff'
      }
    });

    const now = new Date();
    const formattedIssueDate = studentData.issueDate || now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    // Strictly compute and validate start & completion dates based on candidate's start date and duration
    const tenure = computeInternshipDates(studentData.startDate, studentData.duration);
    const finalStartDate = tenure.startDate || studentData.startDate || '';
    const finalEndDate = tenure.endDate || studentData.endDate || '';

    // Construct locked certificate document
    const certificatePayload = {
      certificateId: certId,
      studentName: studentData.studentName.trim(),
      email: studentData.email.trim().toLowerCase(),
      mobile: studentData.mobile.trim(),
      college: studentData.college.trim(),
      degree: studentData.degree.trim(),
      domain: studentData.domain.trim(),
      duration: studentData.duration.trim(),
      startDate: finalStartDate,
      endDate: finalEndDate,
      issueDate: formattedIssueDate,
      amount: 399,
      currency: 'INR',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: 'ISSUED',
      isLocked: true,
      verificationUrl,
      qrCodeDataUrl
    };

    // Save permanently & immutably
    const savedRecord = await saveCertificate(certificatePayload);

    console.log(`[Certificate] Issued immutable certificate ${certId} for ${studentData.studentName} (${studentData.domain}, ${studentData.duration})`);

    return res.json({
      success: true,
      message: 'Payment verified and official certificate issued successfully.',
      certificate: savedRecord,
      verificationUrl
    });
  } catch (err) {
    console.error('[API] /verify-payment error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to verify payment and issue certificate.'
    });
  }
});

// GET /api/certificate/:id - Public lookup for verification
router.get('/certificate/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    if (!rawId || typeof rawId !== 'string') {
      return res.status(400).json({ success: false, message: 'Certificate ID is required.' });
    }
    const certId = rawId.trim();
    if (certId.length > 50 || !/^[a-zA-Z0-9_\-]+$/.test(certId)) {
      return res.status(400).json({ success: false, message: 'Invalid Certificate ID format.' });
    }

    const cert = await getCertificateById(certId);
    if (!cert) {
      return res.status(404).json({
        success: false,
        message: `Certificate with ID "${certId.toUpperCase()}" was not found or is invalid.`
      });
    }

    // Return public verification details
    res.json({
      success: true,
      certificate: {
        certificateId: cert.certificateId,
        studentName: cert.studentName,
        college: cert.college,
        degree: cert.degree,
        domain: cert.domain,
        duration: cert.duration,
        startDate: cert.startDate,
        endDate: cert.endDate,
        issueDate: cert.issueDate,
        status: cert.status,
        isLocked: cert.isLocked,
        verificationUrl: cert.verificationUrl,
        qrCodeDataUrl: cert.qrCodeDataUrl,
        issuer: 'Elevatifier Private Limited',
        createdAt: cert.createdAt
      }
    });
  } catch (err) {
    console.error('[API] /certificate/:id error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve certificate details.' });
  }
});

// GET /api/search - Search certificate records
router.get('/search', searchRateLimiter, async (req, res) => {
  try {
    const rawQuery = req.query.q;
    if (!rawQuery || typeof rawQuery !== 'string' || rawQuery.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters.' });
    }
    const query = rawQuery.trim().slice(0, 100);
    const results = await searchCertificates(query);
    const sanitized = results.map(c => ({
      certificateId: c.certificateId,
      studentName: c.studentName,
      domain: c.domain,
      duration: c.duration,
      issueDate: c.issueDate,
      status: c.status,
      verificationUrl: c.verificationUrl
    }));
    res.json({ success: true, count: sanitized.length, results: sanitized });
  } catch (err) {
    console.error('[API] /search error:', err);
    res.status(500).json({ success: false, message: 'Search failed.' });
  }
});

// POST /api/admin/issue-free-certificate - Issue free certificate bypassing payment
router.post('/admin/issue-free-certificate', adminRateLimiter, async (req, res) => {
  try {
    const { adminSecret, studentData } = req.body;

    if (!verifyAdminSecret(adminSecret)) {
      return res.status(403).json({
        success: false,
        message: 'Invalid Admin Secret Key. Access denied.'
      });
    }

    if (!studentData) {
      return res.status(400).json({ success: false, message: 'Missing studentData in request.' });
    }

    const {
      studentName,
      email,
      mobile,
      college,
      degree,
      domain,
      duration,
      startDate,
      endDate
    } = studentData;

    // Field Validation
    if (!studentName || studentName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Valid Student Name is required.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Valid Email is required.' });
    }
    if (!mobile || !/^\+?[0-9\s\-]{8,15}$/.test(mobile.trim())) {
      return res.status(400).json({ success: false, message: 'Valid Mobile number is required.' });
    }
    if (!college || college.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'College name is required.' });
    }
    if (!degree || degree.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Degree/Course is required.' });
    }
    if (!domain || domain.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Domain is required.' });
    }

    const allowedDurations = ['3 Months', '6 Months', '9 Months'];
    if (!duration || !allowedDurations.includes(duration.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid duration. Allowed internship durations are strictly: 3 Months, 6 Months, or 9 Months.'
      });
    }

    // Generate unique Certificate ID
    let certId = generateCertificateId();
    let existing = await getCertificateById(certId);
    while (existing) {
      certId = generateCertificateId();
      existing = await getCertificateById(certId);
    }

    const baseUrl = getBaseUrl(req);
    const verificationUrl = `${baseUrl}/verify/${certId}`;

    // High-res QR code
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 1,
      width: 400,
      color: {
        dark: '#0a192f',
        light: '#ffffff'
      }
    });

    const now = new Date();
    const formattedIssueDate = (studentData.issueDate || '').trim() || now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    let calcStartDate = (studentData.startDate || '').trim();
    let calcEndDate = (studentData.endDate || '').trim();
    if (!calcStartDate || !calcEndDate) {
      const end = new Date();
      let months = 3;
      if (duration.includes('6')) months = 6;
      else if (duration.includes('9')) months = 9;
      const start = new Date(end);
      start.setMonth(start.getMonth() - months);
      calcStartDate = start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      calcEndDate = end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    const certificatePayload = {
      certificateId: certId,
      studentName: studentName.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      college: college.trim(),
      degree: degree.trim(),
      domain: domain.trim(),
      duration: duration.trim(),
      startDate: calcStartDate,
      endDate: calcEndDate,
      issueDate: formattedIssueDate,
      amount: 0,
      currency: 'INR',
      razorpayOrderId: `admin_grant_${Date.now()}`,
      razorpayPaymentId: `pay_admin_free_${Date.now()}`,
      status: 'ISSUED',
      isLocked: true,
      verificationUrl,
      qrCodeDataUrl,
      metadata: {
        issuedBy: 'ADMIN_GRANT',
        grantedAt: now.toISOString()
      }
    };

    const savedRecord = await saveCertificate(certificatePayload);

    console.log(`[Admin] Issued 100% Free Certificate ${certId} for ${studentName} (${domain}, ${duration})`);

    res.json({
      success: true,
      message: 'Certificate issued successfully via Admin Grant (₹0).',
      certificate: savedRecord,
      verificationUrl
    });
  } catch (err) {
    console.error('[API] /admin/issue-free-certificate error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to issue free certificate.' });
  }
});

// GET /api/admin/certificates - List all issued certificates
router.get('/admin/certificates', adminRateLimiter, async (req, res) => {
  try {
    const secret = req.headers['x-admin-secret'] || req.query.secret;
    if (!verifyAdminSecret(secret)) {
      return res.status(403).json({ success: false, message: 'Invalid Admin Secret Key.' });
    }

    const list = await getAllCertificates(150);
    res.json({
      success: true,
      count: list.length,
      certificates: list
    });
  } catch (err) {
    console.error('[API] /admin/certificates error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve certificates.' });
  }
});

module.exports = router;

