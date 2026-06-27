import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ENVIRONMENT_MAP_URL, LAPTOP_MODEL_URL } from './laptopShowcaseAssets'

const ENVIRONMENT_ROTATION_Y_DEGREES = 20
const MODEL_VERTICAL_OFFSET = -0.3
const LID_OPEN_DELTA_DEGREES = -108
const LID_ANIMATION_SECONDS = 1.05
const KEY_PRESS_DEPTH = 0.0025
const KEY_PRESS_DOWN_SECONDS = 0.07
const KEY_RELEASE_SECONDS = 0.14

let laptopModelPromise: Promise<THREE.Group> | null = null
let environmentTexturePromise: Promise<THREE.DataTexture> | null = null
let environmentMapPromise: Promise<THREE.Texture> | null = null

// Module-level PMREM cache: load EXR once, convert to PMREM once, reuse across remounts
let cachedPMREM: THREE.Texture | null = null

// Exports for external consumers (e.g., preload)
export { loadLaptopModel, loadEnvironmentTexture }

type SceneTheme = 'dark' | 'light'

type LaptopSceneProps = {
  baseCanvasHeight: number
  dragRotation: { x: number; y: number }
  lidOpen: boolean
  onKeyboardPress: () => void
  onModelReady: () => void
  theme: SceneTheme
}

type LaptopModel = {
  lid: THREE.Object3D | null
  root: THREE.Group
}

type LidAnimation = {
  from: number
  startedAt: number
  to: number
}

type PointerState = {
  dragging: boolean
  lastX: number
  lastY: number
  travel: number
}

type KeyPressState = {
  currentOffset: number
  object: THREE.Object3D
  originalY: number
  pressedAt: number
  pressStartOffset: number
  releasedAt: number | null
  releaseStartOffset: number
}

type CanvasBounds = {
  baseHeight: number
  bottom: number
  top: number
}

type KaliLaptopShowcaseProps = {
  onReady?: () => void
}

export function preloadKaliLaptopShowcaseResources() {
  void loadLaptopModel()
  void loadEnvironmentTexture()
}

