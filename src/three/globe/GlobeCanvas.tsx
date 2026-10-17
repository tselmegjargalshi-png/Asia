import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  ShaderMaterial,
  Vector3,
} from 'three'
import landDots from '../../data/landDots.json'
import { destinations, type Destination } from '../../data/destinations'

const DEG = Math.PI / 180

function latLonToVec(lat: number, lon: number, r = 1): Vector3 {
  const phi = (90 - lat) * DEG
  const theta = (lon + 180) * DEG
  return new Vector3(-Math.sin(phi) * Math.cos(theta) * r, Math.cos(phi) * r, Math.sin(phi) * Math.sin(theta) * r)
}

/** Yaw that brings a longitude to face the camera (+z). */
function yawFor(d: Destination) {
  const v = latLonToVec(d.lat, d.lon)
  return -Math.atan2(v.x, v.z)
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

function LandDots() {
  const geometry = useMemo(() => {
    const data = landDots as number[]
    const n = data.length / 2
    const pos = new Float32Array(n * 3)
    const seed = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const v = latLonToVec(data[i * 2], data[i * 2 + 1], 1.001)
      pos.set([v.x, v.y, v.z], i * 3)
      seed[i] = Math.random()
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new BufferAttribute(seed, 1))
    return g
  }, [])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) } },
        vertexShader: /* glsl */ `
          uniform float uTime;
          uniform float uPixelRatio;
          attribute float aSeed;
          varying float vFacing;
          varying float vSeed;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vec3 n = normalize(normalMatrix * position);
            vFacing = n.z;
            vSeed = aSeed;
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (1.9 + aSeed * 0.9) * uPixelRatio * (3.1 / -mv.z);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          varying float vFacing;
          varying float vSeed;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            float front = smoothstep(-0.15, 0.35, vFacing);
            float shimmer = 0.75 + 0.25 * sin(uTime * 1.3 + vSeed * 30.0);
            vec3 col = mix(vec3(0.17, 0.42, 0.4), vec3(0.62, 0.9, 0.84), front) * shimmer;
            gl_FragColor = vec4(col, mix(0.08, 0.95, front));
          }
        `,
        transparent: true,
        depthWrite: false,
      }),
    [],
  )

  useFrame((s) => {
    material.uniforms.uTime.value = s.clock.elapsedTime
  })

  return <points geometry={geometry} material={material} />
}

