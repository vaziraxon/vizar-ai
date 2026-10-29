"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { MultiPolygon, Polygon } from "geojson";
import landTopology from "world-atlas/land-110m.json";

// ---------------------------------------------------------------------------
// Landing hero globe — React Three Fiber. Continents are painted onto a
// canvas texture from Natural Earth outlines (world-atlas), so no image is
// downloaded. A glossy ocean, an atmosphere halo, gold flight arcs from
// Tashkent with travelling light pulses and little planes flying them, a
// tilted orbit with two planes and sparkles. Spins once every ~40s; drag to
// turn it, it coasts and then resumes. Rendering stops while the hero is off
// screen.
// ---------------------------------------------------------------------------

const TURN_SECONDS = 40;
const GOLD = "#F2C14E";
const HOME = { lat: 41.31, lon: 69.24 }; // Tashkent
const ROUTES = [
  { lat: 48.86, lon: 2.35 }, // Paris
  { lat: 51.51, lon: -0.13 }, // London
  { lat: 40.71, lon: -74.0 }, // New York
  { lat: 43.65, lon: -79.38 }, // Toronto
  { lat: 35.68, lon: 139.69 }, // Tokyo
  { lat: 37.57, lon: 126.98 }, // Seoul
  { lat: 25.2, lon: 55.27 }, // Dubai
  { lat: 41.01, lon: 28.98 }, // Istanbul
  { lat: 52.52, lon: 13.4 }, // Berlin
  { lat: 41.9, lon: 12.5 }, // Rome
  { lat: 52.23, lon: 21.01 }, // Warsaw
  { lat: 39.9, lon: 116.4 }, // Beijing
  { lat: 1.35, lon: 103.82 }, // Singapore
  { lat: -33.87, lon: 151.21 }, // Sydney
  { lat: 34.05, lon: -118.24 }, // Los Angeles
];
// Every other route also has a small plane flying it (fewer on phones)
const FLIGHT_PLANE_SCALE = 0.75;

/** Same mapping as THREE.SphereGeometry's UVs, so markers sit on the texture. */
function latLonToVec3(lat: number, lon: number, r = 1) {
  const phi = ((lon + 180) * Math.PI) / 180;
  const theta = ((90 - lat) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta));
}

/** Y rotation that turns the given longitude toward the camera (+z). */
const faceLongitude = (lon: number) => Math.PI / 2 - ((lon + 180) * Math.PI) / 180;

function paintEarth(): HTMLCanvasElement {
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d")!;

  // Ocean — deep royal blue toward the poles, bright azure at the equator
  const sea = g.createLinearGradient(0, 0, 0, H);
  sea.addColorStop(0, "#22388F");
  sea.addColorStop(0.3, "#2F63D8");
  sea.addColorStop(0.5, "#4A92F2");
  sea.addColorStop(0.7, "#2F63D8");
  sea.addColorStop(1, "#22388F");
  g.fillStyle = sea;
  g.fillRect(0, 0, W, H);

  // Graticule every 20°
  g.strokeStyle = "rgba(255, 255, 255, 0.13)";
  g.lineWidth = 1.5;
  for (let lon = -180; lon <= 180; lon += 20) {
    const x = ((lon + 180) / 360) * W;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, H);
    g.stroke();
  }
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * H;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y);
    g.stroke();
  }

  // Land — pale sage with a soft white coastline
  const land = feature(landTopology as unknown as Topology, (landTopology as unknown as Topology).objects.land as GeometryCollection);
  const polygons: number[][][][] = [];
  for (const f of land.features) {
    const geom = f.geometry as Polygon | MultiPolygon;
    if (geom.type === "Polygon") polygons.push(geom.coordinates);
    else polygons.push(...geom.coordinates);
  }
  const shore = g.createLinearGradient(0, 0, 0, H);
  shore.addColorStop(0, "#FAFCF7");
  shore.addColorStop(0.35, "#EAF4DC");
  shore.addColorStop(0.55, "#E2EFCB");
  shore.addColorStop(0.8, "#F0F5E8");
  shore.addColorStop(1, "#FFFFFF");
  g.fillStyle = shore;
  g.strokeStyle = "rgba(255, 255, 255, 0.75)";
  g.lineWidth = 2;
  g.lineJoin = "round";
  for (const rings of polygons) {
    g.beginPath();
    // Draw each polygon at three horizontal offsets so shapes that cross the
    // antimeridian wrap around instead of streaking across the map
    for (const offset of [-W, 0, W]) {
      for (const ring of rings) {
        let prevLon = ring[0]![0]!;
        let shift = 0;
        ring.forEach(([lon, lat], i) => {
          const d = lon! - prevLon;
          // Unwrap jumps across ±180°, except along the polar edge of Antarctica
          if (i > 0 && Math.abs(lat!) < 85) {
            if (d > 180) shift -= 360;
            else if (d < -180) shift += 360;
          }
          prevLon = lon!;
          const x = ((lon! + shift + 180) / 360) * W + offset;
          const y = ((90 - lat!) / 180) * H;
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        });
        g.closePath();
      }
    }
    g.fill("evenodd");
    g.stroke();
  }
  return canvas;
}

