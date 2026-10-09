"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Live 3D stand-in for the prompt's scrubbed video: an iPhone lowers onto an acrylic Tapki plate.
// `progress` (0..1) is the scrub target; the scene eases toward it every frame.

const TOUCH = 0.78; // progress at which the phone meets the plate

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

// ShapeGeometry UVs are raw shape coordinates; remap them to 0..1 so a texture fills the shape.
function normalizeUVs(geo: THREE.BufferGeometry) {
  geo.computeBoundingBox();
  const { min, max } = geo.boundingBox!;
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - min.x) / (max.x - min.x), (pos.getY(i) - min.y) / (max.y - min.y));
  }
  uv.needsUpdate = true;
}

type ScreenText = { lock: string; hint: string; opened: string; place: string; items: string[] };

function drawScreen(ctx: CanvasRenderingContext2D, logo: HTMLImageElement | null, reveal: number, text: ScreenText) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#3b3b3e");
  bg.addColorStop(0.55, "#151516");
  bg.addColorStop(1, "#050505");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // lock screen
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.textAlign = "center";
  ctx.font = "600 150px Outfit, system-ui, sans-serif";
  ctx.fillText(text.lock, W / 2, 330);
  ctx.font = "500 34px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillText(text.hint, W / 2, H - 150);
  // NFC arcs above the hint
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(W / 2, H - 205, i * 26, -Math.PI * 0.8, -Math.PI * 0.2);
    ctx.stroke();
  }

  if (reveal <= 0) return;
  // sheet sliding up after the tap
  const top = H - (H - 120) * reveal;
  ctx.fillStyle = "#f4f4f4";
  ctx.beginPath();
  ctx.roundRect(0, top, W, H - top + 60, 56);
  ctx.fill();
  ctx.save();
  ctx.globalAlpha = reveal;
  if (logo) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(W / 2, top + 150, 90, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logo, W / 2 - 90, top + 60, 180, 180);
    ctx.restore();
  }
  ctx.fillStyle = "#0a0a0a";
  ctx.font = "700 58px Outfit, system-ui, sans-serif";
  ctx.fillText(text.opened, W / 2, top + 320);
  ctx.font = "500 32px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillText(text.place, W / 2, top + 372);
  text.items.forEach((item, i) => {
    const y = top + 440 + i * 128;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(40, y, W - 80, 104, 28);
    ctx.fill();
    ctx.fillStyle = "#cfcfcf";
    ctx.beginPath();
    ctx.roundRect(60, y + 16, 72, 72, 18);
    ctx.fill();
    ctx.fillStyle = "#111111";
    ctx.textAlign = "left";
    ctx.font = "600 34px Inter, system-ui, sans-serif";
    ctx.fillText(item, 156, y + 64);
    ctx.textAlign = "center";
  });
  ctx.restore();
}

