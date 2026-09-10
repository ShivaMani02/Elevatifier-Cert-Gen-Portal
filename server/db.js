const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers (Google / Cloudflare) to prevent SRV query issues on local networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if custom DNS servers cannot be set in restricted environments
}

let CertificateModel = null;
let useMongo = false;

// In-Memory store for temporary offline testing if MONGODB_URI is omitted (no data/ folder needed)
const inMemoryStore = [];

async function initDb() {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && mongoUri.trim().length > 0) {
    try {
      console.log('[DB] Connecting to MongoDB Atlas...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
      });
      CertificateModel = require('./models/Certificate');
      useMongo = true;
      console.log('[DB] Successfully connected to MongoDB Atlas! Using cloud database.');
      return { type: 'mongodb' };
    } catch (err) {
      console.warn('[DB] MongoDB connection failed:', err.message);
      console.warn('[DB] Operating in memory-only mode until MongoDB is configured.');
      useMongo = false;
      return { type: 'memory', warning: err.message };
    }
  } else {
    console.log('[DB] No MONGODB_URI configured. Operating in memory-only mode for development. Paste MONGODB_URI in .env or Render settings to persist in MongoDB Atlas.');
    useMongo = false;
    return { type: 'memory' };
  }
}

async function saveCertificate(certData) {
  if (useMongo && CertificateModel) {
    const existing = await CertificateModel.findOne({ certificateId: certData.certificateId });
    if (existing) {
      throw new Error(`Certificate with ID ${certData.certificateId} already exists and is immutable.`);
    }
    const cert = new CertificateModel({
      ...certData,
      isLocked: true
    });
    const saved = await cert.save();
    return saved.toObject();
  } else {
    const cleanId = certData.certificateId.toUpperCase();
    const existing = inMemoryStore.find(c => c.certificateId.toUpperCase() === cleanId);
    if (existing) {
      throw new Error(`Certificate with ID ${certData.certificateId} already exists and is immutable.`);
    }
    const record = {
      ...certData,
      isLocked: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inMemoryStore.push(record);
    return record;
  }
}

async function getCertificateById(certificateId) {
  if (!certificateId) return null;
  const cleanId = certificateId.trim().toUpperCase();
  if (useMongo && CertificateModel) {
    const cert = await CertificateModel.findOne({ certificateId: cleanId }).lean();
    return cert;
  } else {
    const cert = inMemoryStore.find(c => c.certificateId && c.certificateId.toUpperCase() === cleanId);
    return cert || null;
  }
}

async function isOrderIdProcessed(orderId) {
  if (!orderId) return false;
  if (useMongo && CertificateModel) {
    const count = await CertificateModel.countDocuments({ razorpayOrderId: orderId });
    return count > 0;
  } else {
    return inMemoryStore.some(c => c.razorpayOrderId === orderId);
  }
}

async function searchCertificates(query) {
  if (!query) return [];
  const q = query.trim();
  if (useMongo && CertificateModel) {
    const results = await CertificateModel.find({
      $or: [
        { certificateId: { $regex: q, $options: 'i' } },
        { studentName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).limit(20).lean();
    return results;
  } else {
    const lower = q.toLowerCase();
    return inMemoryStore.filter(c => 
      (c.certificateId && c.certificateId.toLowerCase().includes(lower)) ||
      (c.studentName && c.studentName.toLowerCase().includes(lower)) ||
      (c.email && c.email.toLowerCase().includes(lower))
    ).slice(0, 20);
  }
}

async function getAllCertificates(limit = 100) {
  if (useMongo && CertificateModel) {
    const list = await CertificateModel.find().sort({ createdAt: -1 }).limit(limit).lean();
    return list;
  } else {
    return inMemoryStore.slice(-limit).reverse();
  }
}

function getDatabaseStatus() {
  return {
    provider: useMongo ? 'MongoDB Atlas' : 'In-Memory (Awaiting MONGODB_URI)',
    connected: useMongo ? mongoose.connection.readyState === 1 : true
  };
}

module.exports = {
  initDb,
  saveCertificate,
  getCertificateById,
  isOrderIdProcessed,
  searchCertificates,
  getAllCertificates,
  getDatabaseStatus
};