export function KaliLaptopShowcase({ onReady }: KaliLaptopShowcaseProps = {}) {
  const sceneRef = useRef<HTMLDivElement | null>(null)
  const pointerRef = useRef<PointerState>({ dragging: false, lastX: 0, lastY: 0, travel: 0 })
  const suppressNextClickRef = useRef(false)
  const readyFrameRef = useRef<number | null>(null)
  const [canvasBounds, setCanvasBounds] = useState<CanvasBounds>(() => getBaseCanvasBounds())
  const [canvasReady, setCanvasReady] = useState(false)
  const [dragRotation, setDragRotation] = useState({ x: 0, y: 0 })
  const [environmentReady, setEnvironmentReady] = useState(Boolean(cachedPMREM))
  const [lidOpen, setLidOpen] = useState(false)
  const [modelReady, setModelReady] = useState(false)
  const [zoom, setZoom] = useState(0)
  const theme = useSceneTheme()
  const sceneReady = canvasReady && environmentReady && modelReady
  const handleEnvironmentReady = useCallback(() => setEnvironmentReady(true), [])
  const handleModelReady = useCallback(() => setModelReady(true), [])

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const element = sceneRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      setCanvasBounds((current) => {
        const next = getCanvasBounds(rect)
        return current.top === next.top && current.bottom === next.bottom ? current : next
      })
    }

    const requestUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('resize', requestUpdate)
    const resizeObserver = new ResizeObserver(requestUpdate)
    if (sceneRef.current) resizeObserver.observe(sceneRef.current)

    return () => {
      window.removeEventListener('resize', requestUpdate)
      resizeObserver.disconnect()
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    if (!sceneReady) return

    readyFrameRef.current = window.requestAnimationFrame(() => {
      readyFrameRef.current = window.requestAnimationFrame(() => {
        readyFrameRef.current = null
        onReady?.()
      })
    })

    return () => {
      if (readyFrameRef.current !== null) {
        window.cancelAnimationFrame(readyFrameRef.current)
        readyFrameRef.current = null
      }
    }
  }, [onReady, sceneReady])

  useEffect(() => {
    const el = sceneRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      setZoom((z) => Math.max(-4, Math.min(4, z - e.deltaY * 0.005)))
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  return (
    <div
      className="laptop-showcase"
      data-showcase-ready={sceneReady ? "true" : "false"}
      data-loader-pending={sceneReady ? undefined : "laptop-showcase"}
      ref={sceneRef}
    >
      <div className="laptop-showcase__status" aria-hidden={sceneReady}>
        <span>Loading model</span>
      </div>
      <div
        aria-label="ROG 笔记本电脑 3D 模型展示，可拖动查看"
        className="laptop-showcase__stage"
        onPointerCancel={stopDragging}
        onPointerDown={(event) => {
          pointerRef.current = { dragging: true, lastX: event.clientX, lastY: event.clientY, travel: 0 }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerLeave={stopDragging}
        onPointerMove={(event) => {
          const pointer = pointerRef.current
          if (!pointer.dragging) return

          const deltaX = event.clientX - pointer.lastX
          const deltaY = event.clientY - pointer.lastY
          pointerRef.current = {
            dragging: true,
            lastX: event.clientX,
            lastY: event.clientY,
            travel: pointer.travel + Math.hypot(deltaX, deltaY),
          }
          setDragRotation((current) => ({
            x: current.x - deltaY * 0.16,
            y: current.y + deltaX * 0.18,
          }))
        }}
        onPointerUp={(event) => {
          const shouldToggleLid = pointerRef.current.travel < 6 && !suppressNextClickRef.current
          stopDragging(event)
          suppressNextClickRef.current = false
          pointerRef.current.travel = 0
          if (shouldToggleLid) setLidOpen((current) => !current)
        }}
      >
        <Canvas
          camera={{ fov: 50, position: [0, 1.0, 12] }}
          className="h-full w-full"
          dpr={[1, 1.75]}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = theme === 'dark' ? 1.05 : 0.92
            setCanvasReady(true)
          }}
        >
          <hemisphereLight args={['#e8fff4', '#16100d', theme === 'dark' ? 1.15 : 0.75]} />
          <directionalLight position={[4, 5, 4]} intensity={theme === 'dark' ? 2.2 : 1.45} color="#fff6dd" />
          <directionalLight position={[-3, 2, -5]} intensity={theme === 'dark' ? 0.9 : 0.45} color="#91fff0" />
          <ExrEnvironment
            exposure={theme === 'dark' ? 1.05 : 0.92}
            onEnvironmentReady={handleEnvironmentReady}
          />
          <CameraZoom zoom={zoom} />
          <LaptopScene
            baseCanvasHeight={canvasBounds.baseHeight}
            dragRotation={dragRotation}
            lidOpen={lidOpen}
            onKeyboardPress={() => {
              suppressNextClickRef.current = true
              pointerRef.current.travel = 999
            }}
            onModelReady={handleModelReady}
            theme={theme}
          />
        </Canvas>
      </div>
    </div>
  )

  function stopDragging(event: React.PointerEvent<HTMLDivElement>) {
    pointerRef.current.dragging = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }
}

function useSceneTheme(): SceneTheme {
  const [theme, setTheme] = useState<SceneTheme>(() => {
    if (typeof document === 'undefined') return 'dark'
    return getCurrentTheme()
  })

  useEffect(() => {
    const root = document.documentElement
    const updateTheme = () => setTheme(getCurrentTheme())
    const observer = new MutationObserver(updateTheme)

    updateTheme()
    observer.observe(root, { attributeFilter: ['class', 'data-theme'], attributes: true })

    // Also listen for system preference changes
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    mq.addEventListener('change', updateTheme)

    return () => {
      observer.disconnect()
      mq.removeEventListener('change', updateTheme)
    }
  }, [])

  return theme
}

function getCurrentTheme(): SceneTheme {
  if (typeof document === 'undefined') return 'dark'
  const root = document.documentElement
  const dataTheme = root.getAttribute('data-theme')
  if (dataTheme === 'light' || dataTheme === 'dark') return dataTheme
  if (root.classList.contains('dark')) return 'dark'
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  return 'dark'
}

function getBaseCanvasBounds(): CanvasBounds {
  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  const sceneHeight = isDesktop ? 760 : 620
  const bottom = isDesktop ? 128 : 96
  const top = isDesktop ? 128 : 96
  return {
    baseHeight: sceneHeight + top + bottom,
    bottom,
    top,
  }
}

function getCanvasBounds(sceneRect: DOMRect): CanvasBounds {
  const base = getBaseCanvasBounds()
  const navBottom = document.querySelector('nav')?.getBoundingClientRect().bottom ?? 64
  return {
    baseHeight: base.baseHeight,
    bottom: base.bottom,
    top: Math.max(base.top, Math.ceil(sceneRect.top - navBottom)),
  }
}

function ExrEnvironment({
  exposure,
  onEnvironmentReady,
}: {
  exposure: number
  onEnvironmentReady: () => void
}) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)

  useEffect(() => {
    let disposed = false

    const applyEnvironment = (envMap: THREE.Texture | null) => {
      if (disposed || !envMap) return
      scene.environment = envMap
      scene.environmentRotation.y = THREE.MathUtils.degToRad(ENVIRONMENT_ROTATION_Y_DEGREES)
      if ('environmentIntensity' in scene) {
        scene.environmentIntensity = 1.22
      }
      onEnvironmentReady()
    }

    loadEnvironmentMap(gl)
      .then(applyEnvironment)
      .catch((err) => {
        console.error('Failed to generate PMREM from EXR:', err)
        onEnvironmentReady()
      })

    return () => {
      disposed = true
      // Only dispose if this is the last Canvas using it
      if (!cachedPMREM) return
    }
  }, [gl, onEnvironmentReady, scene])

  useEffect(() => {
    gl.toneMappingExposure = exposure
  }, [exposure, gl])

  return null
}

