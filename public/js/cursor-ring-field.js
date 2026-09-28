/**
 * Originkit UI - Interactive Cursor Ring Field & Custom Cursor Engine
 * FITNEXA AI Operational Theme
 */
(function () {
  'use strict';

  // Inject Custom Cursor and Canvas Container into DOM
  function initCursorRingField() {
    if (document.getElementById('cursor-ring-field-canvas')) return;

    // 1. Create Canvas for Ring Field Effect
    const canvas = document.createElement('canvas');
    canvas.id = 'cursor-ring-field-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    canvas.style.opacity = '0.75';
    document.body.prepend(canvas);

    // 2. Create Custom Cursor Elements
    const cursorDot = document.createElement('div');
    cursorDot.id = 'fitnexa-cursor-dot';
    cursorDot.style.position = 'fixed';
    cursorDot.style.pointerEvents = 'none';
    cursorDot.style.zIndex = '99999';
    cursorDot.style.width = '8px';
    cursorDot.style.height = '8px';
    cursorDot.style.borderRadius = '50%';
    cursorDot.style.background = '#00f5d4';
    cursorDot.style.boxShadow = '0 0 10px #00f5d4, 0 0 20px #00f5d4';
    cursorDot.style.transform = 'translate(-50%, -50%)';
    cursorDot.style.transition = 'transform 0.08s ease-out, opacity 0.2s';
    cursorDot.style.opacity = '0';

    const cursorRing = document.createElement('div');
    cursorRing.id = 'fitnexa-cursor-ring';
    cursorRing.style.position = 'fixed';
    cursorRing.style.pointerEvents = 'none';
    cursorRing.style.zIndex = '99998';
    cursorRing.style.width = '34px';
    cursorRing.style.height = '34px';
    cursorRing.style.borderRadius = '50%';
    cursorRing.style.border = '1.5px solid rgba(0, 245, 212, 0.6)';
    cursorRing.style.boxShadow = '0 0 15px rgba(0, 245, 212, 0.25), inset 0 0 10px rgba(0, 245, 212, 0.15)';
    cursorRing.style.transform = 'translate(-50%, -50%)';
    cursorRing.style.transition = 'width 0.25s ease-out, height 0.25s ease-out, border-color 0.25s ease-out, opacity 0.2s';
    cursorRing.style.opacity = '0';

    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorRing);

    // Hide default cursor over interactive elements if desired, or keep smooth hover states
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetX = mouseX;
    let targetY = mouseY;
    let ringX = mouseX;
    let ringY = mouseY;
    let isHoveringInteractive = false;
    let isMouseDown = false;

    // Rings pool
    const rings = [];
    const MAX_RINGS = 8;
    for (let i = 0; i < MAX_RINGS; i++) {
      rings.push({
        radius: 20 + i * 28,
        maxRadius: 180 + i * 40,
        alpha: Math.max(0.08, 0.45 - i * 0.05),
        speed: 0.6 + i * 0.15,
        lineWidth: Math.max(1, 2.5 - i * 0.25),
        hueOffset: i * 25
      });
    }

    // Ripple waves on click
    const ripples = [];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', function (e) {
      targetX = e.clientX;
      targetY = e.clientY;
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';

      // Check hovering interactive items
      const target = e.target;
      if (
        target &&
        (target.tagName === 'A' ||
          target.tagName === 'BUTTON' ||
          target.tagName === 'INPUT' ||
          target.onclick ||
          target.closest('a') ||
          target.closest('button'))
      ) {
        if (!isHoveringInteractive) {
          isHoveringInteractive = true;
          cursorRing.style.width = '52px';
          cursorRing.style.height = '52px';
          cursorRing.style.borderColor = 'rgba(255, 110, 199, 0.85)';
          cursorRing.style.boxShadow = '0 0 20px rgba(255, 110, 199, 0.4)';
          cursorDot.style.background = '#ff6ec7';
          cursorDot.style.boxShadow = '0 0 12px #ff6ec7';
        }
      } else {
        if (isHoveringInteractive) {
          isHoveringInteractive = false;
          cursorRing.style.width = '34px';
          cursorRing.style.height = '34px';
          cursorRing.style.borderColor = 'rgba(0, 245, 212, 0.6)';
          cursorRing.style.boxShadow = '0 0 15px rgba(0, 245, 212, 0.25), inset 0 0 10px rgba(0, 245, 212, 0.15)';
          cursorDot.style.background = '#00f5d4';
          cursorDot.style.boxShadow = '0 0 10px #00f5d4';
        }
      }
    });

    window.addEventListener('mousedown', function (e) {
      isMouseDown = true;
      cursorRing.style.transform = 'translate(-50%, -50%) scale(0.7)';
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 10,
        maxRadius: 220,
        alpha: 0.8,
        color: '#00f5d4'
      });
    });

    window.addEventListener('mouseup', function () {
      isMouseDown = false;
      cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    document.addEventListener('mouseleave', function () {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });

    let time = 0;
    function render() {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Lerp mouse
      mouseX += (targetX - mouseX) * 0.16;
      mouseY += (targetY - mouseY) * 0.16;
      ringX += (targetX - ringX) * 0.08;
      ringY += (targetY - ringY) * 0.08;

      cursorDot.style.left = targetX + 'px';
      cursorDot.style.top = targetY + 'px';
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';

      // 1. Ambient glow field around cursor
      const glowGrad = ctx.createRadialGradient(ringX, ringY, 5, ringX, ringY, 260);
      glowGrad.addColorStop(0, 'rgba(0, 245, 212, 0.09)');
      glowGrad.addColorStop(0.4, 'rgba(121, 40, 202, 0.05)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(ringX, ringY, 260, 0, Math.PI * 2);
      ctx.fill();

      // 2. Expanding Concentric Field Rings
      rings.forEach((ring, idx) => {
        ring.radius += ring.speed;
        if (ring.radius > ring.maxRadius) {
          ring.radius = 18;
        }

        const progress = ring.radius / ring.maxRadius;
        const currentAlpha = Math.sin(progress * Math.PI) * ring.alpha;
        const wobble = Math.sin(time * 2 + idx) * 3;

        ctx.save();
        ctx.beginPath();
        ctx.arc(ringX, ringY, Math.max(1, ring.radius + wobble), 0, Math.PI * 2);
        ctx.lineWidth = ring.lineWidth;

        // Gradient ring strokes (cyan to violet)
        ctx.strokeStyle = `rgba(${idx % 2 === 0 ? '0, 245, 212' : '121, 40, 202'}, ${currentAlpha})`;
        ctx.shadowColor = idx % 2 === 0 ? '#00f5d4' : '#7928ca';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
      });

      // 3. Dynamic Click Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += 5.5;
        rip.alpha -= 0.022;

        if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = `rgba(0, 245, 212, ${rip.alpha})`;
        ctx.shadowColor = '#00f5d4';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }

      requestAnimationFrame(render);
    }

    render();
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCursorRingField);
  } else {
    initCursorRingField();
  }
})();