const haloVertex = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
// Back-face halo: strongest at the globe's edge, fading outward; blue at the
// bottom blending into violet at the top
const haloFragment = /* glsl */ `
  uniform vec3 uLow;
  uniform vec3 uHigh;
  uniform float uStrength;
  varying vec3 vNormal;
  void main() {
    float k = clamp(-dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
    vec3 color = mix(uLow, uHigh, clamp(vNormal.y * 0.5 + 0.5, 0.0, 1.0));
    gl_FragColor = vec4(color, clamp(pow(k, 1.4) * uStrength, 0.0, 0.85));
  }
`;
// Front-face rim light on the globe itself
const rimFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormal;
  void main() {
    float rim = pow(1.0 - clamp(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 2.6);
    gl_FragColor = vec4(uColor, rim * 0.6);
  }
`;
// Round, soft points with a per-point alpha and size
const sparkVertex = /* glsl */ `
  attribute float aAlpha;
  attribute float aSize;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (4.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const sparkFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, d) * vAlpha);
  }
`;

function sparkMaterial(color: string, pixelRatio: number) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uPixelRatio: { value: pixelRatio } },
    vertexShader: sparkVertex,
    fragmentShader: sparkFragment,
    transparent: true,
    depthWrite: false,
  });
}

/**
 * Small white airliner, nose along +z (so lookAt points it forward). With
 * `violetWings` the wings are violet too, so it stays visible over pale land.
 */
function makePlane(violetWings = false) {
  const plane = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.35, metalness: 0.1 });
  const violet = new THREE.MeshStandardMaterial({ color: "#7138EC", roughness: 0.4 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.017, 0.1, 4, 10), white);
  body.rotation.x = Math.PI / 2;
  const wings = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.006, 0.032), violetWings ? violet : white);
  wings.position.z = 0.004;
  const tailplane = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.005, 0.018), violetWings ? violet : white);
  tailplane.position.z = -0.052;
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.034, 0.024), violet);
  fin.position.set(0, 0.018, -0.05);
  plane.add(body, wings, tailplane, fin);
  plane.scale.setScalar(1.25);
  return plane;
}

function Scene({ reducedMotion, compact }: { reducedMotion: boolean; compact: boolean }) {
  const { gl, size, invalidate } = useThree();
  const spin = useRef<THREE.Group>(null);
  const orbit = useRef<THREE.Group>(null);
  const plane = useMemo(() => makePlane(), []);
  const plane2 = useMemo(() => makePlane(), []);
  const drag = useRef({ active: false, x: 0, y: 0, vy: 0, vx: 0, tiltX: 0, at: 0 });

  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(paintEarth());
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = gl.capabilities.getMaxAnisotropy();
    return tex;
  }, [gl]);

  const pixelRatio = gl.getPixelRatio();

  // Flight arcs from Tashkent, each with a light pulse
  const arcs = useMemo(() => {
    const from = latLonToVec3(HOME.lat, HOME.lon, 1.004);
    return ROUTES.map((to, i) => {
      const end = latLonToVec3(to.lat, to.lon, 1.004);
      // Long hauls are capped so their arcs stay inside the canvas
      const lift = 1 + 0.12 + Math.min(from.angleTo(end), 1.25) * 0.22;
      const mid = from.clone().add(end).normalize().multiplyScalar(lift);
      const curve = new THREE.QuadraticBezierCurve3(from, mid, end);
      return { curve, end, geometry: new THREE.TubeGeometry(curve, 64, 0.0042, 6, false), phase: i / ROUTES.length };
    });
  }, []);
  const pulses = useRef<THREE.Mesh[]>([]);
  const flights = useMemo(
    () =>
      arcs
        .filter((_, i) => i % 2 === 0)
        .slice(0, compact ? 5 : 8)
        .map((arc, k, list) => {
          const plane = makePlane(true);
          plane.scale.setScalar(FLIGHT_PLANE_SCALE);
          return { arc, plane, phase: k / list.length, speed: 0.06 + (k % 3) * 0.012 };
        }),
    [arcs, compact]
  );
  const aim = useMemo(() => ({ m: new THREE.Matrix4(), pos: new THREE.Vector3(), dir: new THREE.Vector3(), up: new THREE.Vector3() }), []);
  const homeRing = useRef<THREE.Mesh>(null);

  // Orbit: a dashed gold ellipse and sparkles drifting along it
  const ORBIT_R = 1.34;
  const orbitLine = useMemo(() => {
    const pts = new THREE.EllipseCurve(0, 0, ORBIT_R, ORBIT_R, 0, Math.PI * 2, false, 0).getPoints(240);
    const geometry = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, 0, p.y)));
    const line = new THREE.Line(
      geometry,
      new THREE.LineDashedMaterial({ color: GOLD, dashSize: 0.035, gapSize: 0.045, transparent: true, opacity: 0.75 })
    );
    line.computeLineDistances();
    return line;
  }, []);
  const SPARKS = compact ? 24 : 42;
  const TRAIL = 22;
  const sparks = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const count = SPARKS + TRAIL * 2;
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(count), 1));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(count), 1));
    const seeds = Array.from({ length: SPARKS }, () => ({ a: Math.random() * Math.PI * 2, r: ORBIT_R + (Math.random() - 0.5) * 0.08, s: 0.04 + Math.random() * 0.08, tw: Math.random() * 6 }));
    const points = new THREE.Points(geometry, sparkMaterial("#FFE7A3", pixelRatio));
    points.frustumCulled = false; // positions change every frame
    return { points, seeds };
  }, [SPARKS, pixelRatio]);
  const ahead = useMemo(() => new THREE.Vector3(), []);

  // Drag to rotate (pointer events on the canvas; vertical page scroll keeps working on touch)
  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = "pan-y";
    el.style.cursor = "grab";
    const down = (e: PointerEvent) => {
      drag.current.active = true;
      drag.current.x = e.clientX;
      drag.current.y = e.clientY;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d.active) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      d.x = e.clientX;
      d.y = e.clientY;
      d.at = performance.now();
      d.vy = (dx / size.width) * 4.2;
      d.vx = (dy / size.height) * 2.4;
      if (spin.current) spin.current.rotation.y += d.vy;
      d.tiltX = THREE.MathUtils.clamp(d.tiltX + d.vx, -0.45, 0.45);
      invalidate();
    };
    const up = (e: PointerEvent) => {
      const d = drag.current;
      d.active = false;
      // A pause before letting go means no fling
      if (performance.now() - d.at > 90) d.vy = 0;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      el.style.cursor = "grab";
      invalidate();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [gl, size.width, size.height, invalidate]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = reducedMotion ? 2 : state.clock.elapsedTime;
    const d = drag.current;

    if (spin.current) {
      if (!d.active) {
        // Coast after a drag, then settle back into the slow turn
        spin.current.rotation.y += d.vy + (reducedMotion ? 0 : ((Math.PI * 2) / TURN_SECONDS) * dt);
        d.vy *= 0.93;
        d.tiltX *= 0.96;
      }
      spin.current.parent!.rotation.x = 0.32 + d.tiltX;
    }

    // Light pulses travel along every arc and fade at both ends
    arcs.forEach((arc, i) => {
      const pulse = pulses.current[i];
      if (!pulse) return;
      const p = (t * 0.22 + arc.phase) % 1;
      pulse.position.copy(arc.curve.getPoint(p));
      const fade = Math.sin(p * Math.PI);
      (pulse.material as THREE.MeshBasicMaterial).opacity = fade;
      pulse.scale.setScalar(0.6 + fade * 0.6);
    });
    if (homeRing.current) {
      const k = (t * 0.6) % 1;
      homeRing.current.scale.setScalar(1 + k * 2.4);
      (homeRing.current.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.8;
    }

    // Planes fly the arcs nose-first, belly to the globe, growing in after take-off and shrinking before landing
    flights.forEach((f) => {
      const p = (t * f.speed + f.phase) % 1;
      f.arc.curve.getPoint(p, aim.pos);
      f.arc.curve.getTangent(p, aim.dir);
      aim.up.copy(aim.pos).normalize();
      aim.m.lookAt(aim.dir.add(aim.pos), aim.pos, aim.up);
      f.plane.position.copy(aim.pos);
      f.plane.quaternion.setFromRotationMatrix(aim.m);
      f.plane.scale.setScalar(Math.max(0.001, FLIGHT_PLANE_SCALE * Math.min(1, Math.sin(p * Math.PI) * 4)));
    });

    // Orbit: two planes lap it on opposite sides, sparkles drift and twinkle, a fading trail follows each plane
    const angle = t * ((Math.PI * 2) / 16);
    const laps = [
      { craft: plane, a: angle },
      { craft: plane2, a: angle + Math.PI },
    ];
    if (orbit.current) orbit.current.updateMatrixWorld();
    for (const { craft, a } of laps) {
      craft.position.set(Math.cos(a) * ORBIT_R, 0, Math.sin(a) * ORBIT_R);
      // lookAt takes world coordinates: aim at the point just ahead on the orbit
      if (orbit.current) craft.lookAt(orbit.current.localToWorld(ahead.set(Math.cos(a + 0.05) * ORBIT_R, 0, Math.sin(a + 0.05) * ORBIT_R)));
    }
    const pos = sparks.points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const alpha = sparks.points.geometry.getAttribute("aAlpha") as THREE.BufferAttribute;
    const sizeAttr = sparks.points.geometry.getAttribute("aSize") as THREE.BufferAttribute;
    sparks.seeds.forEach((s, i) => {
      const a = s.a + t * s.s;
      pos.setXYZ(i, Math.cos(a) * s.r, Math.sin(a * 3 + s.tw) * 0.012, Math.sin(a) * s.r);
      alpha.setX(i, 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * 2.2 + s.tw)));
      sizeAttr.setX(i, 5 + 4 * (0.5 + 0.5 * Math.sin(t * 1.3 + s.tw * 2)));
    });
    laps.forEach(({ a: lead }, n) => {
      for (let k = 0; k < TRAIL; k++) {
        const i = SPARKS + n * TRAIL + k;
        const a = lead - (k + 1) * 0.028;
        pos.setXYZ(i, Math.cos(a) * ORBIT_R, 0, Math.sin(a) * ORBIT_R);
        alpha.setX(i, 0.85 * (1 - k / TRAIL));
        sizeAttr.setX(i, 7 * (1 - k / TRAIL) + 2);
      }
    });
    pos.needsUpdate = true;
    alpha.needsUpdate = true;
    sizeAttr.needsUpdate = true;

    if (orbit.current && !reducedMotion) orbit.current.rotation.y += dt * 0.02;
  });

  const segments = compact ? [72, 48] : [112, 72];

  return (
    <>
      <ambientLight intensity={1.25} />
      <directionalLight position={[-3, 2.4, 4]} intensity={0.95} />
      <directionalLight position={[3.5, -1, -2]} intensity={0.6} color="#B9A6FF" />

      {/* Axial tilt (outer) + spin (inner), so the globe turns about its own axis */}
      <group rotation={[0.32, 0, -0.2]}>
        <group ref={spin} rotation={[0, faceLongitude(48), 0]}>
          <mesh>
            <sphereGeometry args={[1, segments[0], segments[1]]} />
            <meshPhysicalMaterial map={texture} roughness={0.6} metalness={0} clearcoat={0.45} clearcoatRoughness={0.38} />
          </mesh>
          {arcs.map((arc, i) => (
            <group key={i}>
              <mesh geometry={arc.geometry}>
                <meshBasicMaterial color={GOLD} transparent opacity={0.85} />
              </mesh>
              <mesh position={arc.end}>
                <sphereGeometry args={[0.012, 12, 12]} />
                <meshBasicMaterial color="#FFE7A3" />
              </mesh>
              <mesh ref={(m) => { if (m) pulses.current[i] = m; }}>
                <sphereGeometry args={[0.016, 12, 12]} />
                <meshBasicMaterial color="#FFFBEA" transparent />
              </mesh>
            </group>
          ))}
          {/* Tashkent — home marker with a pulsing ring */}
          <group position={latLonToVec3(HOME.lat, HOME.lon, 1.006)} onUpdate={(g) => g.lookAt(0, 0, 0)}>
            <mesh>
              <sphereGeometry args={[0.02, 16, 16]} />
              <meshBasicMaterial color={GOLD} />
            </mesh>
            <mesh ref={homeRing}>
              <ringGeometry args={[0.022, 0.03, 32]} />
              <meshBasicMaterial color={GOLD} transparent side={THREE.DoubleSide} />
            </mesh>
          </group>
          {flights.map((f, i) => (
            <primitive key={i} object={f.plane} />
          ))}
        </group>
        {/* Rim light on the sphere */}
        <mesh scale={1.003}>
          <sphereGeometry args={[1, 64, 48]} />
          <shaderMaterial
            vertexShader={haloVertex}
            fragmentShader={rimFragment}
            uniforms={{ uColor: { value: new THREE.Color("#DCE8FF") } }}
            transparent
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Atmosphere halo — blue below, violet above */}
      <mesh scale={1.17}>
        <sphereGeometry args={[1, 64, 48]} />
        <shaderMaterial
          vertexShader={haloVertex}
          fragmentShader={haloFragment}
          uniforms={{ uLow: { value: new THREE.Color("#7FB2FF") }, uHigh: { value: new THREE.Color("#B79BFF") }, uStrength: { value: 1.5 } }}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Gold flight orbit with the plane and sparkles */}
      <group rotation={[0.38, 0, -0.3]}>
        <group ref={orbit}>
          <primitive object={orbitLine} />
          <primitive object={sparks.points} />
          <primitive object={plane} />
          <primitive object={plane2} />
        </group>
      </group>
    </>
  );
}

export function Globe3D({
  active,
  reducedMotion,
  compact,
  onReady,
}: {
  active: boolean;
  reducedMotion: boolean;
  compact: boolean;
  onReady: () => void;
}) {
  return (
    <Canvas
      flat
      dpr={[1, compact ? 1.5 : 1.75]}
      camera={{ position: [0, 0, 4.6], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={active ? (reducedMotion ? "demand" : "always") : "never"}
      onCreated={() => onReady()}
      aria-hidden="true"
    >
      <Scene reducedMotion={reducedMotion} compact={compact} />
    </Canvas>
  );
}