function LaptopScene({
  baseCanvasHeight,
  dragRotation,
  lidOpen,
  onKeyboardPress,
  onModelReady,
  theme,
}: LaptopSceneProps) {
  const groupRef = useRef<THREE.Group | null>(null)
  const lidRef = useRef<THREE.Object3D | null>(null)
  const lidClosedRotationXRef = useRef(0)
  const lidAnimationRef = useRef<LidAnimation>({ from: 0, startedAt: 0, to: 0 })
  const lidProgressRef = useRef(0)
  const keyPressesRef = useRef<Map<string, KeyPressState>>(new Map())
  const activePointerKeysRef = useRef<Map<number, string>>(new Map())
  const [model, setModel] = useState<THREE.Group | null>(null)
  const viewportSize = useThree((state) => state.size)

  useEffect(() => {
    lidAnimationRef.current = {
      from: lidProgressRef.current,
      startedAt: performance.now() * 0.001,
      to: lidOpen ? 1 : 0,
    }
  }, [lidOpen])

  useEffect(() => {
    let cancelled = false
    loadLaptopModel()
      .then((source) => {
        if (cancelled) return
        const normalized = normalizeLaptopModel(source)
        lidRef.current = normalized.lid
        lidClosedRotationXRef.current = normalized.lid?.rotation.x ?? 0
        setModel(normalized.root)
        onModelReady()
      })
      .catch(() => {
        // Model load failure — user will see empty scene
      })

    return () => {
      cancelled = true
    }
  }, [onModelReady])

  useEffect(() => {
    if (!model) return
    applyLaptopTheme(model, theme)
  }, [model, theme])

  useEffect(() => {
    const releaseAllKeys = () => {
      activePointerKeysRef.current.clear()
      const now = performance.now() * 0.001

      for (const press of keyPressesRef.current.values()) {
        if (press.releasedAt !== null) continue
        press.releasedAt = now
        press.releaseStartOffset = press.currentOffset
      }
    }

    window.addEventListener('blur', releaseAllKeys)
    window.addEventListener('pointerup', releaseAllKeys)
    window.addEventListener('pointercancel', releaseAllKeys)

    return () => {
      window.removeEventListener('blur', releaseAllKeys)
      window.removeEventListener('pointerup', releaseAllKeys)
      window.removeEventListener('pointercancel', releaseAllKeys)
    }
  }, [])

  useFrame(() => {
    const group = groupRef.current
    if (!group) return

    const elapsed = performance.now() * 0.001
    const idleBreath = Math.sin(elapsed * 0.92) * 0.032
    const scaleCompensation = viewportSize.height > 0 ? baseCanvasHeight / viewportSize.height : 1

    group.position.y = THREE.MathUtils.lerp(
      group.position.y,
      MODEL_VERTICAL_OFFSET + 0.09 + idleBreath,
      0.075,
    )
    group.position.z = THREE.MathUtils.lerp(group.position.z, 0.18, 0.075)
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, THREE.MathUtils.degToRad(-3 + dragRotation.x), 0.075)
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, THREE.MathUtils.degToRad(-16 + dragRotation.y), 0.075)
    group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, THREE.MathUtils.degToRad(-0.8), 0.075)
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, scaleCompensation, 0.06))

    const lid = lidRef.current
    if (lid) {
      const animation = lidAnimationRef.current
      const elapsedSinceToggle = elapsed - animation.startedAt
      const rawProgress = THREE.MathUtils.clamp(elapsedSinceToggle / LID_ANIMATION_SECONDS, 0, 1)
      const easedProgress = smootherstep(rawProgress)
      const lidProgress = THREE.MathUtils.lerp(animation.from, animation.to, easedProgress)
      const idleLidMotion = lidProgress > 0.96 ? Math.sin(elapsed * 0.92) * 0.012 : 0
      const openDelta = THREE.MathUtils.degToRad(LID_OPEN_DELTA_DEGREES * lidProgress) + idleLidMotion
      lidProgressRef.current = lidProgress
      lid.rotation.x = lidClosedRotationXRef.current + openDelta
    }

    for (const [id, press] of keyPressesRef.current) {
      if (press.releasedAt === null) {
        const progress = smootherstep(THREE.MathUtils.clamp((elapsed - press.pressedAt) / KEY_PRESS_DOWN_SECONDS, 0, 1))
        press.currentOffset = THREE.MathUtils.lerp(press.pressStartOffset, -KEY_PRESS_DEPTH, progress)
        press.object.position.y = press.originalY + press.currentOffset
        continue
      }

      const progress = smootherstep(THREE.MathUtils.clamp((elapsed - press.releasedAt) / KEY_RELEASE_SECONDS, 0, 1))
      press.currentOffset = THREE.MathUtils.lerp(press.releaseStartOffset, 0, progress)
      press.object.position.y = press.originalY + press.currentOffset

      if (progress >= 1) {
        press.object.position.y = press.originalY
        keyPressesRef.current.delete(id)
      }
    }
  })

  return (
    <group ref={groupRef}>
      {model && (
        <primitive
          object={model}
          onPointerDown={(event: ThreeEvent<PointerEvent>) => {
            const key = findKeyboardKey(event.object)
            if (!key) return

            event.stopPropagation()
            event.nativeEvent.stopPropagation()
            if (event.target instanceof Element) {
              event.target.setPointerCapture(event.pointerId)
            }
            onKeyboardPress()

            const now = performance.now() * 0.001
            const current = keyPressesRef.current.get(key.uuid)
            activePointerKeysRef.current.set(event.pointerId, key.uuid)
            keyPressesRef.current.set(key.uuid, {
              currentOffset: current?.currentOffset ?? 0,
              object: key,
              originalY: current?.originalY ?? key.position.y,
              pressedAt: now,
              pressStartOffset: current?.currentOffset ?? 0,
              releasedAt: null,
              releaseStartOffset: current?.currentOffset ?? 0,
            })
          }}
          onPointerCancel={(event: ThreeEvent<PointerEvent>) => {
            releaseKeyboardKeyForPointer(event.pointerId)
          }}
          onPointerLeave={(event: ThreeEvent<PointerEvent>) => {
            releaseKeyboardKeyForPointer(event.pointerId)
          }}
          onLostPointerCapture={(event: ThreeEvent<PointerEvent>) => {
            releaseKeyboardKeyForPointer(event.pointerId)
          }}
          onPointerUp={(event: ThreeEvent<PointerEvent>) => {
            releaseKeyboardKeyForPointer(event.pointerId)
            if (event.target instanceof Element && event.target.hasPointerCapture(event.pointerId)) {
              event.target.releasePointerCapture(event.pointerId)
            }
          }}
        />
      )}
    </group>
  )

  function releaseKeyboardKeyForPointer(pointerId: number) {
    const keyId = activePointerKeysRef.current.get(pointerId)
    if (!keyId) return

    activePointerKeysRef.current.delete(pointerId)
    releaseKeyboardKey(keyId)
  }

  function releaseKeyboardKey(keyId: string) {
    const press = keyPressesRef.current.get(keyId)
    if (!press || press.releasedAt !== null) return

    press.releasedAt = performance.now() * 0.001
    press.releaseStartOffset = press.currentOffset
  }
}

