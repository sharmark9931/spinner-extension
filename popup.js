(function () {
  const canvas = document.getElementById("spinner-canvas");
  const ctx = canvas.getContext("2d");

  let angle = 0;
  let velocity = 0.08;

  const BOOST = 1.4;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  /** CSS pixels; must match popup.css / popup.html canvas size */
  const CANVAS_CSS_PX = 360;

  /**
   * Peak body radius / size ≈ 0.584 (lobe + rim). Need 0.584×drawSize + stroke ≤ min(bitmap)/2.
   */
  const DRAW_SIZE_FRAC = 0.835;

  function setupCanvas() {
    const px = CANVAS_CSS_PX;
    canvas.width = px * dpr;
    canvas.height = px * dpr;
    canvas.style.width = px + "px";
    canvas.style.height = px + "px";
  }

  const BEARING_GRAD_R = 0.195; // scales inner ring + hole; outer disk = this * ratio below

  // Bearing disk radius (visual); body rim uses extra overhang on top of this
  function bearingOuterRadius(size) {
    return size * BEARING_GRAD_R * 0.58;
  }

  /** Shared arm length, pinch, and rim — keep drawBody / drawBearings in sync */
  function lobeGeometry(size) {
    const baseR = size * 0.28;
    const amplitude = size * 0.102; // longer lobes + deeper inward valleys
    const bearingR = bearingOuterRadius(size);
    // Metal extends clearly past the bearing edge at each lobe
    const rimOverhang = bearingR * 1.52 + size * 0.03;
    // Fillet toward hub — smoother blend into centre
    const hubRound = size * 0.024;
    // Pulls the three inward valleys in; paired with hubRound for smooth S-curve
    const troughPinch = size * 0.028;
    // Soft high-order blend only in valleys (smoother tangent into hub)
    const hubSmooth = size * 0.016;
    return {
      baseR,
      amplitude,
      peakR: baseR + amplitude,
      bearingR,
      rimOverhang,
      hubRound,
      troughPinch,
      hubSmooth,
    };
  }

  // ===== REALISTIC SHAPE =====
  function drawBody(size) {
    const g = lobeGeometry(size);

    ctx.beginPath();

    const steps = 320;

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const c3 = Math.cos(3 * t);
      const c6 = Math.cos(6 * t);
      const atLobe = 0.5 + 0.5 * c3;
      const atTrough = 0.5 - 0.5 * c3;

      const r =
        g.baseR +
        g.amplitude * c3 +
        g.rimOverhang * atLobe +
        g.hubRound * atTrough -
        g.troughPinch * atTrough +
        g.hubSmooth * atTrough * (0.5 + 0.5 * c6);

      const x = Math.cos(t) * r;
      const y = Math.sin(t) * r;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.closePath();

    // ===== Anodized-style metal (violet → teal → deep slate) =====
    const metal = ctx.createRadialGradient(
      -size * 0.15,
      -size * 0.2,
      5,
      0,
      0,
      size * 0.55
    );
    metal.addColorStop(0, "#fae8ff");
    metal.addColorStop(0.18, "#c4b5fd");
    metal.addColorStop(0.38, "#67e8f9");
    metal.addColorStop(0.58, "#22d3ee");
    metal.addColorStop(0.78, "#6366f1");
    metal.addColorStop(1, "#1e1b4b");

    ctx.fillStyle = metal;
    ctx.fill();

    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(15, 23, 42, 0.85)";
    ctx.stroke();

    // ===== CONVEX HIGHLIGHT (top light) =====
    ctx.globalAlpha = 0.32;

    const light = ctx.createLinearGradient(-size, -size, size, size);
    light.addColorStop(0, "rgba(255,255,255,0.95)");
    light.addColorStop(0.35, "rgba(165,243,252,0.35)");
    light.addColorStop(0.65, "rgba(196,181,253,0.15)");
    light.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = light;
    ctx.fill();

    ctx.globalAlpha = 1;

    // ===== INNER SHADOW (concave dips) =====
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.18;

    const shadow = ctx.createRadialGradient(0, 0, g.baseR * 0.5, 0, 0, size);
    shadow.addColorStop(0, "rgba(0,0,0,0)");
    shadow.addColorStop(1, "rgba(30,27,75,0.55)");

    ctx.fillStyle = shadow;
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  function drawBearings(size) {
    const g = lobeGeometry(size);
    const gradR = size * BEARING_GRAD_R;
    const outerR = g.bearingR;

    const accents = [
      { hi: "#fef08a", mid: "#f59e0b", lo: "#78350f" },
      { hi: "#a5f3fc", mid: "#22d3ee", lo: "#164e63" },
      { hi: "#fbcfe8", mid: "#e879f9", lo: "#581c87" },
    ];

    for (let i = 0; i < 3; i++) {
      const t = (i / 3) * Math.PI * 2;
      const peakR = g.peakR;
      const x = Math.cos(t) * peakR;
      const y = Math.sin(t) * peakR;
      const a = accents[i];

      const ring = ctx.createRadialGradient(
        x - outerR * 0.35,
        y - outerR * 0.35,
        2,
        x,
        y,
        gradR
      );
      ring.addColorStop(0, a.hi);
      ring.addColorStop(0.45, a.mid);
      ring.addColorStop(1, a.lo);

      ctx.beginPath();
      ctx.arc(x, y, outerR, 0, Math.PI * 2);
      ctx.fillStyle = ring;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, gradR * 0.36, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(15,23,42,0.55)";
      ctx.lineWidth = Math.max(3, size * 0.012);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, gradR * 0.19, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();
    }
  }

  function drawCenter(size) {
    const r = size * 0.09;

    const grad = ctx.createRadialGradient(
      -r * 0.4,
      -r * 0.45,
      1,
      0,
      0,
      r
    );
    grad.addColorStop(0, "#fef9c3");
    grad.addColorStop(0.35, "#fbbf24");
    grad.addColorStop(0.65, "#ea580c");
    grad.addColorStop(1, "#431407");

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = "rgba(15,23,42,0.5)";
    ctx.lineWidth = Math.max(2, size * 0.008);
    ctx.stroke();
  }

  function drawSpinner() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.filter = "none";
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2, h / 2);
    if (velocity > 0.6) ctx.filter = "blur(1.5px)";
    ctx.rotate(angle);

    const minDim = Math.min(w, h);
    const size = minDim * DRAW_SIZE_FRAC;

    drawBody(size);
    drawBearings(size);
    drawCenter(size);

    ctx.restore();
    ctx.filter = "none";
  }

  // ===== REAL PHYSICS =====
  function tick() {
    angle += velocity;

    // very slow decay (realistic)
    velocity *= (0.996 + Math.min(velocity * 0.002, 0.003));

    if (velocity < 0.00001) velocity = 0;

    drawSpinner();
    requestAnimationFrame(tick);
  }

  function boost() {
    velocity += BOOST;
  }

  canvas.addEventListener("click", boost);

  setupCanvas();
  tick();
})();