function Body() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: /* glsl */ `
          varying vec3 vN;
          void main() {
            vN = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vN;
          void main() {
            float rim = pow(1.0 - max(vN.z, 0.0), 2.5);
            vec3 col = mix(vec3(0.008, 0.03, 0.03), vec3(0.05, 0.19, 0.19), rim);
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [],
  )
  return (
    <mesh material={material}>
      <sphereGeometry args={[0.995, 64, 48]} />
    </mesh>
  )
}

function Atmosphere() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: /* glsl */ `
          varying vec3 vN;
          void main() {
            vN = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vN;
          void main() {
            float i = pow(0.72 - dot(vN, vec3(0.0, 0.0, 1.0)), 3.0);
            gl_FragColor = vec4(vec3(0.3, 0.72, 0.66) * i * 0.55, i * 0.55);
          }
        `,
        side: BackSide,
        blending: AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    [],
  )
  return (
    <mesh material={material} scale={1.16}>
      <sphereGeometry args={[1, 64, 48]} />
    </mesh>
  )
}

function Marker({
  d,
  active,
  onHover,
  onSelect,
}: {
  d: Destination
  active: boolean
  onHover: (slug: string | null) => void
  onSelect: (slug: string) => void
}) {
  const ring = useRef<Mesh>(null)
  const pos = useMemo(() => latLonToVec(d.lat, d.lon, 1.004), [d])
  const accent = useMemo(() => new Color(active ? '#e6c48f' : d.accent), [active, d.accent])

  useFrame((s) => {
    if (!ring.current) return
    const t = (s.clock.elapsedTime * 0.6 + d.lat * 0.01) % 1
    const scale = active ? 1 + t * 2.4 : 1 + t * 1.4
    ring.current.scale.setScalar(scale)
    ;(ring.current.material as MeshBasicMaterial).opacity = (1 - t) * (active ? 0.9 : 0.5)
  })

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onHover(d.slug)
    document.body.style.cursor = 'pointer'
  }
  const out = () => {
    onHover(null)
    document.body.style.cursor = ''
  }

  return (
    <group position={pos} onUpdate={(g) => g.lookAt(pos.clone().multiplyScalar(2))}>
      <mesh>
        <circleGeometry args={[active ? 0.022 : 0.015, 24]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.024, 0.029, 40]} />
        <meshBasicMaterial color={accent} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh
        onPointerOver={over}
        onPointerOut={out}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(d.slug)
        }}
      >
        <circleGeometry args={[0.07, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

/** Great-circle arc that draws itself between the previous and current choice. */
function Arc({ from, to }: { from: Destination; to: Destination }) {
  const line = useMemo(() => {
    const a = latLonToVec(from.lat, from.lon)
    const b = latLonToVec(to.lat, to.lon)
    const angle = a.angleTo(b)
    const pts: number[] = []
    const N = 96
    for (let i = 0; i <= N; i++) {
      const t = i / N
      const v = a.clone().lerp(b, t).normalize()
      // Slerp approximation is fine at these angles once renormalised; lift toward the middle.
      const lift = 1.01 + Math.sin(t * Math.PI) * Math.min(0.42, angle * 0.16)
      v.multiplyScalar(lift)
      pts.push(v.x, v.y, v.z)
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array(pts), 3))
    g.setDrawRange(0, 0)
    const m = new LineBasicMaterial({ color: '#e6c48f', transparent: true, opacity: 0.85, depthWrite: false })
    return new Line(g, m)
  }, [from, to])
  const progress = useRef(0)

  useFrame((_, dt) => {
    progress.current = Math.min(1, progress.current + dt * 0.9)
    const e = 1 - Math.pow(1 - progress.current, 3)
    line.geometry.setDrawRange(0, Math.floor(e * 97))
  })

  return <primitive object={line} />
}

function Globe({
  active,
  previous,
  hovered,
  setHovered,
  onSelect,
  dragRef,
  labelRef,
}: {
  active: string
  previous: string | null
  hovered: string | null
  setHovered: (s: string | null) => void
  onSelect: (slug: string) => void
  dragRef: React.MutableRefObject<{ yaw: number; tilt: number; interacted: boolean; dragging: boolean }>
  labelRef: React.RefObject<HTMLDivElement | null>
}) {
  const tmp = useMemo(() => new Vector3(), [])
  const tiltGroup = useRef<Group>(null)
  const yawGroup = useRef<Group>(null)
  const current = destinations.find((d) => d.slug === active) ?? destinations[0]
  const prev = previous ? destinations.find((d) => d.slug === previous) : undefined

  // Turn the planet toward each newly chosen destination.
  useEffect(() => {
    const drag = dragRef.current
    const target = yawFor(current)
    drag.yaw = drag.yaw + wrap(target - drag.yaw)
    drag.tilt = Math.max(-0.6, Math.min(0.6, current.lat * DEG * 0.8))
  }, [current, dragRef])

  useFrame(({ camera, size }, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const drag = dragRef.current
    if (!drag.interacted && !drag.dragging) drag.yaw += dt * 0.06
    const k = 1 - Math.exp(-(drag.dragging ? 12 : 3.2) * dt)
    if (yawGroup.current) yawGroup.current.rotation.y += (drag.yaw - yawGroup.current.rotation.y) * k
    if (tiltGroup.current) tiltGroup.current.rotation.x += (drag.tilt - tiltGroup.current.rotation.x) * k

    // Pin the DOM label to the focused marker, hiding it on the far side of the planet.
    const label = labelRef.current
    const focus = destinations.find((x) => x.slug === (hovered ?? active))
    if (label && focus && yawGroup.current) {
      yawGroup.current.updateWorldMatrix(true, false)
      tmp.copy(latLonToVec(focus.lat, focus.lon, 1.01)).applyMatrix4(yawGroup.current.matrixWorld)
      const facing = tmp.clone().normalize().dot(camera.position.clone().normalize())
      tmp.project(camera)
      label.style.transform = `translate(${((tmp.x + 1) / 2) * size.width + 14}px, ${((1 - tmp.y) / 2) * size.height}px) translateY(-50%)`
      label.style.opacity = facing > 0.15 ? '1' : '0'
      if (label.textContent !== focus.name) label.textContent = focus.name
    }
  })

  return (
    <group ref={tiltGroup}>
      <group ref={yawGroup}>
        <Body />
        <LandDots />
        {destinations.map((d) => (
          <Marker
            key={d.slug}
            d={d}
            active={d.slug === active}
            onHover={setHovered}
            onSelect={onSelect}
          />
        ))}
        {prev && prev.slug !== current.slug && <Arc key={`${prev.slug}-${current.slug}`} from={prev} to={current} />}
      </group>
      <Atmosphere />
    </group>
  )
}

export default function GlobeCanvas({
  active,
  previous,
  onSelect,
  visible,
}: {
  active: string
  previous: string | null
  onSelect: (slug: string) => void
  visible: boolean
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const drag = useRef({ yaw: 0, tilt: 0.3, interacted: false, dragging: false })
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const labelRef = useRef<HTMLDivElement>(null)

  return (
    <>
    <Canvas
      dpr={[1, 2]}
      frameloop={visible ? 'always' : 'never'}
      camera={{ fov: 32, position: [0, 0, 4.1] }}
      gl={{ antialias: true, alpha: true }}
      onPointerDown={(e) => {
        pointer.current = { x: e.clientX, y: e.clientY }
        drag.current.dragging = true
        drag.current.interacted = true
      }}
      onPointerMove={(e) => {
        if (!pointer.current) return
        const dx = e.clientX - pointer.current.x
        const dy = e.clientY - pointer.current.y
        pointer.current = { x: e.clientX, y: e.clientY }
        drag.current.yaw += dx * 0.006
        drag.current.tilt = Math.max(-0.9, Math.min(0.9, drag.current.tilt + dy * 0.004))
      }}
      onPointerUp={() => {
        pointer.current = null
        drag.current.dragging = false
      }}
      onPointerLeave={() => {
        pointer.current = null
        drag.current.dragging = false
      }}
    >
      <Globe
        active={active}
        previous={previous}
        hovered={hovered}
        setHovered={setHovered}
        onSelect={onSelect}
        dragRef={drag}
        labelRef={labelRef}
      />
    </Canvas>
    <div ref={labelRef} className="globe-label" aria-hidden="true" />
    </>
  )
}
