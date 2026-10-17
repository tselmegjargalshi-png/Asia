import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { NoToneMapping } from 'three'
import { getQuality } from '../lib/device'
import { Clouds } from './Clouds'
import { Director } from './Director'
import { Dust } from './Dust'
import { Sky } from './Sky'
import { Terrain } from './Terrain'
import { Water } from './Water'

export default function WorldCanvas({ onReady }: { onReady: () => void }) {
  const quality = useMemo(getQuality, [])
  const pixelRatio = Math.min(window.devicePixelRatio || 1, quality.dpr[1])

  return (
    <Canvas
      className="world-canvas"
      dpr={quality.dpr}
      gl={{
        antialias: quality.tier === 'high',
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
        toneMapping: NoToneMapping,
      }}
      camera={{ fov: 52, near: 0.5, far: 1200, position: [0, 78, 0] }}
      onCreated={({ gl }) => gl.setClearColor('#030807')}
      aria-hidden="true"
    >
      <Director onReady={onReady} />
      <Sky />
      <Terrain segments={quality.terrainSegments} />
      <Water segments={Math.round(quality.terrainSegments / 2)} />
      <Clouds layers={quality.cloudLayers} />
      <Dust count={quality.dust} pixelRatio={pixelRatio} />
    </Canvas>
  )
}
