# Elevatifier - Official Internship Certificate Generation & Verification Portal

A production-ready, monolithic web platform engineered for **Elevatifier** to issue, cryptographically verify, and archive official internship certificates. Built for seamless zero-clash deployment on a **Free Render Pod** with **MongoDB Atlas** persistence and **Razorpay** payment gateway integration.

---

## 🌟 Key Features

1. **Student Registration & Strict Duration Enforcement**:
   - Captures Full Name, Email, Mobile/WhatsApp Number, College/University, Degree/Branch, and Domain.
   - Durations are strictly restricted to college-approved tenures: **`3 Months`**, **`6 Months`**, or **`9 Months`**.
2. **Seamless Razorpay Payment Integration (₹399)**:
   - Collects ₹399 via official Razorpay modal checkout.
   - Cryptographic HMAC SHA-256 signature verification protects against tampering and replay attacks.
   - Built-in **Sandbox/Simulation Mode** allows end-to-end testing when API keys are not yet configured.
3. **Guaranteed Data Immutability**:
   - Once payment is verified, the record is locked (`isLocked: true`).
   - Mongoose pre-update hooks and storage guards prohibit altering candidate names, domains, tenures, or issue dates post-issuance.
4. **Ultra-High-Resolution Gallery Image Export**:
   - 3000 x 2121 px (300 DPI A4 landscape) HTML5 Canvas 2D engine.
   - Direct 1-click **Download Certificate (Image)** saving high-clarity PNG files directly to student phone galleries or desktops.
5. **Scannable Dynamic QR Code & Verification Subdomain**:
   - Dynamic QR Code embedded directly onto the certificate image.
   - Verification link (`https://verify.elevatifier.com/verify/:id` or your Render domain).
   - Dedicated Public Verification Portal (`/verify` & `/verify/:id`) for recruiters and college administrations to validate credentials.
6. **Persistent MongoDB Cloud Storage with Offline Fallback**:
   - Permanent storage via `MONGODB_URI` (MongoDB Atlas).
   - Local fallback storage in `./data/certificates.json` ensures the application runs immediately offline during development without database setup friction.
7. **Free Render Pod Anti-Sleep Keep-Alive Pinger**:
   - Includes a background self-pinger service that pings `/healthz` every 13 minutes, preventing free Render pods from spinning down after 15 minutes of inactivity.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials (or leave blank to run in Sandbox/Demo mode):
```env
PORT=3000
BASE_URL=http://localhost:3000
MONGODB_URI=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
KEEP_ALIVE=false
```

### 3. Start Server
```bash
npm start
```
Visit: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploying on Free Render Pod

### Option A: Render Blueprint (1-Click)
1. Push this repository to GitHub or GitLab.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** -> **Blueprint**.
3. Select this repository. Render will automatically read `render.yaml`.
4. Fill in your environment variables in the Render settings:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `RAZORPAY_KEY_ID`: Your Razorpay Key ID (`rzp_live_...` or `rzp_test_...`).
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret.
   - `BASE_URL`: `https://verify.elevatifier.com` (or your Render URL `https://elevatifier-cert.onrender.com`).
   - `KEEP_ALIVE`: `true` (keeps your free pod awake 24/7).

### Option B: Manual Web Service on Render
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/healthz`

---

## 🔗 Custom Subdomain Setup (`certify.elevatifier.com`)

To link `certify.elevatifier.com` to your Render service:
1. Go to your Render Web Service -> **Settings** -> **Custom Domains**.
2. Add `certify.elevatifier.com`.
3. In your DNS provider (e.g. Cloudflare, GoDaddy, Namecheap), add a **CNAME** record:
   - **Type**: `CNAME`
   - **Name / Host**: `certify`
   - **Target / Value**: Your Render URL (e.g. `elevatifier-cert-portal.onrender.com`).
4. Update `BASE_URL` in your Render Environment Variables to:
   ```env
   BASE_URL=https://certify.elevatifier.com
   ```
Now, all generated certificates will print and embed QR codes pointing directly to `https://certify.elevatifier.com/verify/ELV-2026-XXXXXX`!

---

## 🧪 Testing Verification Routes
- Issue a certificate through the portal.
- Scan the embedded QR Code using any smartphone camera.
- Or open:
  ```
  http://localhost:3000/verify/<CERTIFICATE_ID>
  ```
  to inspect the green official verification seal and re-download the certificate.