function loadLaptopModel() {
  laptopModelPromise ??= new Promise<THREE.Group>((resolve, reject) => {
    new GLTFLoader().load(LAPTOP_MODEL_URL, (gltf) => resolve(gltf.scene), undefined, reject)
  })

  return laptopModelPromise
}

function loadEnvironmentTexture() {
  environmentTexturePromise ??= new Promise<THREE.DataTexture>((resolve, reject) => {
    new EXRLoader().load(ENVIRONMENT_MAP_URL, resolve, undefined, reject)
  })

  return environmentTexturePromise
}

function loadEnvironmentMap(gl: THREE.WebGLRenderer) {
  if (cachedPMREM) return Promise.resolve(cachedPMREM)

  environmentMapPromise ??= loadEnvironmentTexture().then((texture) => {
    const pmrem = new THREE.PMREMGenerator(gl)
    pmrem.compileEquirectangularShader()
    const envMap = pmrem.fromEquirectangular(texture).texture
    pmrem.dispose()
    texture.dispose()
    cachedPMREM = envMap
    return envMap
  })

  return environmentMapPromise
}

function findKeyboardKey(object: THREE.Object3D): THREE.Object3D | null {
  let current: THREE.Object3D | null = object

  while (current) {
    if (current instanceof THREE.Mesh && current.name.includes('键') && current.name !== '键盘') {
      return current
    }
    current = current.parent
  }

  return null
}