export default function TapScene({
  progress,
  auto,
  reduceMotion,
  screenText,
  onTap,
  className,
}: {
  progress: React.RefObject<number>;
  auto: boolean;
  reduceMotion: boolean | null;
  screenText: ScreenText;
  onTap?: () => void;
  className?: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const live = useRef({ auto, reduceMotion, screenText, onTap });
  live.current = { auto, reduceMotion, screenText, onTap };

  useEffect(() => {
    const mount = mountRef.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    scene.environment = pmrem.fromScene(room, 0.04).texture;
    room.dispose();

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const lookAt = new THREE.Vector3(0, 0.55, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.15));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(-4, 7, 5);
    scene.add(key);
    const rim = new THREE.SpotLight(0xffffff, 60, 20, Math.PI / 6, 0.6);
    rim.position.set(4, 5, -5);
    rim.target.position.set(0, 0, 0);
    scene.add(rim, rim.target);
    const tapLight = new THREE.PointLight(0xffffff, 0, 6, 2);
    tapLight.position.set(0, 0.35, 0);
    scene.add(tapLight);

    /* ----------------------------------------------------------- plate */
    const plate = new THREE.Group();
    scene.add(plate);

    const base = new THREE.Mesh(
      new RoundedBoxGeometry(3, 0.14, 3, 4, 0.06),
      new THREE.MeshPhysicalMaterial({ color: 0x050505, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.1 }),
    );
    base.position.y = 0.07;
    plate.add(base);

    const loader = new THREE.TextureLoader();
    const logoTex = loader.load("/logo.jpg");
    const logoMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      alphaMap: logoTex,
      alphaTest: 0.5,
      roughness: 0.25,
      metalness: 0.1,
      emissive: 0xffffff,
      emissiveIntensity: 0.12,
      side: THREE.DoubleSide,
    });
    // Stacked alpha-tested planes read as an extruded 3D logo inside the acrylic.
    const logoGeo = new THREE.PlaneGeometry(2.55, 2.55);
    for (let i = 0; i < 10; i++) {
      const layer = new THREE.Mesh(logoGeo, logoMat);
      layer.rotation.x = -Math.PI / 2;
      layer.position.y = 0.15 + i * 0.007;
      plate.add(layer);
    }

    const acrylic = new THREE.Mesh(
      new RoundedBoxGeometry(3.2, 0.32, 3.2, 8, 0.14),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 1,
        thickness: 0.6,
        roughness: 0.03,
        ior: 1.49,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        attenuationColor: new THREE.Color(0xe8f0f4),
        attenuationDistance: 3,
        envMapIntensity: 1.4,
      }),
    );
    acrylic.position.y = 0.3;
    plate.add(acrylic);
    const PLATE_TOP = 0.46;

    const ringGeo = new THREE.RingGeometry(1, 1.03, 128);
    const rings = [0, 1, 2].map(() => {
      const ring = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = PLATE_TOP + 0.01;
      plate.add(ring);
      return ring;
    });

    /* ----------------------------------------------------------- phone */
    const PW = 1.46;
    const PH = 3.0;
    const phoneRoot = new THREE.Group();
    scene.add(phoneRoot);
    const phone = new THREE.Group();
    phone.rotation.x = -Math.PI / 2; // screen up, top of the phone pointing away from camera
    phoneRoot.add(phone);

    const bodyGeo = new THREE.ExtrudeGeometry(roundedRect(PW, PH, 0.24), {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 6,
      curveSegments: 24,
    });
    const body = new THREE.Mesh(
      bodyGeo,
      new THREE.MeshPhysicalMaterial({ color: 0x3a3a3d, metalness: 0.92, roughness: 0.26, clearcoat: 0.6, clearcoatRoughness: 0.15 }),
    );
    phone.add(body);

    const bezel = new THREE.Mesh(
      new THREE.ShapeGeometry(roundedRect(PW - 0.02, PH - 0.02, 0.23), 24),
      new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.1, clearcoat: 1 }),
    );
    bezel.position.z = 0.131;
    phone.add(bezel);

    const canvas = document.createElement("canvas");
    canvas.width = 540;
    canvas.height = 1110;
    const ctx = canvas.getContext("2d")!;
    const screenTex = new THREE.CanvasTexture(canvas);
    screenTex.colorSpace = THREE.SRGBColorSpace;
    screenTex.anisotropy = 8;
    const screenGeo = new THREE.ShapeGeometry(roundedRect(PW - 0.1, PH - 0.1, 0.19), 24);
    normalizeUVs(screenGeo);
    const screen = new THREE.Mesh(
      screenGeo,
      new THREE.MeshPhysicalMaterial({
        color: 0x000000,
        emissive: 0xffffff,
        emissiveMap: screenTex,
        emissiveIntensity: 1,
        roughness: 0.08,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
      }),
    );
    screen.position.z = 0.133;
    phone.add(screen);

    const island = new THREE.Mesh(
      new THREE.ShapeGeometry(roundedRect(0.42, 0.12, 0.06), 12),
      new THREE.MeshBasicMaterial({ color: 0x000000 }),
    );
    island.position.set(0, PH / 2 - 0.16, 0.135);
    phone.add(island);

    const buttonMat = new THREE.MeshPhysicalMaterial({ color: 0x3a3a3d, metalness: 0.9, roughness: 0.3 });
    [
      [-PW / 2 - 0.035, 0.75, 0.22],
      [-PW / 2 - 0.035, 0.35, 0.36],
      [-PW / 2 - 0.035, -0.08, 0.36],
      [PW / 2 + 0.035, 0.45, 0.5],
    ].forEach(([x, y, h]) => {
      const b = new THREE.Mesh(new RoundedBoxGeometry(0.04, h, 0.06, 2, 0.015), buttonMat);
      b.position.set(x, y, 0.05);
      phone.add(b);
    });

    let logoImg: HTMLImageElement | null = null;
    let lastReveal = -1;
    let lastText = "";
    const paint = (reveal: number) => {
      const textKey = JSON.stringify(live.current.screenText);
      const q = Math.round(reveal * 40) / 40;
      if (q === lastReveal && textKey === lastText) return;
      lastReveal = q;
      lastText = textKey;
      drawScreen(ctx, logoImg, q, live.current.screenText);
      screenTex.needsUpdate = true;
    };
    const img = new Image();
    img.onload = () => {
      logoImg = img;
      lastReveal = -1;
    };
    img.src = "/logo.jpg";

    /* ------------------------------------------------------ animation */
    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const far = w / h < 1 ? 2.2 : 1.45; // pull back further on portrait screens
      camera.position.set(0, 5.6 * far, 7.6 * far);
      camera.lookAt(lookAt);
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    const start = { pos: new THREE.Vector3(2.5, 2.6, -1.1), rot: new THREE.Euler(0.55, -0.7, 0.4) };
    const end = { pos: new THREE.Vector3(0.12, PLATE_TOP + 0.035, 0.22), rot: new THREE.Euler(0.03, -0.18, 0.02) };
    const clock = new THREE.Clock();
    let current = 0;
    let wasTouching = false;
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      const { auto, reduceMotion } = live.current;
      const target = auto && !reduceMotion ? 0.5 - 0.5 * Math.cos(t * 0.55) : progress.current ?? 0;
      current += (target - current) * (reduceMotion ? 1 : 0.08);
      const p = clamp01(current);

      const a = easeInOut(clamp01(p / TOUCH));
      phoneRoot.position.lerpVectors(start.pos, end.pos, a);
      phoneRoot.rotation.set(
        THREE.MathUtils.lerp(start.rot.x, end.rot.x, a),
        THREE.MathUtils.lerp(start.rot.y, end.rot.y, a),
        THREE.MathUtils.lerp(start.rot.z, end.rot.z, a),
      );
      if (!reduceMotion) {
        phoneRoot.position.y += Math.sin(t * 1.3) * 0.06 * (1 - a);
        plate.rotation.y = Math.sin(t * 0.25) * 0.06;
        camera.position.x = Math.sin(t * 0.18) * 0.35;
        camera.lookAt(lookAt);
      }

      const glow = smooth(TOUCH - 0.06, TOUCH + 0.04, p);
      tapLight.intensity = glow * 7;
      logoMat.emissiveIntensity = 0.12 + glow * 1.1;
      rings.forEach((ring, i) => {
        const k = reduceMotion ? 0.5 : (t * 0.55 + i / 3) % 1;
        ring.scale.setScalar(1.05 + k * 2.4);
        (ring.material as THREE.MeshBasicMaterial).opacity = glow * (1 - k) * 0.7;
      });
      paint(smooth(TOUCH + 0.02, 0.98, p));

      const touching = p >= TOUCH;
      if (touching && !wasTouching) live.current.onTap?.();
      wasTouching = touching;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((m) => m.dispose());
      });
      logoTex.dispose();
      screenTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [progress]);

  return <div ref={mountRef} className={className} />;
}
