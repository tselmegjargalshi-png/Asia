import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { cloneValues, dampValues, mixValues, presets, world } from '../lib/world'
import { shared } from './uniforms'

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/**
 * Owns the camera and every shared uniform. Reads the scroll director's target,
 * smooths it, and flies the camera forward over the procedural world.
 */
export function Director({ onReady }: { onReady: () => void }) {
  const { camera, gl, scene } = useThree()
  const blended = useRef(cloneValues(presets.hero))
  const distance = useRef(0)
  const lastScroll = useRef(world.scroll)
  const pointer = useRef({ x: 0, y: 0 })
  const frames = useRef(0)
  const readyFired = useRef(false)

  useEffect(() => {
    // Compile every program up front so the first scroll never hitches.
    gl.compile(scene, camera)
  }, [gl, scene, camera])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 8)
    const cur = world.current

    // Optional atmosphere override (category hover) blended over the scroll target.
    const goal = world.override ? 1 : 0
    world.overrideMix += (goal - world.overrideMix) * (1 - Math.exp(-3 * dt))
    if (world.override && world.overrideMix > 0.001) {
      mixValues(blended.current, world.target, presets[world.override], world.overrideMix)
    } else {
      mixValues(blended.current, world.target, world.target, 0)
    }
    dampValues(cur, blended.current, 2, dt)

    // Fly forward: a constant cruise plus whatever the visitor scrolls.
    const scrollDelta = world.scroll - lastScroll.current
    lastScroll.current = world.scroll
    distance.current += dt * 2.2 + Math.max(-40, Math.min(40, scrollDelta)) * 0.035
    const t = state.clock.elapsedTime

    shared.uTime.value = t
    shared.uOffset.value.set(Math.sin(distance.current * 0.004) * 30, -distance.current)
    shared.uAmplitude.value = cur.amplitude
    shared.uDunes.value = cur.dunes
    shared.uWater.value = cur.water
    shared.uSunDir.value
      .set(
        Math.sin(cur.sunAzimuth) * Math.cos(cur.sunElevation),
        Math.sin(cur.sunElevation),
        -Math.cos(cur.sunAzimuth) * Math.cos(cur.sunElevation),
      )
      .normalize()
    shared.uSunColor.value.copy(cur.sun)
    shared.uSkyTop.value.copy(cur.skyTop)
    shared.uSkyHorizon.value.copy(cur.skyHorizon)
    shared.uFogColor.value.copy(cur.fog)
    shared.uFogDensity.value = cur.fogDensity
    shared.uTerrainLow.value.copy(cur.terrainLow)
    shared.uTerrainMid.value.copy(cur.terrainMid)
    shared.uTerrainHigh.value.copy(cur.terrainHigh)
    shared.uWaterDeep.value.copy(cur.waterDeep)
    shared.uWaterShallow.value.copy(cur.waterShallow)
    shared.uStars.value = cur.stars
    shared.uAurora.value = cur.aurora
    shared.uExposure.value = cur.exposure
    shared.uDustColor.value.copy(cur.dust)

    // Opening descent: from above the cloud deck down into the valley.
    const intro = easeInOut(world.intro)
    shared.uClouds.value = Math.max(cur.clouds, 1 - intro * 0.6)
    const inDeck = Math.max(0, 1 - Math.abs(intro - 0.42) / 0.3)
    shared.uVeil.value = inDeck * 0.6 * (1 - world.intro * 0.4)

    // Pointer parallax, smoothed.
    const k = 1 - Math.exp(-2.5 * dt)
    pointer.current.x += (world.pointer.x - pointer.current.x) * k
    pointer.current.y += (world.pointer.y - pointer.current.y) * k

    const height = cur.camHeight + Math.max(0, cur.water + 3) * 0.6
    const y = 78 + (height - 78) * intro
    const pitch = -0.95 + (cur.camPitch + 0.95) * intro
    camera.position.set(pointer.current.x * 1.6, y + pointer.current.y * 0.6 + Math.sin(t * 0.35) * 0.25, 0)
    camera.rotation.set(
      pitch + pointer.current.y * 0.035,
      -pointer.current.x * 0.07,
      Math.sin(t * 0.21) * 0.006 - pointer.current.x * 0.012,
      'YXZ',
    )

    if (!readyFired.current && ++frames.current > 4) {
      readyFired.current = true
      onReady()
    }
  })

  return null
}
