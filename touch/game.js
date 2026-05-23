(function () {
  "use strict";

  const TILE = 8;
  const SKY_RATIO = 0.3;
  const LANDSCAPE_H = 180;
  const LANDSCAPE_W = 320;
  const PORTRAIT_W = 180;
  const PORTRAIT_H = 320;

  let W = LANDSCAPE_W;
  let H = LANDSCAPE_H;
  let layoutMode = null;

  const COLORS = {
    grass: ["#4a8c3f", "#5a9c4a", "#3d7a35", "#6aac58"],
    sky: "#87ceeb",
    cloud: "#f0f8ff",
    dogBody: "#f4c430",
    dogShade: "#d4a020",
    dogEar: "#c49010",
    dogNose: "#2a1810",
    dogEye: "#1a1010",
    dogBelly: "#ffe066",
    dogLeg: "#c49010",
    hand: "#f5d0b0",
    handShade: "#d4a080",
    heart: "#e84855",
  };

  const canvas = document.getElementById("game");
  const stage = document.getElementById("game-stage");
  const ctx = canvas.getContext("2d");
  const hint = document.getElementById("hint");

  const dog = {
    x: LANDSCAPE_W * 0.5,
    y: LANDSCAPE_H * 0.58,
    vx: 0,
    vy: 0,
    facing: 1,
    state: "wander",
    frame: 0,
    frameTimer: 0,
    wanderTarget: null,
    wanderPause: 0,
    callTarget: null,
    touchTimer: 0,
    speed: 28,
    runSpeed: 72,
  };

  let hand = null;
  let hearts = [];
  let grassOffset = 0;
  let firstTap = false;
  let clouds = [];

  function snapTile(n) {
    return Math.max(TILE, Math.round(n / TILE) * TILE);
  }

  function initClouds() {
    clouds = [
      { x: W * 0.07, y: H * 0.08, w: Math.max(20, W * 0.13) },
      { x: W * 0.33, y: H * 0.05, w: Math.max(24, W * 0.17) },
      { x: W * 0.64, y: H * 0.09, w: Math.max(18, W * 0.12) },
    ];
  }

  function clampEntityToField(entity) {
    const fieldTop = H * SKY_RATIO;
    entity.x = Math.max(12, Math.min(W - 12, entity.x));
    entity.y = Math.max(fieldTop + 10, Math.min(H - 14, entity.y));
  }

  /**
   * Match canvas aspect to the viewport; landscape layout on wide screens,
   * portrait on tall screens — fills space without stretch or cropping.
   */
  function layoutViewport() {
    const wrap = document.getElementById("game-wrap");
    const rect = wrap.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;

    const landscape = rect.width >= rect.height;
    const aspect = rect.width / rect.height;
    const mode = landscape ? "landscape" : "portrait";
    const flipped = layoutMode !== null && layoutMode !== mode;

    if (landscape) {
      H = LANDSCAPE_H;
      W = Math.max(LANDSCAPE_W, snapTile(H * aspect));
    } else {
      W = PORTRAIT_W;
      H = Math.max(PORTRAIT_H, snapTile(W / aspect));
    }

    canvas.width = W;
    canvas.height = H;
    layoutMode = mode;

    if (flipped) {
      dog.x = W * 0.5;
      dog.y = H * (landscape ? 0.58 : 0.64);
      dog.state = "wander";
      dog.callTarget = null;
      dog.wanderTarget = null;
      hand = null;
    }

    clampEntityToField(dog);
    if (dog.callTarget) clampEntityToField(dog.callTarget);
    if (hand) clampEntityToField(hand);
    if (dog.wanderTarget) clampEntityToField(dog.wanderTarget);

    initClouds();
  }

  function screenToWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return { x: W * 0.5, y: H * 0.6 };
    }
    const nx = ((clientX - rect.left) / rect.width) * W;
    const ny = ((clientY - rect.top) / rect.height) * H;
    return {
      x: Math.max(12, Math.min(W - 12, nx)),
      y: Math.max(H * SKY_RATIO, Math.min(H - 14, ny)),
    };
  }

  function pickWanderTarget() {
    const fieldTop = H * SKY_RATIO;
    return {
      x: 20 + Math.random() * (W - 40),
      y: fieldTop + 16 + Math.random() * (H - fieldTop - 28),
    };
  }

  function dist(ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    return Math.hypot(dx, dy);
  }

  function moveToward(entity, tx, ty, speed, dt) {
    const d = dist(entity.x, entity.y, tx, ty);
    if (d < 2) {
      entity.x = tx;
      entity.y = ty;
      return true;
    }
    const step = speed * dt;
    const t = Math.min(1, step / d);
    entity.x += (tx - entity.x) * t;
    entity.y += (ty - entity.y) * t;
    entity.facing = tx >= entity.x ? 1 : -1;
    return false;
  }

  function onTap(clientX, clientY) {
    const world = screenToWorld(clientX, clientY);
    if (!firstTap) {
      firstTap = true;
      hint.classList.add("hidden");
    }
    dog.state = "run";
    dog.callTarget = { x: world.x, y: world.y };
    hand = { x: world.x, y: world.y, timer: 0, phase: "reach" };
  }

  function spawnHeart(x, y) {
    hearts.push({
      x,
      y: y - 8,
      vy: -22,
      life: 1.2,
      frame: 0,
    });
  }

  function updateDog(dt) {
    dog.frameTimer += dt;
    if (dog.frameTimer > 0.12) {
      dog.frameTimer = 0;
      dog.frame = (dog.frame + 1) % 4;
    }

    if (dog.state === "wander") {
      dog.speed = 22;
      if (dog.wanderPause > 0) {
        dog.wanderPause -= dt;
        return;
      }
      if (!dog.wanderTarget) {
        dog.wanderTarget = pickWanderTarget();
      }
      const arrived = moveToward(
        dog,
        dog.wanderTarget.x,
        dog.wanderTarget.y,
        dog.speed,
        dt
      );
      if (arrived) {
        dog.wanderTarget = null;
        dog.wanderPause = 0.8 + Math.random() * 1.6;
      }
    } else if (dog.state === "run") {
      if (!dog.callTarget) {
        dog.state = "wander";
        return;
      }
      const arrived = moveToward(
        dog,
        dog.callTarget.x,
        dog.callTarget.y,
        dog.runSpeed,
        dt
      );
      if (arrived) {
        dog.state = "touch";
        dog.touchTimer = 0;
        if (hand) hand.phase = "touch";
      }
    } else if (dog.state === "touch") {
      dog.touchTimer += dt;
      if (dog.touchTimer > 0.15 && dog.touchTimer < 0.2) {
        spawnHeart(dog.x, dog.y - 10);
      }
      if (dog.touchTimer > 1.1) {
        dog.state = "wander";
        dog.callTarget = null;
        hand = null;
        dog.wanderPause = 0.4;
      }
    }
  }

  function updateHand(dt) {
    if (!hand) return;
    hand.timer += dt;
  }

  function updateHearts(dt) {
    hearts = hearts.filter((h) => {
      h.life -= dt;
      h.y += h.vy * dt;
      h.vy += 18 * dt;
      h.frame = Math.floor((1.2 - h.life) * 6);
      return h.life > 0;
    });
  }

  function drawSky() {
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, W, H * SKY_RATIO);

    for (const c of clouds) {
      ctx.fillStyle = COLORS.cloud;
      const px = Math.floor(c.x + (grassOffset * 0.02) % 8);
      ctx.fillRect(px, c.y, c.w, 6);
      ctx.fillRect(px + 4, c.y - 3, c.w - 8, 6);
      ctx.fillRect(px + 8, c.y, c.w - 12, 5);
    }
  }

  function drawGrass() {
    const fieldTop = Math.floor(H * SKY_RATIO);
    for (let y = fieldTop; y < H; y += TILE) {
      for (let x = 0; x < W; x += TILE) {
        const idx =
          ((x / TILE) | 0) +
          ((y / TILE) | 0) +
          (((x + grassOffset) / TILE) | 0);
        ctx.fillStyle = COLORS.grass[idx % COLORS.grass.length];
        ctx.fillRect(x, y, TILE, TILE);
        if (idx % 5 === 0) {
          ctx.fillStyle = COLORS.grass[2];
          ctx.fillRect(x + 3, y + 2, 1, 2);
          ctx.fillRect(x + 5, y + 4, 1, 2);
        }
      }
    }
  }

  function drawPixel(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
  }

  /** Draw a sprite part in local coords (lx = left edge when facing right). */
  function drawPart(anchorX, anchorY, lx, ly, w, h, color, facing) {
    const sx = facing >= 0 ? anchorX + lx : anchorX - lx - w;
    drawPixel(sx, anchorY + ly, w, h, color);
  }

  function drawDog() {
    const x = Math.floor(dog.x);
    const y = Math.floor(dog.y);
    const facing = dog.facing;
    const legPhase = dog.state === "touch" ? 0 : dog.frame;
    const legOffset = legPhase % 2 === 0 ? 0 : 1;
    const touchBob =
      dog.state === "touch"
        ? Math.sin(dog.touchTimer * 12) * (dog.touchTimer < 0.5 ? 2 : 0.5)
        : 0;
    const bodyY = y - touchBob;
    const touchLean = dog.state === "touch" ? 3 : 0;
    const headX = x + facing * touchLean;
    const headY = bodyY - 4 + (dog.state === "touch" ? -1 : 0);

    if (dog.state !== "touch" || dog.touchTimer < 0.35) {
      drawPart(x, bodyY, -2, 5 + legOffset, 2, 3, COLORS.dogLeg, facing);
      drawPart(x, bodyY, 4, 5 - legOffset, 2, 3, COLORS.dogLeg, facing);
    }

    drawPart(x, bodyY, -5, 0, 10, 6, COLORS.dogBody, facing);
    drawPart(x, bodyY, -4, 1, 8, 4, COLORS.dogBelly, facing);
    drawPart(x, bodyY, -3, -1, 2, 3, COLORS.dogShade, facing);
    drawPart(x, bodyY, -6, -5, 3, 4, COLORS.dogEar, facing);
    drawPart(x, bodyY, 3, -5, 3, 4, COLORS.dogEar, facing);

    drawPart(headX, headY, -4, 0, 8, 6, COLORS.dogBody, facing);
    drawPart(headX, headY, -3, 1, 1, 2, COLORS.dogEye, facing);
    drawPart(headX, headY, 1, 1, 1, 2, COLORS.dogEye, facing);
    drawPart(headX, headY, -1, 3, 2, 2, COLORS.dogNose, facing);

    const tailWag =
      dog.state === "run" || dog.state === "touch"
        ? Math.sin(dog.frame * 1.5) * 2
        : Math.sin(grassOffset * 0.1) * 1;
    drawPart(x, bodyY, -7, 1 + tailWag, 2, 2, COLORS.dogShade, facing);
    drawPart(x, bodyY, -8, tailWag, 2, 2, COLORS.dogEar, facing);
  }

  function drawHand() {
    if (!hand) return;
    const hx = Math.floor(hand.x);
    const hy = Math.floor(hand.y);
    const reach =
      hand.phase === "touch"
        ? Math.min(4, hand.timer * 12)
        : Math.max(0, 3 - hand.timer * 4);
    const py = hy - 6 - reach;

    drawPixel(hx - 2, py + 4, 5, 4, COLORS.hand);
    drawPixel(hx - 1, py, 3, 5, COLORS.hand);
    drawPixel(hx - 3, py + 1, 1, 3, COLORS.hand);
    drawPixel(hx + 2, py + 1, 1, 3, COLORS.hand);
    drawPixel(hx, py + 5, 2, 2, COLORS.handShade);

    if (hand.phase === "touch" && hand.timer > 0.3) {
      ctx.fillStyle = "rgba(255, 240, 200, 0.35)";
      ctx.beginPath();
      ctx.arc(hx, py + 2, 6 + Math.sin(hand.timer * 8) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawHeart(h) {
    const s = 1 + (1 - h.life) * 0.5;
    const hx = Math.floor(h.x);
    const hy = Math.floor(h.y);
    ctx.fillStyle = COLORS.heart;
    const p = 2 * s;
    drawPixel(hx - p, hy, p, p, COLORS.heart);
    drawPixel(hx, hy, p, p, COLORS.heart);
    drawPixel(hx - p / 2, hy + p, p * 2, p, COLORS.heart);
  }

  function drawTitle() {
    const skyH = H * SKY_RATIO;
    const fontSize = Math.max(6, Math.min(10, Math.floor(skyH * 0.42)));
    ctx.font = `${fontSize}px "Press Start 2P", monospace`;
    ctx.fillStyle = "rgba(45, 74, 45, 0.35)";
    ctx.textAlign = "left";
    ctx.fillText("TOUCH", 8, Math.max(fontSize + 2, skyH * 0.72));
  }

  function render() {
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);
    drawSky();
    drawGrass();
    drawTitle();

    const fieldTop = H * SKY_RATIO;
    const sorted = [
      { z: dog.y, draw: drawDog },
      { z: hand ? hand.y : -1, draw: drawHand },
    ].sort((a, b) => a.z - b.z);
    for (const layer of sorted) {
      if (layer.draw === drawHand && !hand) continue;
      layer.draw();
    }

    for (const h of hearts) {
      drawHeart(h);
    }
  }

  let last = performance.now();

  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    grassOffset += dt * 4;

    updateDog(dt);
    updateHand(dt);
    updateHearts(dt);
    render();
    requestAnimationFrame(loop);
  }

  function bindInput() {
    const onPointer = (e) => {
      if (!e.isPrimary) return;
      e.preventDefault();
      onTap(e.clientX, e.clientY);
    };

    stage.addEventListener("pointerdown", onPointer, { passive: false });
    stage.addEventListener("contextmenu", (e) => e.preventDefault());

    window.addEventListener("resize", layoutViewport);
    window.addEventListener("orientationchange", () => {
      setTimeout(layoutViewport, 100);
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", layoutViewport);
    }
  }

  layoutViewport();
  dog.wanderTarget = pickWanderTarget();
  bindInput();
  requestAnimationFrame(() => {
    layoutViewport();
    requestAnimationFrame(loop);
  });
})();