function normalizeLaptopModel(source: THREE.Group): LaptopModel {
  const model = source.clone(true)
  const lid = findLaptopLid(model)
  const box = new THREE.Box3().setFromObject(model)
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(center)

  const maxAxis = Math.max(size.x, size.y, size.z) || 1
  const scale = 3.55 / maxAxis
  model.position.set(-center.x * scale, -center.y * scale - 0.18, -center.z * scale)
  model.scale.setScalar(scale)

  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.frustumCulled = false

    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => {
      if (!material || !(material instanceof THREE.MeshStandardMaterial)) return
      material.envMapIntensity = 1.05
      material.roughness = THREE.MathUtils.clamp(material.roughness, 0.24, 0.58)
      material.metalness = Math.min(material.metalness, 0.86)
    })
  })

  return { lid, root: model }
}

function findLaptopLid(model: THREE.Group) {
  const knownLid = model.getObjectByName('ab面') ?? model.getObjectByName('ab面.001') ?? model.getObjectByName('ab面001')
  if (knownLid) return knownLid

  const abFaceCandidates: THREE.Object3D[] = []
  model.traverse((object) => {
    if (object.name === 'ab面' || object.name.startsWith('ab面.')) {
      abFaceCandidates.push(object)
    }
  })

  return (
    abFaceCandidates.find((object) => object.children.some((child) => child.name.includes('屏幕') || child.name.toLowerCase().includes('screen'))) ??
    abFaceCandidates.find((object) => object.children.length > 0) ??
    abFaceCandidates[0] ??
    null
  )
}

