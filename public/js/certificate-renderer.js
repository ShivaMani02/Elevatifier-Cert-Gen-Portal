/**
 * Elevatifier Luxury Executive Certificate 2D Canvas Engine
 * Renders high-fidelity, gallery-ready 300 DPI A4 Landscape Certificates (3000 x 2121 px)
 * Designed for Elevatifier Technologies Pvt. Ltd. (Founder: Shivansh Vasu)
 * Base Verification Registry: https://certify.elevatifier.com
 */

window.CertificateRenderer = {
  WIDTH: 3000,
  HEIGHT: 2121,

  /**
   * Render the complete luxury certificate onto an HTML5 Canvas element
   * @param {HTMLCanvasElement} canvas 
   * @param {Object} cert 
   * @returns {Promise<void>}
   */
  async render(canvas, cert) {
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font loading check completed with warning:', e);
      }
    }
    canvas.width = this.WIDTH;
    canvas.height = this.HEIGHT;
    const ctx = canvas.getContext('2d');

    // 1. Luxury Ivory-Pearl Radial Gradient Background with Soft Vignette
    this.drawBackground(ctx);

    // 2. High-Precision Banknote Security Guilloche Pattern & Watermark
    this.drawSecurityGuilloche(ctx);

    // 3. Multi-Layered Royal Navy & Metallic Gold Ornamental Borders & Filigrees
    this.drawOrnamentalBorders(ctx);

    // 4. Header & Official Elevatifier Logo & Accreditation Titles
    await this.drawHeader(ctx);

    // 5. Candidate Name, Academic Affiliation, Duration Pill & Domain Citations
    this.drawContent(ctx, cert);

    // 6. Authorized Signatures, Embossed 3D Gold Seal, Dynamic QR & Recognitions Strip
    await this.drawFooterAndSecurity(ctx, cert);
  },

  /**
   * Draw luxury ivory parchment gradient background with corner vignette
   */
  drawBackground(ctx) {
    const centerX = this.WIDTH / 2;
    const centerY = this.HEIGHT / 2;

    // Luxurious radial ivory-pearl gradient with soft perimeter vignette
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 200, centerX, centerY, 1750);
    bgGradient.addColorStop(0, '#ffffff');
    bgGradient.addColorStop(0.3, '#fdfcf8');
    bgGradient.addColorStop(0.65, '#f8f4e7');
    bgGradient.addColorStop(0.85, '#f1ebda');
    bgGradient.addColorStop(1, '#e7dfc7');

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
  },

  /**
   * Draw bank-grade guilloche micro-wave watermark & brand security imprint
   */
  drawSecurityGuilloche(ctx) {
    ctx.save();
    const centerX = this.WIDTH / 2;
    const centerY = this.HEIGHT / 2 + 30;

    // 1. Primary Mathematical Guilloche Rosette Curves (24-Lobe Epicycloid)
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.048)';
    ctx.lineWidth = 1.3;

    for (let r = 140; r <= 880; r += 32) {
      ctx.beginPath();
      for (let theta = 0; theta < Math.PI * 2; theta += 0.015) {
        const radius = r + 14 * Math.sin(theta * 16) * Math.cos(theta * 8);
        const x = centerX + radius * Math.cos(theta);
        const y = centerY + radius * Math.sin(theta);
        if (theta === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // 2. Secondary Harmonic Micro-Curves (Midnight Navy Accent)
    ctx.strokeStyle = 'rgba(6, 14, 28, 0.022)';
    ctx.lineWidth = 1;
    for (let r = 180; r <= 820; r += 44) {
      ctx.beginPath();
      for (let theta = 0; theta < Math.PI * 2; theta += 0.02) {
        const radius = r + 11 * Math.cos(theta * 24);
        const x = centerX + radius * Math.cos(theta);
        const y = centerY + radius * Math.sin(theta);
        if (theta === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // 3. Banknote Continuous Sine-Wave Security Grid across entire certificate
    ctx.strokeStyle = 'rgba(6, 14, 28, 0.014)';
    ctx.lineWidth = 0.9;
    for (let y = 140; y < this.HEIGHT - 140; y += 36) {
      ctx.beginPath();
      for (let x = 120; x < this.WIDTH - 120; x += 22) {
        const yOffset = Math.sin((x + y) * 0.013) * 7;
        if (x === 120) ctx.moveTo(x, y + yOffset);
        else ctx.lineTo(x, y + yOffset);
      }
      ctx.stroke();
    }

    // 4. Center Brand Security Watermark
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 150px "Cinzel", "Times New Roman", serif';
    ctx.fillStyle = 'rgba(6, 14, 28, 0.024)';
    ctx.letterSpacing = '14px';
    ctx.fillText('ELEVATIFIER', centerX, centerY - 15);

    ctx.restore();
  },

  /**
   * Draw Multi-Layered Royal Navy and Metallic Gold Borders with Corner & Midpoint Filigrees
   */
  drawOrnamentalBorders(ctx) {
    ctx.save();
    const margin = 64;
    const innerMargin = 88;
    const coreMargin = 104;
    const hairlineMargin = 112;

    // 1. Outer Deep Royal Navy Border
    ctx.strokeStyle = '#060d1b';
    ctx.lineWidth = 14;
    ctx.strokeRect(margin, margin, this.WIDTH - margin * 2, this.HEIGHT - margin * 2);

    // 2. Metallic Gold Accent Frame with Lustrous Multi-Stop Gradient
    const goldGrad = ctx.createLinearGradient(margin, margin, this.WIDTH - margin, this.HEIGHT - margin);
    goldGrad.addColorStop(0, '#966e0a');
    goldGrad.addColorStop(0.18, '#f7df8d');
    goldGrad.addColorStop(0.38, '#d4af37');
    goldGrad.addColorStop(0.58, '#fff9d6');
    goldGrad.addColorStop(0.8, '#c69214');
    goldGrad.addColorStop(1, '#805c03');

    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 4.5;
    ctx.strokeRect(innerMargin, innerMargin, this.WIDTH - innerMargin * 2, this.HEIGHT - innerMargin * 2);

    // 3. Inner Fine Pinstripe Navy Frame
    ctx.strokeStyle = '#060d1b';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(coreMargin, coreMargin, this.WIDTH - coreMargin * 2, this.HEIGHT - coreMargin * 2);

    // 4. Inner Hairline Gold Frame
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(hairlineMargin, hairlineMargin, this.WIDTH - hairlineMargin * 2, this.HEIGHT - hairlineMargin * 2);

    // 5. Ornate Corner Filigrees
    this.drawCornerFiligree(ctx, margin + 24, margin + 24, 0);
    this.drawCornerFiligree(ctx, this.WIDTH - margin - 24, margin + 24, Math.PI / 2);
    this.drawCornerFiligree(ctx, this.WIDTH - margin - 24, this.HEIGHT - margin - 24, Math.PI);
    this.drawCornerFiligree(ctx, margin + 24, this.HEIGHT - margin - 24, -Math.PI / 2);

    // 6. Mid-Edge Diamond Flourishes
    this.drawEdgeCrest(ctx, this.WIDTH / 2, margin + 24, 0);
    this.drawEdgeCrest(ctx, this.WIDTH / 2, this.HEIGHT - margin - 24, Math.PI);
    this.drawEdgeCrest(ctx, margin + 24, this.HEIGHT / 2, -Math.PI / 2);
    this.drawEdgeCrest(ctx, this.WIDTH - margin - 24, this.HEIGHT / 2, Math.PI / 2);

    ctx.restore();
  },

  /**
   * Draw ornate corner filigree rosette with nested gold diamonds
   */
  drawCornerFiligree(ctx, x, y, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.strokeStyle = '#d4af37';
    ctx.fillStyle = '#060d1b';
    ctx.lineWidth = 2.5;

    // Corner nested squares
    ctx.strokeRect(0, 0, 56, 56);
    ctx.fillRect(8, 8, 40, 40);

    // Inner 24k gold diamond
    ctx.fillStyle = '#fced9e';
    ctx.beginPath();
    ctx.moveTo(28, 14);
    ctx.lineTo(42, 28);
    ctx.lineTo(28, 42);
    ctx.lineTo(14, 28);
    ctx.closePath();
    ctx.fill();

    // Corner brackets extending outward
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(76, 4);
    ctx.lineTo(4, 4);
    ctx.lineTo(4, 76);
    ctx.stroke();

    // Extended botanical scroll flourish line
    ctx.beginPath();
    ctx.moveTo(88, 4);
    ctx.lineTo(76, 4);
    ctx.moveTo(4, 76);
    ctx.lineTo(4, 88);
    ctx.stroke();

    // Center tiny gold diamond accent
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.moveTo(28, 24);
    ctx.lineTo(32, 28);
    ctx.lineTo(28, 32);
    ctx.lineTo(24, 28);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  },

  /**
   * Draw mid-edge diamond crest on border
   */
  drawEdgeCrest(ctx, x, y, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(10, 0);
    ctx.lineTo(0, 10);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#060d1b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-24, 0);
    ctx.lineTo(-12, 0);
    ctx.moveTo(12, 0);
    ctx.lineTo(24, 0);
    ctx.stroke();

    ctx.restore();
  },

  /**
   * Draw Official Elevatifier Logo & Header Typography
   */
  async drawHeader(ctx) {
    const centerX = this.WIDTH / 2;

    // 1. Draw Official Elevatifier Logo
    let logoDrawn = false;
    try {
      const logoImg = await this.loadImage('/Elevatifier-logo.png');
      if (logoImg && logoImg.width) {
        const targetHeight = 120;
        const targetWidth = (logoImg.width / logoImg.height) * targetHeight;
        ctx.drawImage(logoImg, centerX - targetWidth / 2, 142, targetWidth, targetHeight);
        logoDrawn = true;
      }
    } catch (err) {
      console.warn('Could not load /Elevatifier-logo.png on canvas, using vector crest fallback:', err);
    }

    if (!logoDrawn) {
      // Elegant Fallback Crest
      ctx.save();
      ctx.translate(centerX, 195);
      ctx.fillStyle = '#071120';
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#f3d068';
      ctx.font = 'bold 40px "Cinzel", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('E', 0, 2);
      ctx.restore();
    }

    // 2. Brand Name Title
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '800 48px "Cinzel", "Times New Roman", serif';
    ctx.fillStyle = '#071120';
    ctx.letterSpacing = '8px';
    ctx.fillText('ELEVATIFIER TECHNOLOGIES', centerX, 296);

    // 3. Institutional Accreditation Subtitle
    ctx.font = '700 19px "Outfit", sans-serif';
    ctx.fillStyle = '#b38714';
    ctx.letterSpacing = '3.5px';
    ctx.fillText('★  ACCREDITED BY DPIIT (GOVT. OF INDIA) • STARTUP INDIA • ISO 9001:2015 CERTIFIED INSTITUTION  ★', centerX, 336);

    // 4. Majestic Main Certificate Title
    ctx.font = '900 84px "Cinzel", "Times New Roman", serif';
    ctx.fillStyle = '#071120';
    ctx.letterSpacing = '8px';
    ctx.fillText('CERTIFICATE OF INTERNSHIP', centerX, 436);

    // 5. Luxury Divider with Gold Diamond Center
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(centerX - 460, 474);
    ctx.lineTo(centerX - 35, 474);
    ctx.moveTo(centerX + 35, 474);
    ctx.lineTo(centerX + 460, 474);
    ctx.stroke();

    // Central Gold Diamond Crest
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.moveTo(centerX, 465);
    ctx.lineTo(centerX + 9, 474);
    ctx.lineTo(centerX, 483);
    ctx.lineTo(centerX - 9, 474);
    ctx.closePath();
    ctx.fill();

    // Flanking Diamond Dots
    [-460, 460].forEach(offset => {
      ctx.beginPath();
      ctx.moveTo(centerX + offset, 469);
      ctx.lineTo(centerX + offset + 5, 474);
      ctx.lineTo(centerX + offset, 479);
      ctx.lineTo(centerX + offset - 5, 474);
      ctx.closePath();
      ctx.fill();
    });

    ctx.restore();
  },

  /**
   * Draw Candidate Name, Track Pill, and Academic Citations with Optimal Vertical Rhythm
   */
  drawContent(ctx, cert) {
    const centerX = this.WIDTH / 2;

    ctx.save();
    ctx.textAlign = 'center';

    // 1. Preamble Line
    ctx.font = 'italic 500 29px "Georgia", serif';
    ctx.fillStyle = '#475569';
    ctx.letterSpacing = '1.5px';
    ctx.fillText('This is to certify and officially confer that', centerX, 545);

    // 2. Recipient Full Name in Bold Regal Typography with Dynamic Auto-Scale
    const studentName = (cert.studentName || 'Candidate Name').toUpperCase();
    let nameFontSize = 100;
    ctx.font = `bold ${nameFontSize}px "Cinzel", "Times New Roman", serif`;
    let nameWidth = ctx.measureText(studentName).width;
    const maxNameWidth = this.WIDTH - 500;
    while (nameWidth > maxNameWidth && nameFontSize > 44) {
      nameFontSize -= 4;
      ctx.font = `bold ${nameFontSize}px "Cinzel", "Times New Roman", serif`;
      nameWidth = ctx.measureText(studentName).width;
    }
    ctx.fillStyle = '#060e1d';
    ctx.letterSpacing = '3px';
    ctx.fillText(studentName, centerX, 655);

    // Underline beneath candidate name with gold diamond end caps
    const barWidth = Math.min(Math.max(nameWidth / 2 + 70, 280), (this.WIDTH - 440) / 2);
    const underlineY = 690;

    const barGrad = ctx.createLinearGradient(centerX - barWidth, underlineY, centerX + barWidth, underlineY);
    barGrad.addColorStop(0, 'rgba(212, 175, 55, 0.2)');
    barGrad.addColorStop(0.15, '#d4af37');
    barGrad.addColorStop(0.5, '#fced9e');
    barGrad.addColorStop(0.85, '#d4af37');
    barGrad.addColorStop(1, 'rgba(212, 175, 55, 0.2)');

    ctx.strokeStyle = barGrad;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(centerX - barWidth, underlineY);
    ctx.lineTo(centerX + barWidth, underlineY);
    ctx.stroke();

    // Diamond end caps and center diamond on underline
    ctx.fillStyle = '#d4af37';
    [-barWidth, 0, barWidth].forEach(offset => {
      ctx.beginPath();
      ctx.moveTo(centerX + offset, underlineY - 6);
      ctx.lineTo(centerX + offset + 6, underlineY);
      ctx.lineTo(centerX + offset, underlineY + 6);
      ctx.lineTo(centerX + offset - 6, underlineY);
      ctx.closePath();
      ctx.fill();
    });

    // 3. College & Degree Affiliation
    const college = cert.college ? cert.college.trim() : '';
    const degree = cert.degree ? cert.degree.trim() : '';
    let affiliationText = '';
    if (college && degree) {
      affiliationText = `representing ${degree}, ${college}`;
    } else if (college) {
      affiliationText = `representing ${college}`;
    }

    if (affiliationText) {
      let affFontSize = 29;
      ctx.font = `600 ${affFontSize}px "Outfit", sans-serif`;
      let affWidth = ctx.measureText(affiliationText).width;
      while (affWidth > this.WIDTH - 460 && affFontSize > 18) {
        affFontSize -= 2;
        ctx.font = `600 ${affFontSize}px "Outfit", sans-serif`;
        affWidth = ctx.measureText(affiliationText).width;
      }
      ctx.fillStyle = '#334155';
      ctx.fillText(affiliationText, centerX, 748);
    }

    // 4. Citation Statement
    ctx.font = '400 28.5px "Outfit", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('has successfully fulfilled all academic curriculum criteria and completed an intensive', centerX, 818);

    // 5. Distinctive Executive Duration Pill
    const duration = (cert.duration || '3 Months').toUpperCase();
    this.drawDurationBadge(ctx, centerX, 886, duration);

    // 6. Domain Citation
    ctx.font = '500 28px "Outfit", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('in the specialized industry domain of', centerX, 956);

    const domain = (cert.domain || 'Professional Domain').toUpperCase();
    let domFontSize = 56;
    ctx.font = `900 ${domFontSize}px "Cinzel", "Times New Roman", serif`;
    let domWidth = ctx.measureText(domain).width;
    while (domWidth > this.WIDTH - 460 && domFontSize > 32) {
      domFontSize -= 3;
      ctx.font = `900 ${domFontSize}px "Cinzel", "Times New Roman", serif`;
      domWidth = ctx.measureText(domain).width;
    }
    ctx.fillStyle = '#071120';
    ctx.letterSpacing = '3.5px';
    ctx.fillText(domain, centerX, 1030);

    // 7. Performance Commendation & Verified Tenure
    let tenureLine1 = 'During this tenure, the candidate demonstrated exceptional diligence, engineering competency,';
    if (cert.startDate && cert.endDate) {
      tenureLine1 = `Tenure: ${cert.startDate} to ${cert.endDate} • Practical Assessment & Verified Capstone Implementation`;
    }
    ctx.font = '400 25px "Outfit", sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(tenureLine1, centerX, 1105);

    ctx.fillText('Demonstrating exemplary diligence, technical competency, and professional commitment across assigned projects.', centerX, 1148);

    ctx.restore();
  },

  /**
   * Draw executive pill for internship duration
   */
  drawDurationBadge(ctx, x, y, duration) {
    ctx.save();
    const text = `✦   ${duration} ADVANCED PROFESSIONAL INTERNSHIP   ✦`;
    ctx.font = '800 26px "Cinzel", serif';
    ctx.letterSpacing = '2.5px';
    const textWidth = ctx.measureText(text).width;
    const paddingX = 42;
    const height = 52;

    // Pill background
    ctx.fillStyle = '#071120';
    ctx.beginPath();
    ctx.roundRect(x - (textWidth + paddingX * 2) / 2, y - height / 2, textWidth + paddingX * 2, height, 26);
    ctx.fill();

    // Dual Gold Border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(252, 237, 158, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x - (textWidth + paddingX * 2) / 2 + 3, y - height / 2 + 3, textWidth + paddingX * 2 - 6, height - 6, 23);
    ctx.stroke();

    // Glowing Gold Text
    ctx.fillStyle = '#fced9e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 2);

    ctx.restore();
  },

  /**
   * Draw Footer: Government Badges, Authorized Signatory, Official Stamp, 3D Gold Ribbon Seal, Dynamic QR & Verification Strip
   */
  async drawFooterAndSecurity(ctx, cert) {
    const centerX = this.WIDTH / 2;

    // 0. Institutional Recognition Strip (DPIIT, Startup India, Start in UP, MoE Cell, AKTU, Bank of Baroda)
    // Vertically placed at y = 1275px to harmonize canvas proportions
    await this.drawRecognitionBadges(ctx, centerX, 1275);

    const bottomY = 1690;

    // 1. Left Side: Authorized Signatory + Official Security Stamp
    this.drawSignatoryAndStamp(ctx, 520, bottomY);

    // 2. Center: 3D Embossed Metallic Gold Rosette Seal with Ribbons
    this.drawEmbossedGoldSeal(ctx, centerX, bottomY - 35);

    // 3. Right Side: High-Contrast Scannable Dynamic QR Code
    await this.drawSecurityQrCode(ctx, cert, this.WIDTH - 520, bottomY - 15);

    // 4. Bottom Deep Security & Verification Strip
    this.drawBottomSecurityStrip(ctx, cert);
  },

  /**
   * Draw Government & Institutional Partner Recognition Badges on Certificate
   */
  async drawRecognitionBadges(ctx, centerX, y) {
    ctx.save();
    ctx.textAlign = 'center';

    // Header Label
    ctx.font = '800 18px "Cinzel", serif';
    ctx.fillStyle = '#b38714';
    ctx.letterSpacing = '3px';
    ctx.fillText('★  GOVERNMENT ACCREDITED & INSTITUTIONAL RECOGNITIONS  ★', centerX, y);

    // Subtle divider lines flanking the header
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(centerX - 560, y - 6);
    ctx.lineTo(centerX - 330, y - 6);
    ctx.moveTo(centerX + 330, y - 6);
    ctx.lineTo(centerX + 560, y - 6);
    ctx.stroke();

    // 6 official recognition logos
    const logos = [
      { file: '/images/recognitions/dpiit.png', altFile: '/images/recognitions/12.png', name: 'DPIIT' },
      { file: '/images/recognitions/startup-india.png', altFile: '/images/recognitions/11.png', name: 'Startup India' },
      { file: '/images/recognitions/start-in-up.png', altFile: '/images/recognitions/10.png', name: 'Start in UP' },
      { file: '/images/recognitions/moe-cell.png', altFile: '/images/recognitions/8.png', name: 'MoE Cell' },
      { file: '/images/recognitions/aktu.png', altFile: '/images/recognitions/6.png', name: 'AKTU' },
      { file: '/images/recognitions/bank-of-baroda.png', altFile: '/images/recognitions/9.png', name: 'Bank of Baroda' }
    ];

    const totalLogos = logos.length;
    const badgeWidth = 155;
    const badgeHeight = 70;
    const gap = 34;
    const totalRowWidth = (totalLogos * badgeWidth) + ((totalLogos - 1) * gap);
    let startX = centerX - (totalRowWidth / 2);

    for (let i = 0; i < totalLogos; i++) {
      const item = logos[i];
      const bx = startX + i * (badgeWidth + gap);
      const by = y + 26;

      // Draw crisp white card with delicate gold hairline & soft shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(bx, by, badgeWidth, badgeHeight, 10);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx, by, badgeWidth, badgeHeight, 10);
      ctx.stroke();

      let img = null;
      try {
        img = await this.loadImage(item.file);
      } catch (err1) {
        if (item.altFile) {
          try {
            img = await this.loadImage(item.altFile);
          } catch (err2) {}
        }
      }

      if (img && img.width) {
        const maxImgH = badgeHeight - 16;
        const maxImgW = badgeWidth - 20;
        const scale = Math.min(maxImgW / img.width, maxImgH / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, bx + (badgeWidth - dw) / 2, by + (badgeHeight - dh) / 2, dw, dh);
      } else {
        // Fallback text
        ctx.fillStyle = '#071120';
        ctx.font = '700 13px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.name, bx + badgeWidth / 2, by + badgeHeight / 2);
      }
    }

    ctx.restore();
  },

  /**
   * Draw authorized director signature and official institutional circular council stamp
   */
  drawSignatoryAndStamp(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // 1. Authentic Digital Signature Script
    // Prioritizes Great Vibes (Google Font loaded) with Brush Script fallback
    ctx.font = 'normal 74px "Great Vibes", "Brush Script MT", cursive, serif';
    ctx.fillStyle = '#060e1c';
    ctx.textAlign = 'center';
    ctx.fillText('Shivansh Vasu', 0, -38);

    // Signature horizontal line
    ctx.strokeStyle = '#071120';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(-195, 0);
    ctx.lineTo(195, 0);
    ctx.stroke();

    // Gold diamond flourish on signature line ends
    ctx.fillStyle = '#d4af37';
    [-195, 195].forEach(offset => {
      ctx.beginPath();
      ctx.moveTo(offset, -6);
      ctx.lineTo(offset + 6, 0);
      ctx.lineTo(offset, 6);
      ctx.lineTo(offset - 6, 0);
      ctx.closePath();
      ctx.fill();
    });

    // Signatory credentials
    ctx.font = '800 22px "Cinzel", serif';
    ctx.fillStyle = '#071120';
    ctx.letterSpacing = '1.8px';
    ctx.fillText('SHIVANSH VASU', 0, 32);

    ctx.font = '700 16px "Outfit", sans-serif';
    ctx.fillStyle = '#b38714';
    ctx.letterSpacing = '1px';
    ctx.fillText('Founder & Managing Director', 0, 56);

    ctx.font = '500 15px "Outfit", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.letterSpacing = '0.5px';
    ctx.fillText('Elevatifier Technologies Pvt. Ltd.', 0, 78);

    // 2. Official Circular Authentication Council Stamp (Crimson Red Watermark)
    ctx.translate(105, -72);
    ctx.rotate(-0.19);

    ctx.strokeStyle = 'rgba(185, 28, 28, 0.48)';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(0, 0, 68, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(185, 28, 28, 0.32)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(0, 0, 58, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(185, 28, 28, 0.65)';
    ctx.font = '800 11px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★ ELEVATIFIER TECHNOLOGIES ★', 0, -34);
    ctx.fillText('OFFICIALLY VERIFIED', 0, 0);
    ctx.fillText('ACADEMIC COUNCIL', 0, 34);

    ctx.restore();
  },

  /**
   * Draw high-fidelity 3D metallic gold rosette seal with hanging satin ribbons
   */
  drawEmbossedGoldSeal(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Luxury Satin Ribbons extending downward
    // Left ribbon tail (Royal Navy with Gold Edge)
    ctx.fillStyle = '#081730';
    ctx.beginPath();
    ctx.moveTo(-45, 60);
    ctx.lineTo(-78, 185);
    ctx.lineTo(-42, 162);
    ctx.lineTo(-6, 185);
    ctx.lineTo(-15, 60);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#b38714';
    ctx.beginPath();
    ctx.moveTo(-45, 60);
    ctx.lineTo(-78, 185);
    ctx.lineTo(-72, 185);
    ctx.lineTo(-42, 162);
    ctx.lineTo(-42, 165);
    ctx.closePath();
    ctx.fill();

    // Right ribbon tail (Royal Gold with Navy Core)
    ctx.fillStyle = '#b38714';
    ctx.beginPath();
    ctx.moveTo(45, 60);
    ctx.lineTo(78, 185);
    ctx.lineTo(42, 162);
    ctx.lineTo(6, 185);
    ctx.lineTo(15, 60);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#081730';
    ctx.beginPath();
    ctx.moveTo(35, 60);
    ctx.lineTo(65, 178);
    ctx.lineTo(42, 162);
    ctx.lineTo(18, 178);
    ctx.lineTo(22, 60);
    ctx.closePath();
    ctx.fill();

    // 36-Point Starburst Rosette Badge
    const numPoints = 36;
    const outerR = 108;
    const innerR = 98;

    ctx.beginPath();
    for (let i = 0; i < numPoints * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / numPoints;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = '#d4af37';
    ctx.fill();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = '#8f6707';
    ctx.stroke();

    // 3D Metallic Gold Center Medallion
    const grad = ctx.createRadialGradient(-26, -26, 10, 0, 0, 92);
    grad.addColorStop(0, '#fffde8');
    grad.addColorStop(0.28, '#f7df8d');
    grad.addColorStop(0.68, '#d4af37');
    grad.addColorStop(1, '#8c6405');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 88, 0, Math.PI * 2);
    ctx.fill();

    // Inner Concentric Engraving Rings
    ctx.strokeStyle = '#7c5b07';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 77, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 72, 0, Math.PI * 2);
    ctx.stroke();

    // Seal Engraved Text
    ctx.fillStyle = '#071120';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 13px "Cinzel", serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('ELEVATIFIER', 0, -32);

    ctx.font = '900 19px "Cinzel", serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('SEAL OF', 0, -8);
    ctx.fillText('AUTHENTICITY', 0, 16);

    ctx.font = 'bold 12px "Outfit", sans-serif';
    ctx.fillStyle = '#7c5b07';
    ctx.fillText('★ VERIFIED ★', 0, 42);

    ctx.font = 'bold 10px "Outfit", sans-serif';
    ctx.fillText('ISO 9001:2015', 0, 57);

    ctx.restore();
  },

  /**
   * Draw crisp scannable QR Code card and serial metadata
   */
  async drawSecurityQrCode(ctx, cert, x, y) {
    ctx.save();
    ctx.textAlign = 'center';

    const qrSize = 205;
    const qrX = x - qrSize / 2;
    const qrY = y - 135;

    // Solid white background card with double gold/navy border for flawless camera scanning
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 10);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 10);
    ctx.stroke();

    ctx.strokeStyle = '#071120';
    ctx.lineWidth = 1;
    ctx.strokeRect(qrX - 7, qrY - 7, qrSize + 14, qrSize + 14);

    // Draw QR code image
    if (cert.qrCodeDataUrl) {
      try {
        const qrImg = await this.loadImage(cert.qrCodeDataUrl);
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      } catch (err) {
        console.warn('Could not render QR code:', err);
      }
    }

    // High-visibility Certificate ID & Issue Date
    ctx.font = '800 24px "Outfit", monospace';
    ctx.fillStyle = '#071120';
    ctx.letterSpacing = '1.5px';
    ctx.fillText(`ID: ${cert.certificateId || 'ELV-2026-XXXXXX'}`, x, y + 106);

    ctx.font = '600 18px "Outfit", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Issued: ${cert.issueDate || 'DD MMM YYYY'}`, x, y + 134);

    ctx.font = 'bold 13px "Outfit", sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText('● CRYPTOGRAPHICALLY AUTHENTICATED', x, y + 156);

    ctx.restore();
  },

  /**
   * Draw Bottom Security & Verification URL Strip
   */
  drawBottomSecurityStrip(ctx, cert) {
    const stripY = this.HEIGHT - 105;
    const centerX = this.WIDTH / 2;

    ctx.save();
    ctx.textAlign = 'center';

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(170, stripY - 22);
    ctx.lineTo(this.WIDTH - 170, stripY - 22);
    ctx.stroke();

    const verifyDomain = cert.verificationUrl || `https://certify.elevatifier.com/verify/${cert.certificateId || 'ID'}`;

    ctx.font = '700 22px "Outfit", sans-serif';
    ctx.fillStyle = '#0284c7';
    ctx.fillText(`PUBLIC VERIFICATION REGISTRY: ${verifyDomain}`, centerX, stripY + 2);

    ctx.font = '500 16px "Outfit", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Official Credential of Elevatifier Technologies • Academic Verification Desk: contact@elevatifier.com', centerX, stripY + 28);

    ctx.restore();
  },

  /**
   * Utility to load an image from DataURL / URL as a Promise
   */
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  },

  /**
   * Direct download helper - saves high-res PNG into student gallery/downloads
   */
  downloadAsImage(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename || 'Elevatifier_Internship_Certificate.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
