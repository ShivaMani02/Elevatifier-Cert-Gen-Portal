
window.CertificateRenderer = {
  WIDTH: 2480,
  HEIGHT: 1754,

  // ─── Refined Luxury Palette ─────────────────────────────
  COLORS: {
    navy: '#081426', // Deep Royal Navy (higher contrast & prestige)
    navyLight: '#162a45',
    navySlate: '#1e3a5f',
    gold: '#c5993a', // Classic Polished Gold
    goldLight: '#e8c96a',
    goldBright: '#f5dc88',
    goldDark: '#8a6914',
    goldPale: '#faf6eb',
    white: '#ffffff',
    offWhite: '#fafaf7',
    creamCard: '#fdfcf9',
    textDark: '#081426',
    textBody: '#1e293b',
    textSlate: '#334155',
    textMuted: '#475569',
    borderGold: 'rgba(197, 153, 58, 0.50)',
    borderSubtle: 'rgba(8, 20, 38, 0.08)',
    greenBadge: '#059669',
  },

  /**
   * Main render pipeline
   */
  async render(canvas, cert) {
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (e) {
        console.warn('Font preload warning:', e);
      }
    }

    canvas.width = this.WIDTH;
    canvas.height = this.HEIGHT;
    const ctx = canvas.getContext('2d');

    // Pipeline: Background → Borders & Flanks → Header → Body → Recognitions → Footer
    this.drawBackground(ctx);
    this.drawBorders(ctx);
    this.drawFlankDecorativeElements(ctx);
    await this.drawHeader(ctx);
    this.drawBodyContent(ctx, cert);
    await this.drawRecognitionStrip(ctx);
    await this.drawFooterSection(ctx, cert);
  },


  // ═══════════════════════════════════════════════════════
  //  1. BACKGROUND — Pure White with Micro Security Texture
  // ═══════════════════════════════════════════════════════

  drawBackground(ctx) {
    const W = this.WIDTH, H = this.HEIGHT;
    const cx = W / 2, cy = H / 2;

    // Pure crisp white base
    ctx.fillStyle = this.COLORS.white;
    ctx.fillRect(0, 0, W, H);

    // Warm radial glow in center for depth
    const warmGlow = ctx.createRadialGradient(cx, cy, 120, cx, cy, 1180);
    warmGlow.addColorStop(0, 'rgba(255, 252, 245, 0.45)');
    warmGlow.addColorStop(0.6, 'rgba(255, 254, 250, 0.18)');
    warmGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = warmGlow;
    ctx.fillRect(0, 0, W, H);

    // Faint security watermark in center
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 132px "Cinzel", serif';
    ctx.fillStyle = 'rgba(8, 20, 38, 0.015)';
    ctx.fillText('ELEVATIFIER', cx, cy - 25);
    ctx.font = '700 34px "Outfit", sans-serif';
    ctx.letterSpacing = '8px';
    ctx.fillStyle = 'rgba(197, 153, 58, 0.025)';
    ctx.fillText('AUTHENTICATED CREDENTIAL', cx, cy + 60);
    ctx.restore();

    // Subtle security concentric arcs
    ctx.save();
    ctx.strokeStyle = 'rgba(197, 153, 58, 0.020)';
    ctx.lineWidth = 0.8;
    for (let r = 240; r <= 880; r += 60) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },


  // ═══════════════════════════════════════════════════════
  //  2. BORDERS — Master Diploma Ornate Security Frame
  // ═══════════════════════════════════════════════════════

  drawBorders(ctx) {
    const W = this.WIDTH, H = this.HEIGHT;
    const C = this.COLORS;

    // Tier 1: Outermost Deep Navy Frame (8px)
    ctx.strokeStyle = C.navy;
    ctx.lineWidth = 8;
    ctx.strokeRect(34, 34, W - 68, H - 68);

    // Tier 2: Ornate Running Gold Dentil & Diamond Chain (between 44px and 52px)
    this._drawRunningDentilBorder(ctx);

    // Tier 3: Rich Gold Gradient Outer Frame (3.5px at 56px)
    const goldGrad = ctx.createLinearGradient(56, 56, W - 56, H - 56);
    goldGrad.addColorStop(0, '#8a6914');
    goldGrad.addColorStop(0.18, '#e8c96a');
    goldGrad.addColorStop(0.48, '#c5993a');
    goldGrad.addColorStop(0.82, '#f0d88a');
    goldGrad.addColorStop(1, '#8a6914');
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 3.5;
    ctx.strokeRect(56, 56, W - 112, H - 112);

    // Tier 4: Navy Pinstripe Frame (1.6px at 66px)
    ctx.strokeStyle = C.navy;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(66, 66, W - 132, H - 132);

    // Tier 5: Inner Gold Hairline Frame (0.8px at 72px)
    ctx.strokeStyle = C.borderGold;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(72, 72, W - 144, H - 144);

    // Tier 6: Elaborate Guilloché & Filigree Corner Ornaments
    this._drawOrnateCornerFlourishes(ctx);

    // Tier 7: Mid-edge Ornate Diamond Clusters
    this._drawMidEdgeMedallions(ctx);
  },

  /**
   * Continuous repeating ornate gold diamond dentil chain along all 4 edges
   */
  _drawRunningDentilBorder(ctx) {
    const W = this.WIDTH, H = this.HEIGHT;
    const C = this.COLORS;
    const yTop = 45;
    const yBot = H - 45;
    const xLeft = 45;
    const xRight = W - 45;
    const step = 20;

    ctx.save();
    ctx.fillStyle = C.gold;

    // Top & Bottom running diamond chains
    for (let x = 80; x <= W - 80; x += step) {
      // Top diamond
      ctx.beginPath();
      ctx.moveTo(x, yTop - 3.5);
      ctx.lineTo(x + 3.5, yTop);
      ctx.lineTo(x, yTop + 3.5);
      ctx.lineTo(x - 3.5, yTop);
      ctx.closePath();
      ctx.fill();

      // Top micro-dot
      if (x + step / 2 <= W - 80) {
        ctx.beginPath();
        ctx.arc(x + step / 2, yTop, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bottom diamond
      ctx.beginPath();
      ctx.moveTo(x, yBot - 3.5);
      ctx.lineTo(x + 3.5, yBot);
      ctx.lineTo(x, yBot + 3.5);
      ctx.lineTo(x - 3.5, yBot);
      ctx.closePath();
      ctx.fill();

      // Bottom micro-dot
      if (x + step / 2 <= W - 80) {
        ctx.beginPath();
        ctx.arc(x + step / 2, yBot, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Left & Right running diamond chains
    for (let y = 80; y <= H - 80; y += step) {
      // Left diamond
      ctx.beginPath();
      ctx.moveTo(xLeft - 3.5, y);
      ctx.lineTo(xLeft, y - 3.5);
      ctx.lineTo(xLeft + 3.5, y);
      ctx.lineTo(xLeft, y + 3.5);
      ctx.closePath();
      ctx.fill();

      // Left micro-dot
      if (y + step / 2 <= H - 80) {
        ctx.beginPath();
        ctx.arc(xLeft, y + step / 2, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Right diamond
      ctx.beginPath();
      ctx.moveTo(xRight - 3.5, y);
      ctx.lineTo(xRight, y - 3.5);
      ctx.lineTo(xRight + 3.5, y);
      ctx.lineTo(xRight, y + 3.5);
      ctx.closePath();
      ctx.fill();

      // Right micro-dot
      if (y + step / 2 <= H - 80) {
        ctx.beginPath();
        ctx.arc(xRight, y + step / 2, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  },

  /**
   * Ornate diploma corner filigree: concentric arcs + multi-tier brackets + 8-point stars
   */
  _drawOrnateCornerFlourishes(ctx) {
    const W = this.WIDTH, H = this.HEIGHT;
    const C = this.COLORS;
    const m = 50;
    const armLen = 85;

    const corners = [
      { x: m, y: m, dx: 1, dy: 1, startAngle: 0, endAngle: Math.PI / 2 },
      { x: W - m, y: m, dx: -1, dy: 1, startAngle: Math.PI / 2, endAngle: Math.PI },
      { x: W - m, y: H - m, dx: -1, dy: -1, startAngle: Math.PI, endAngle: 3 * Math.PI / 2 },
      { x: m, y: H - m, dx: 1, dy: -1, startAngle: 3 * Math.PI / 2, endAngle: Math.PI * 2 },
    ];

    ctx.save();
    corners.forEach(c => {
      // Concentric security guilloché quarter-arcs
      ctx.strokeStyle = 'rgba(197, 153, 58, 0.35)';
      ctx.lineWidth = 1;
      [22, 34, 46, 58].forEach(r => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, c.startAngle, c.endAngle);
        ctx.stroke();
      });

      // Outer gold L-bracket
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(c.x + c.dx * armLen, c.y);
      ctx.lineTo(c.x, c.y);
      ctx.lineTo(c.x, c.y + c.dy * armLen);
      ctx.stroke();

      // Inner gold L-bracket
      const inOff = 12;
      ctx.strokeStyle = C.goldLight;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(c.x + c.dx * (armLen - 10), c.y + c.dy * inOff);
      ctx.lineTo(c.x + c.dx * inOff, c.y + c.dy * inOff);
      ctx.lineTo(c.x + c.dx * inOff, c.y + c.dy * (armLen - 10));
      ctx.stroke();

      // 8-Point Gold Star Rosette at corner vertex
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.fillStyle = C.gold;
      const numPts = 8;
      const outerR = 9;
      const innerR = 4;
      ctx.beginPath();
      for (let i = 0; i < numPts * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / numPts;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // End finials on bracket arms
      [
        { fx: c.x + c.dx * armLen, fy: c.y },
        { fx: c.x, fy: c.y + c.dy * armLen },
      ].forEach(f => {
        ctx.fillStyle = C.gold;
        ctx.beginPath();
        ctx.arc(f.fx, f.fy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    ctx.restore();
  },

  /**
   * Mid-edge ornate diamond crests at Top, Bottom, Left, and Right centers
   */
  _drawMidEdgeMedallions(ctx) {
    const W = this.WIDTH, H = this.HEIGHT;
    const cx = W / 2, cy = H / 2;
    const C = this.COLORS;

    const positions = [
      { x: cx, y: 56, isHoriz: true },
      { x: cx, y: H - 56, isHoriz: true },
      { x: 56, y: cy, isHoriz: false },
      { x: W - 56, y: cy, isHoriz: false },
    ];

    ctx.save();
    ctx.fillStyle = C.gold;

    positions.forEach(p => {
      // Center primary diamond
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 8);
      ctx.lineTo(p.x + 8, p.y);
      ctx.lineTo(p.x, p.y + 8);
      ctx.lineTo(p.x - 8, p.y);
      ctx.closePath();
      ctx.fill();

      // Flanking secondary diamonds
      if (p.isHoriz) {
        [-16, 16].forEach(dx => {
          ctx.beginPath();
          ctx.moveTo(p.x + dx, p.y - 5);
          ctx.lineTo(p.x + dx + 5, p.y);
          ctx.lineTo(p.x + dx, p.y + 5);
          ctx.lineTo(p.x + dx - 5, p.y);
          ctx.closePath();
          ctx.fill();
        });
      } else {
        [-16, 16].forEach(dy => {
          ctx.beginPath();
          ctx.moveTo(p.x - 5, p.y + dy);
          ctx.lineTo(p.x, p.y + dy - 5);
          ctx.lineTo(p.x + 5, p.y + dy);
          ctx.lineTo(p.x, p.y + dy + 5);
          ctx.closePath();
          ctx.fill();
        });
      }
    });

    ctx.restore();
  },


  // ═══════════════════════════════════════════════════════
  //  2.1 FLANK ORNAMENTS — Filling Left & Right Space
  // ═══════════════════════════════════════════════════════

  /**
   * Solves the "left right part looking very empty" issue by adding:
   * 1. Running vertical filigree diamond ribbons on left (x=96) and right (x=W-96)
   * 2. Ornate heraldic diamond crests at quarter-heights and mid-height on both flanks
   * 3. Vertical micro-security ribbon in delicate gold
   */
  drawFlankDecorativeElements(ctx) {
    const W = this.WIDTH, H = this.HEIGHT;
    const cy = H / 2;
    const C = this.COLORS;

    const leftX = 96;
    const rightX = W - 96;
    const yStart = 150;
    const yEnd = H - 150;
    const step = 28;

    ctx.save();

    // ── 1. Vertical Filigree Diamond Ribbons on Left & Right ──
    [leftX, rightX].forEach(xCol => {
      // Vertical hairline rule
      ctx.strokeStyle = 'rgba(197, 153, 58, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xCol, yStart);
      ctx.lineTo(xCol, yEnd);
      ctx.stroke();

      // Repeating gold diamonds and micro-dots
      ctx.fillStyle = C.gold;
      for (let y = yStart + 20; y <= yEnd - 20; y += step) {
        ctx.beginPath();
        ctx.moveTo(xCol, y - 4);
        ctx.lineTo(xCol + 4, y);
        ctx.lineTo(xCol, y + 4);
        ctx.lineTo(xCol - 4, y);
        ctx.closePath();
        ctx.fill();

        // Accent dot between diamonds
        if (y + step / 2 <= yEnd - 20) {
          ctx.beginPath();
          ctx.arc(xCol, y + step / 2, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // ── 2. Ornate Heraldic Diamond Crests on Left & Right Flanks ──
    const flankCrestsY = [cy - 380, cy, cy + 380];
    [leftX, rightX].forEach(xCol => {
      flankCrestsY.forEach(yPos => {
        // Outer halo
        ctx.save();
        ctx.strokeStyle = 'rgba(197, 153, 58, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(xCol, yPos, 16, 0, Math.PI * 2);
        ctx.stroke();

        // Solid gold center diamond
        ctx.fillStyle = C.gold;
        ctx.beginPath();
        ctx.moveTo(xCol, yPos - 9);
        ctx.lineTo(xCol + 9, yPos);
        ctx.lineTo(xCol, yPos + 9);
        ctx.lineTo(xCol - 9, yPos);
        ctx.closePath();
        ctx.fill();

        // Inner white micro-diamond
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(xCol, yPos - 4);
        ctx.lineTo(xCol + 4, yPos);
        ctx.lineTo(xCol, yPos + 4);
        ctx.lineTo(xCol - 4, yPos);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });
    });

    // ── 3. Vertical Security Micro-Lettering Ribbon along Left & Right ──
    const microText = '✦  ELEVATIFIER PRIVATE LIMITED  ✦  AUTHENTICATED INTERNSHIP CREDENTIAL  ✦  ISO 9001:2015  ✦';
    ctx.font = '700 9.5px "Cinzel", serif';
    ctx.fillStyle = 'rgba(197, 153, 58, 0.42)';
    ctx.letterSpacing = '3px';

    // Left vertical ribbon (reading downwards)
    ctx.save();
    ctx.translate(leftX - 18, cy);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(microText, 0, 0);
    ctx.restore();

    // Right vertical ribbon (reading upwards)
    ctx.save();
    ctx.translate(rightX + 18, cy);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(microText, 0, 0);
    ctx.restore();

    ctx.restore();
  },


  // ═══════════════════════════════════════════════════════
  //  3. HEADER — Logo at Top-Left, Govt Badge at Top-Right,
  //     Company & Title Centered (Saves Space, Regal Design)
  // ═══════════════════════════════════════════════════════

  async drawHeader(ctx) {
    const W = this.WIDTH;
    const cx = W / 2;
    const C = this.COLORS;

    // ── TOP-LEFT: Prominent Elevatifier Brand Logo ──
    const logoX = 135;
    const logoY = 92;
    const logoMaxH = 120; // High brand prominence & bold resolution
    let logoDrawn = false;

    try {
      const logoImg = await this.loadImage('/Elevatifier-logo.png');
      if (logoImg && logoImg.width) {
        const h = logoMaxH;
        const w = (logoImg.width / logoImg.height) * h;
        ctx.drawImage(logoImg, logoX, logoY, w, h);
        logoDrawn = true;
      }
    } catch (e) {
      console.warn('Top-left logo load failed, using vector emblem fallback');
    }

    if (!logoDrawn) {
      ctx.save();
      ctx.fillStyle = C.navy;
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, 135, 115, 10);
      ctx.fill();
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = C.goldLight;
      ctx.font = 'bold 54px "Cinzel", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('E', logoX + 67, logoY + 57);
      ctx.restore();
    }

    // ── TOP-RIGHT: Symmetrical Government Recognition & Accreditation Badge ──
    this._drawTopRightAccreditationBadge(ctx, W - 135, logoY, logoMaxH);

    // ── CENTER HEADER: Company Name & Main Title ──
    ctx.save();
    ctx.textAlign = 'center';

    // Company Name: ELEVATIFIER PRIVATE LIMITED
    ctx.font = '800 42px "Cinzel", "Times New Roman", serif';
    ctx.fillStyle = C.navy;
    ctx.letterSpacing = '6.5px';
    ctx.fillText('ELEVATIFIER PRIVATE LIMITED', cx, 142);

    // Incorporation & Statutory Subtitle
    ctx.font = '600 14px "Outfit", sans-serif';
    ctx.fillStyle = C.gold;
    ctx.letterSpacing = '3.5px';
    ctx.fillText('DPIIT RECOGNISED  •  STARTUP INDIA  •  ISO 9001:2015 CERTIFIED', cx, 176);

    // Header Gold Tapered Divider Line
    const divW = 520;
    const divY = 202;
    const divGrad = ctx.createLinearGradient(cx - divW, divY, cx + divW, divY);
    divGrad.addColorStop(0, 'rgba(197, 153, 58, 0)');
    divGrad.addColorStop(0.2, 'rgba(197, 153, 58, 0.75)');
    divGrad.addColorStop(0.5, C.gold);
    divGrad.addColorStop(0.8, 'rgba(197, 153, 58, 0.75)');
    divGrad.addColorStop(1, 'rgba(197, 153, 58, 0)');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx - divW, divY);
    ctx.lineTo(cx + divW, divY);
    ctx.stroke();

    // Center divider diamond
    ctx.fillStyle = C.gold;
    ctx.beginPath();
    ctx.moveTo(cx, divY - 6);
    ctx.lineTo(cx + 6, divY);
    ctx.lineTo(cx, divY + 6);
    ctx.lineTo(cx - 6, divY);
    ctx.closePath();
    ctx.fill();

    // ── Grand Main Title: CERTIFICATE OF INTERNSHIP ──
    ctx.font = '900 72px "Cinzel", "Times New Roman", serif';
    ctx.fillStyle = C.navy;
    ctx.letterSpacing = '8px';
    ctx.fillText('CERTIFICATE OF INTERNSHIP', cx, 276);

    // ── Ornate Filigree Underline Beneath Title ──
    const ddW = 460;
    const ddY = 312;

    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx - ddW, ddY);
    ctx.lineTo(cx - 24, ddY);
    ctx.moveTo(cx + 24, ddY);
    ctx.lineTo(cx + ddW, ddY);
    ctx.stroke();

    // Center diamond flourish
    ctx.fillStyle = C.gold;
    ctx.beginPath();
    ctx.moveTo(cx, ddY - 7);
    ctx.lineTo(cx + 7, ddY);
    ctx.lineTo(cx, ddY + 7);
    ctx.lineTo(cx - 7, ddY);
    ctx.closePath();
    ctx.fill();

    // End accent diamonds
    [cx - ddW, cx + ddW].forEach(ex => {
      ctx.beginPath();
      ctx.moveTo(ex, ddY - 5);
      ctx.lineTo(ex + 5, ddY);
      ctx.lineTo(ex, ddY + 5);
      ctx.lineTo(ex - 5, ddY);
      ctx.closePath();
      ctx.fill();
    });

    ctx.restore();
  },

  /**
   * Top-Right Symmetrical Accreditation & Quality Seal Card
   */
  _drawTopRightAccreditationBadge(ctx, rightEdgeX, y, h) {
    const C = this.COLORS;
    const cardW = 340;
    const cardX = rightEdgeX - cardW;

    ctx.save();

    // Card background with soft shadow
    ctx.save();
    ctx.shadowColor = 'rgba(8, 20, 38, 0.06)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = C.creamCard;
    ctx.beginPath();
    ctx.roundRect(cardX, y, cardW, h, 8);
    ctx.fill();
    ctx.restore();

    // Gold outer frame
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cardX, y, cardW, h, 8);
    ctx.stroke();

    // Inner navy hairline
    ctx.strokeStyle = 'rgba(8, 20, 38, 0.12)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect(cardX + 3.5, y + 3.5, cardW - 7, h - 7, 6);
    ctx.stroke();

    // Text content
    ctx.textAlign = 'center';

    ctx.font = '700 11.5px "Cinzel", serif';
    ctx.fillStyle = C.gold;
    ctx.letterSpacing = '1.8px';
    ctx.fillText('✦  GOVERNMENT OF INDIA  ✦', cardX + cardW / 2, y + 28);

    ctx.font = '800 16.5px "Cinzel", serif';
    ctx.fillStyle = C.navy;
    ctx.letterSpacing = '1px';
    ctx.fillText('RECOGNISED ENTITY', cardX + cardW / 2, y + 55);

    // Divider line
    ctx.strokeStyle = C.borderGold;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cardX + 30, y + 68);
    ctx.lineTo(cardX + cardW - 30, y + 68);
    ctx.stroke();

    ctx.font = '600 12.5px "Outfit", sans-serif';
    ctx.fillStyle = C.textSlate;
    ctx.letterSpacing = '0.5px';
    ctx.fillText('DPIIT  •  STARTUP INDIA  •  ISO 9001', cardX + cardW / 2, y + 88);

    ctx.font = '600 11px "Outfit", sans-serif';
    ctx.fillStyle = C.greenBadge;
    ctx.letterSpacing = '0.5px';
    ctx.fillText('● ACCREDITED ACADEMIC CREDENTIAL', cardX + cardW / 2, y + 107);

    ctx.restore();
  },


  // ═══════════════════════════════════════════════════════
  //  4. BODY — Candidate Name, College, Domain, Tenure
  // ═══════════════════════════════════════════════════════

  drawBodyContent(ctx, cert) {
    const cx = this.WIDTH / 2;
    const C = this.COLORS;

    ctx.save();
    ctx.textAlign = 'center';

    // ── Preamble ──
    ctx.font = 'italic 400 28px "Playfair Display", Georgia, serif';
    ctx.fillStyle = C.textSlate;
    ctx.letterSpacing = '1px';
    ctx.fillText('This is to proudly certify that', cx, 368);

    // ── Candidate Name (Prominent, High-Visual Impact) ──
    const studentName = (cert.studentName || 'Candidate Name').toUpperCase();
    let nameSize = 90;
    const maxNameW = this.WIDTH - 440;
    ctx.font = `700 ${nameSize}px "Cinzel", "Times New Roman", serif`;
    while (ctx.measureText(studentName).width > maxNameW && nameSize > 42) {
      nameSize -= 3;
      ctx.font = `700 ${nameSize}px "Cinzel", "Times New Roman", serif`;
    }
    ctx.fillStyle = C.navy;
    ctx.letterSpacing = '3.5px';
    ctx.fillText(studentName, cx, 465);

    // ── Gold Tapered Underline Beneath Name ──
    const nameW = ctx.measureText(studentName).width;
    const barHalf = Math.min(Math.max(nameW / 2 + 60, 260), (this.WIDTH - 400) / 2);
    const ulY = 504;

    const barGrad = ctx.createLinearGradient(cx - barHalf, ulY, cx + barHalf, ulY);
    barGrad.addColorStop(0, 'rgba(197, 153, 58, 0)');
    barGrad.addColorStop(0.15, C.gold);
    barGrad.addColorStop(0.5, C.goldBright);
    barGrad.addColorStop(0.85, C.gold);
    barGrad.addColorStop(1, 'rgba(197, 153, 58, 0)');
    ctx.strokeStyle = barGrad;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(cx - barHalf, ulY);
    ctx.lineTo(cx + barHalf, ulY);
    ctx.stroke();

    // Gold diamond accents on underline
    ctx.fillStyle = C.gold;
    [cx - barHalf, cx, cx + barHalf].forEach(dx => {
      ctx.beginPath();
      ctx.moveTo(dx, ulY - 5);
      ctx.lineTo(dx + 5, ulY);
      ctx.lineTo(dx, ulY + 5);
      ctx.lineTo(dx - 5, ulY);
      ctx.closePath();
      ctx.fill();
    });

    // ── College / Degree Affiliation ──
    const college = (cert.college || '').trim();
    const degree = (cert.degree || '').trim();
    let affiliation = '';
    if (college && degree) {
      affiliation = `${degree}, ${college}`;
    } else if (college) {
      affiliation = college;
    }

    if (affiliation) {
      let affSize = 25.5;
      ctx.font = `500 ${affSize}px "Outfit", sans-serif`;
      while (ctx.measureText(affiliation).width > this.WIDTH - 440 && affSize > 16) {
        affSize -= 1;
        ctx.font = `500 ${affSize}px "Outfit", sans-serif`;
      }
      ctx.fillStyle = C.textBody;
      ctx.letterSpacing = '0.6px';
      ctx.fillText(affiliation, cx, 552);
    }

    // ── Completion Statement ──
    ctx.font = 'italic 400 24px "Playfair Display", Georgia, serif';
    ctx.fillStyle = C.textSlate;
    ctx.letterSpacing = '0.5px';
    ctx.fillText(
      'has successfully completed all rigorous academic criteria and project deliverables of an intensive',
      cx, 606
    );

    // ── Duration Pill Badge (Substantial, Centered) ──
    const duration = (cert.duration || '3 Months').toUpperCase();
    this._drawDurationPill(ctx, cx, 670, duration);

    // ── Specialized Domain Header ──
    ctx.font = 'italic 400 24px "Playfair Display", Georgia, serif';
    ctx.fillStyle = C.textSlate;
    ctx.letterSpacing = '0.5px';
    ctx.fillText('professional internship program in the specialized domain of', cx, 736);

    // ── Domain Name (Bold Navy, Regal Scale) ──
    const domain = (cert.domain || 'Professional Domain').toUpperCase();
    let domSize = 52;
    ctx.font = `800 ${domSize}px "Cinzel", "Times New Roman", serif`;
    while (ctx.measureText(domain).width > this.WIDTH - 400 && domSize > 30) {
      domSize -= 2;
      ctx.font = `800 ${domSize}px "Cinzel", "Times New Roman", serif`;
    }
    ctx.fillStyle = C.navy;
    ctx.letterSpacing = '3.5px';
    ctx.fillText(domain, cx, 808);

    // ── Tenure & Assessment Performance Citation ──
    ctx.font = '500 21px "Outfit", sans-serif';
    ctx.fillStyle = C.textBody;
    ctx.letterSpacing = '0.4px';

    if (cert.startDate && cert.endDate) {
      ctx.fillText(
        `Program Tenure: ${cert.startDate} — ${cert.endDate}   •   Verified Capstone Project & Technical Assessment`,
        cx, 870
      );
    } else {
      ctx.fillText(
        'Verified Practical Implementation   •   Supervised Industry Capstone Assessment & Code Evaluation',
        cx, 870
      );
    }

    ctx.font = '400 18px "Outfit", sans-serif';
    ctx.fillStyle = C.textMuted;
    ctx.letterSpacing = '0.3px';
    ctx.fillText(
      'The candidate demonstrated distinguished engineering capability, diligence, and professional excellence.',
      cx, 904
    );

    ctx.restore();
  },

  /**
   * Draw substantial navy pill with dual gold framing for duration
   */
  _drawDurationPill(ctx, x, y, duration) {
    ctx.save();
    const label = `✦   ${duration} PROFESSIONAL INTERNSHIP PROGRAM   ✦`;
    ctx.font = '700 21px "Cinzel", serif';
    ctx.letterSpacing = '2.5px';
    const tw = ctx.measureText(label).width;
    const px = 48, h = 48;
    const totalW = tw + px * 2;

    // Dark navy solid fill
    ctx.fillStyle = this.COLORS.navy;
    ctx.beginPath();
    ctx.roundRect(x - totalW / 2, y - h / 2, totalW, h, 24);
    ctx.fill();

    // Outer gold border
    ctx.strokeStyle = this.COLORS.gold;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Inner gold hairline
    ctx.strokeStyle = 'rgba(232, 201, 106, 0.45)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect(x - totalW / 2 + 3.5, y - h / 2 + 3.5, totalW - 7, h - 7, 21);
    ctx.stroke();

    // Gold label text
    ctx.fillStyle = this.COLORS.goldLight;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y + 1);

    ctx.restore();
  },


  // ═══════════════════════════════════════════════════════
  //  5. RECOGNITIONS — Larger, Crisp, Perfectly Balanced
  // ═══════════════════════════════════════════════════════

  async drawRecognitionStrip(ctx) {
    const cx = this.WIDTH / 2;
    const C = this.COLORS;
    const headerY = 955;

    ctx.save();
    ctx.textAlign = 'center';

    // Section Header
    ctx.font = '700 15px "Cinzel", serif';
    ctx.fillStyle = C.gold;
    ctx.letterSpacing = '3.5px';
    ctx.fillText('GOVERNMENT & INSTITUTIONAL ACCREDITATIONS', cx, headerY);

    // Flanking gold decorative lines
    const textHalfW = ctx.measureText('GOVERNMENT & INSTITUTIONAL ACCREDITATIONS').width / 2 + 24;
    const lineW = 200;
    ctx.strokeStyle = C.borderGold;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - textHalfW - lineW, headerY);
    ctx.lineTo(cx - textHalfW, headerY);
    ctx.moveTo(cx + textHalfW, headerY);
    ctx.lineTo(cx + textHalfW + lineW, headerY);
    ctx.stroke();

    // End dots on flanking lines
    ctx.fillStyle = C.gold;
    [cx - textHalfW - lineW, cx + textHalfW + lineW].forEach(dx => {
      ctx.beginPath();
      ctx.arc(dx, headerY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Recognition Logos — Larger cards for supreme visibility (205 × 82 px)
    const logos = [
      { file: '/images/recognitions/12.png', name: 'DPIIT' },
      { file: '/images/recognitions/11.png', name: 'Startup India' },
      { file: '/images/recognitions/10.png', name: 'Start in UP' },
      { file: '/images/recognitions/8.png', name: 'MoE Cell' },
      { file: '/images/recognitions/6.png', name: 'AKTU' },
      { file: '/images/recognitions/9.png', name: 'Bank of Baroda' },
    ];

    const badgeW = 205, badgeH = 82, gap = 26;
    const totalRowW = logos.length * badgeW + (logos.length - 1) * gap;
    const startX = cx - totalRowW / 2;
    const badgeY = headerY + 18;

    for (let i = 0; i < logos.length; i++) {
      const bx = startX + i * (badgeW + gap);
      const by = badgeY;

      // Card shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(bx, by, badgeW, badgeH, 8);
      ctx.fill();
      ctx.restore();

      // Card gold border
      ctx.strokeStyle = C.borderGold;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(bx, by, badgeW, badgeH, 8);
      ctx.stroke();

      // Card inner subtle hairline
      ctx.strokeStyle = 'rgba(197, 153, 58, 0.18)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.roundRect(bx + 2.5, by + 2.5, badgeW - 5, badgeH - 5, 6);
      ctx.stroke();

      // Render logo image with padding
      let img = null;
      try {
        img = await this.loadImage(logos[i].file);
      } catch (e) { }

      if (img && img.width) {
        const maxH = badgeH - 16;
        const maxW = badgeW - 20;
        const scale = Math.min(maxW / img.width, maxH / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, bx + (badgeW - dw) / 2, by + (badgeH - dh) / 2, dw, dh);
      } else {
        // Fallback text
        ctx.fillStyle = C.navy;
        ctx.font = '700 13px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(logos[i].name, bx + badgeW / 2, by + badgeH / 2);
      }
    }

    ctx.restore();
  },


  // ═══════════════════════════════════════════════════════
  //  6. FOOTER — Executive 3-Pillar Layout (Clean Signature, No Stamp)
  // ═══════════════════════════════════════════════════════

  async drawFooterSection(ctx, cert) {
    const cx = this.WIDTH / 2;
    const C = this.COLORS;

    // ── Elegant Top Separator Line ──
    const sepY = 1115;
    const sepGrad = ctx.createLinearGradient(130, sepY, this.WIDTH - 130, sepY);
    sepGrad.addColorStop(0, 'rgba(197, 153, 58, 0)');
    sepGrad.addColorStop(0.2, C.borderGold);
    sepGrad.addColorStop(0.5, C.gold);
    sepGrad.addColorStop(0.8, C.borderGold);
    sepGrad.addColorStop(1, 'rgba(197, 153, 58, 0)');
    ctx.strokeStyle = sepGrad;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(130, sepY);
    ctx.lineTo(this.WIDTH - 130, sepY);
    ctx.stroke();

    // Center diamond on separator line
    ctx.fillStyle = C.gold;
    ctx.beginPath();
    ctx.moveTo(cx, sepY - 5);
    ctx.lineTo(cx + 5, sepY);
    ctx.lineTo(cx, sepY + 5);
    ctx.lineTo(cx - 5, sepY);
    ctx.closePath();
    ctx.fill();

    // ── 3-Pillar Balanced Executive Layout ──
    // Pillar 1 (Left):   Authorized Signatory (Shivansh Vasu) — Clean, NO Stamp
    // Pillar 2 (Center): Official Credential & Blockchain Security Plate
    // Pillar 3 (Right):  Dynamic QR Code + Instant Verification
    const colLeftX = 460;
    const colCenterX = cx;
    const colRightX = this.WIDTH - 460;
    const baseY = 1315;

    // Pillar 1: Signature (Pure, elegant, no stamp)
    this._drawSignature(ctx, colLeftX, baseY);

    // Pillar 2: Official Credential Plate
    this._drawCredentialPlate(ctx, cert, colCenterX, baseY);

    // Pillar 3: Dynamic QR Code
    await this._drawQRSection(ctx, cert, colRightX, baseY);

    // ── Bottom Verification Strip (with generous 40+ px clearance from border) ──
    this._drawVerificationStrip(ctx, cert);
  },

  /**
   * Pillar 1: Authorized Signatory block (Stamp Removed for Clean Prestige)
   */
  _drawSignature(ctx, x, y) {
    const C = this.COLORS;
    ctx.save();
    ctx.textAlign = 'center';

    // Executive Cursive Signature (Shivansh Vasu)
    ctx.font = '400 72px "Great Vibes", "Brush Script MT", cursive';
    ctx.fillStyle = C.navy;
    ctx.fillText('Shivansh Vasu', x, y - 46);

    // Signature line
    ctx.strokeStyle = C.navy;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x - 180, y - 6);
    ctx.lineTo(x + 180, y - 6);
    ctx.stroke();

    // Gold diamond tips on signature line
    ctx.fillStyle = C.gold;
    [-180, 180].forEach(offset => {
      ctx.beginPath();
      ctx.moveTo(x + offset, y - 10);
      ctx.lineTo(x + offset + 5, y - 6);
      ctx.lineTo(x + offset, y - 2);
      ctx.lineTo(x + offset - 5, y - 6);
      ctx.closePath();
      ctx.fill();
    });

    // Signatory Name
    ctx.font = '800 22px "Cinzel", serif';
    ctx.fillStyle = C.navy;
    ctx.letterSpacing = '2.2px';
    ctx.fillText('SHIVANSH VASU', x, y + 30);

    // Signatory Title
    ctx.font = '600 15px "Outfit", sans-serif';
    ctx.fillStyle = C.gold;
    ctx.letterSpacing = '1px';
    ctx.fillText('Founder & Managing Director', x, y + 54);

    // Company Name: ELEVATIFIER PRIVATE LIMITED
    ctx.font = '500 14px "Outfit", sans-serif';
    ctx.fillStyle = C.textMuted;
    ctx.letterSpacing = '0.5px';
    ctx.fillText('Elevatifier Private Limited', x, y + 76);

    ctx.restore();
  },

  /**
   * Pillar 2: Official Credential Plate (Clean, prestigious digital registry box)
   */
  _drawCredentialPlate(ctx, cert, x, y) {
    const C = this.COLORS;
    ctx.save();
    ctx.textAlign = 'center';

    const cardW = 580;
    const cardH = 205;
    const cardX = x - cardW / 2;
    const cardY = y - 114;

    // Card background with subtle shadow
    ctx.save();
    ctx.shadowColor = 'rgba(8, 20, 38, 0.07)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = C.creamCard;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 10);
    ctx.fill();
    ctx.restore();

    // Outer gold border
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 10);
    ctx.stroke();

    // Inner pinstripe border
    ctx.strokeStyle = 'rgba(8, 20, 38, 0.12)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect(cardX + 4, cardY + 4, cardW - 8, cardH - 8, 8);
    ctx.stroke();

    // Top Card Banner Title
    ctx.font = '700 13px "Cinzel", serif';
    ctx.fillStyle = C.gold;
    ctx.letterSpacing = '2px';
    ctx.fillText('✦   OFFICIAL CREDENTIAL RECORD   ✦', x, cardY + 28);

    // Certificate ID Pill Container
    const certId = cert.certificateId || 'ELV-2026-T69FC9';
    const idBoxW = 450;
    const idBoxH = 40;
    const idBoxY = cardY + 46;

    ctx.fillStyle = C.navy;
    ctx.beginPath();
    ctx.roundRect(x - idBoxW / 2, idBoxY, idBoxW, idBoxH, 6);
    ctx.fill();

    ctx.strokeStyle = C.goldLight;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = '700 19px "Outfit", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '1.8px';
    ctx.textBaseline = 'middle';
    ctx.fillText(`ID: ${certId}`, x, idBoxY + idBoxH / 2);

    // Issue Date & Authority
    ctx.textBaseline = 'alphabetic';
    ctx.font = '600 14.5px "Outfit", sans-serif';
    ctx.fillStyle = C.textBody;
    ctx.letterSpacing = '0.5px';
    ctx.fillText(`DATE OF ISSUANCE: ${cert.issueDate || '10 SEPT 2026'}`, x, cardY + 126);

    // Security Accreditation Text
    ctx.font = '400 13px "Outfit", sans-serif';
    ctx.fillStyle = C.textSlate;
    ctx.fillText('Tamper-Evident Record   •   Elevatifier Academic Registry', x, cardY + 152);

    // Green Cryptographic Badge
    ctx.font = '700 12.5px "Outfit", sans-serif';
    ctx.fillStyle = C.greenBadge;
    ctx.letterSpacing = '0.5px';
    ctx.fillText('● CRYPTOGRAPHICALLY SEALED & VERIFIED', x, cardY + 178);

    ctx.restore();
  },

  /**
   * Pillar 3: QR Code card with high-contrast verification scanner (185px)
   */
  async _drawQRSection(ctx, cert, x, y) {
    const C = this.COLORS;
    ctx.save();
    ctx.textAlign = 'center';

    const qrSize = 185; // Substantial QR size for instant camera recognition
    const qrX = x - qrSize / 2;
    const qrY = y - 110;

    // White card background with shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 8);
    ctx.fill();
    ctx.restore();

    // Gold frame
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 8);
    ctx.stroke();

    // Inner navy hairline
    ctx.strokeStyle = C.navy;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12);

    // Draw QR code image
    if (cert.qrCodeDataUrl) {
      try {
        const qrImg = await this.loadImage(cert.qrCodeDataUrl);
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      } catch (e) {
        console.warn('QR render failed:', e);
      }
    }

    // Top / Bottom Scanner Labels
    ctx.font = '800 14.5px "Cinzel", serif';
    ctx.fillStyle = C.navy;
    ctx.letterSpacing = '1.5px';
    ctx.fillText('SCAN TO VERIFY', x, y + 110);

    ctx.font = '600 12.5px "Outfit", sans-serif';
    ctx.fillStyle = C.gold;
    ctx.letterSpacing = '0.5px';
    ctx.fillText('Official Digital Registry Lookup', x, y + 132);

    ctx.font = '500 11.5px "Outfit", sans-serif';
    ctx.fillStyle = C.textMuted;
    ctx.letterSpacing = '0.3px';
    ctx.fillText('Academic & Employer Clearance', x, y + 150);

    ctx.restore();
  },

  /**
   * Bottom Verification Strip
   * FIXED: Sits comfortably above the bottom border with generous 40+ px clearance.
   */
  _drawVerificationStrip(ctx, cert) {
    const W = this.WIDTH, H = this.HEIGHT;
    const cx = W / 2;
    const C = this.COLORS;

    // Bottom border ends at H - 66 = 1688.
    // Placing the strip at y = 1618 leaves 42px of clear margin from the border!
    const stripY = H - 136;

    ctx.save();
    ctx.textAlign = 'center';

    // Elegant gold separator rule
    const ruleW = W - 320;
    const ruleGrad = ctx.createLinearGradient(cx - ruleW / 2, stripY - 16, cx + ruleW / 2, stripY - 16);
    ruleGrad.addColorStop(0, 'rgba(197, 153, 58, 0)');
    ruleGrad.addColorStop(0.2, C.borderGold);
    ruleGrad.addColorStop(0.5, C.gold);
    ruleGrad.addColorStop(0.8, C.borderGold);
    ruleGrad.addColorStop(1, 'rgba(197, 153, 58, 0)');
    ctx.strokeStyle = ruleGrad;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - ruleW / 2, stripY - 16);
    ctx.lineTo(cx + ruleW / 2, stripY - 16);
    ctx.stroke();

    // Center diamond on the rule
    ctx.fillStyle = C.gold;
    ctx.beginPath();
    ctx.moveTo(cx, stripY - 20);
    ctx.lineTo(cx + 4, stripY - 16);
    ctx.lineTo(cx, stripY - 12);
    ctx.lineTo(cx - 4, stripY - 16);
    ctx.closePath();
    ctx.fill();

    // Verification URL line
    const verifyUrl = cert.verificationUrl ||
      `https://certify.elevatifier.com/verify/${cert.certificateId || 'ID'}`;
    ctx.font = '600 16px "Outfit", sans-serif';
    ctx.fillStyle = '#0284c7';
    ctx.letterSpacing = '0.6px';
    ctx.fillText(`PUBLIC VERIFICATION REGISTRY: ${verifyUrl}`, cx, stripY + 10);

    // Official Credential & Contact Subtext
    ctx.font = '400 13px "Outfit", sans-serif';
    ctx.fillStyle = C.textMuted;
    ctx.letterSpacing = '0.3px';
    ctx.fillText(
      'Official Credential of Elevatifier Private Limited   •   Academic Verification Contact: contact@elevatifier.com',
      cx, stripY + 34
    );

    ctx.restore();
  },


  // ═══════════════════════════════════════════════════════
  //  UTILITIES
  // ═══════════════════════════════════════════════════════

  /**
   * Load image as a Promise
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
   * Download certificate as high-quality JPEG (~1 MB)
   */
  downloadAsImage(canvas, filename) {
    const link = document.createElement('a');
    const baseName = (filename || 'Elevatifier_Internship_Certificate')
      .replace(/\.(png|jpg|jpeg)$/i, '');
    link.download = `${baseName}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.92);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