function applyLaptopTheme(model: THREE.Group, theme: SceneTheme) {
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]

    materials.forEach((material) => {
      if (!(material instanceof THREE.MeshStandardMaterial)) return
      applyMaterialTheme(material, theme)
    })
  })
}

function applyMaterialTheme(material: THREE.MeshStandardMaterial, theme: SceneTheme) {
  const isDark = theme === 'dark'
  const name = material.name.toLowerCase()

  if (shouldPreserveLaptopMaterial(material)) {
    return
  }

  if (!isDark && name === 'laptopsurface.002') {
    return
  }

  if (name.includes('screen')) {
    material.emissive = new THREE.Color(isDark ? '#dfffe8' : '#fff7df')
    material.emissiveIntensity = isDark ? 1.75 : 0.78
    material.roughness = isDark ? 0.34 : 0.48
    material.metalness = 0
  } else if (name.includes('laptopsurface') || name.includes('painted') || name.includes('logo')) {
    material.color = new THREE.Color(isDark ? '#26302d' : '#d7ded2')
    material.metalness = isDark ? 0.64 : 0.42
    material.roughness = isDark ? 0.34 : 0.46
    material.envMapIntensity = isDark ? 1.35 : 0.72
  } else if (name.includes('surfacemetal')) {
    material.color = new THREE.Color(isDark ? '#222b2b' : '#c9d4cc')
    material.metalness = isDark ? 0.72 : 0.52
    material.roughness = isDark ? 0.28 : 0.42
    material.envMapIntensity = isDark ? 1.45 : 0.76
  } else if (name.includes('interiorblack')) {
    material.color = new THREE.Color(isDark ? '#18201f' : '#323c38')
    material.metalness = isDark ? 0.42 : 0.34
    material.roughness = isDark ? 0.46 : 0.58
    material.envMapIntensity = isDark ? 1.12 : 0.62
  } else if (name.includes('keyboard')) {
    material.color = new THREE.Color(isDark ? '#ffffff' : '#f7f3e7')
    material.emissive = new THREE.Color(isDark ? '#dfffe8' : '#fff3d2')
    material.emissiveIntensity = isDark ? 0.42 : 0.16
    material.metalness = 0
    material.roughness = isDark ? 0.3 : 0.4
  } else if (name.includes('indicatorlights')) {
    material.emissive = new THREE.Color(isDark ? '#9cffc2' : '#35a464')
    material.emissiveIntensity = isDark ? 1.25 : 0.55
  } else {
    // Catch-all for unlisted materials (touchpad, edges, etc.)
    if (material.color && !material.map) {
      const hsl: Record<string, number> = {}
      material.color.getHSL(hsl as { h: number; s: number; l: number })
      if (hsl.l < 0.3) {
        material.color = new THREE.Color(isDark ? material.color.getHex() : 0xa8a8a8)
      } else {
        material.color = new THREE.Color(isDark ? '#333333' : '#e8e4dc')
      }
    }
    material.roughness = isDark ? Math.min(material.roughness, 0.5) : Math.max(material.roughness, 0.3)
  }

  material.needsUpdate = true
}

function shouldPreserveLaptopMaterial(material: THREE.MeshStandardMaterial) {
  const name = material.name.toLowerCase()
  return (
    name.includes('laser') ||
    name.includes('iridescent') ||
    name.includes('镭射') ||
    name.includes('logo') ||
    Boolean(material.map && !name.includes('keyboard') && !name.includes('screen'))
  )
}

function CameraZoom({ zoom }: { zoom: number }) {
  const { camera } = useThree()
  const targetZ = 12 + zoom * 2.5

  useFrame(() => {
    camera.position.z += (targetZ - camera.position.z) * 0.12
  })

  return null
}

function smootherstep(value: number) {
  return value * value * value * (value * (value * 6 - 15) + 10)
}
