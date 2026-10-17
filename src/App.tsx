import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { Atlas } from './components/Atlas'
import { Brief } from './components/Brief'
import { Chapter } from './components/Chapter'
import { ChapterRail } from './components/ChapterRail'
import { Cursor } from './components/Cursor'
import { Discover } from './components/Discover'
import { Explorer } from './components/Explorer'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Journey } from './components/Journey'
import { Loader } from './components/Loader'
import { Nav } from './components/Nav'
import { Toast } from './components/Toast'
import { destinationBySlug, destinations } from './data/destinations'
import { useWorldDirector } from './hooks/useWorldDirector'
import { hasWebGL, prefersReducedMotion } from './lib/device'
import { initScroll, lockScroll } from './lib/scroll'
import { setState, useApp } from './lib/store'
import { photoUrl, preloadPhoto } from './lib/unsplash'
import { world } from './lib/world'

const WorldCanvas = lazy(() => import('./three/WorldCanvas'))

/** If WebGL fails at runtime, keep the page alive with a still frame. */
class WorldBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? <StillWorld /> : this.props.children
  }
}

function StillWorld() {
  return (
    <div className="world-fallback">
      <img
        src={photoUrl(destinations[0].image, 1800)}
        alt=""
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
    </div>
  )
}

export default function App() {
  const [webgl] = useState(hasWebGL)
  const [fontsReady, setFontsReady] = useState(false)
  const [sceneReady, setSceneReady] = useState(!webgl)
  const [imagesReady, setImagesReady] = useState(false)
  const [loaderGone, setLoaderGone] = useState(false)
  const entered = useApp((s) => s.entered)
  const activeChapter = useWorldDirector(true)

  // Critical assets: type, the first rendered frames, and the first chapter's photographs.
  useEffect(() => {
    const fonts = Promise.all([
      document.fonts.load('400 1em "Instrument Serif"'),
      document.fonts.load('600 1em "Manrope Variable"'),
    ]).catch(() => undefined)
    fonts.then(() => setFontsReady(true))
    Promise.all([preloadPhoto(destinations[0].image, 1200), preloadPhoto(destinations[1].image, 1200)]).then(() =>
      setImagesReady(true),
    )
    // Never hold the visitor hostage: proceed after a ceiling even if something stalls.
    const ceiling = setTimeout(() => {
      setFontsReady(true)
      setSceneReady(true)
      setImagesReady(true)
    }, 12000)
    return () => clearTimeout(ceiling)
  }, [])

  useEffect(() => {
    const stop = initScroll()
    lockScroll(true)
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    const onPointer = (e: PointerEvent) => {
      world.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      world.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => {
      stop()
      window.removeEventListener('pointermove', onPointer)
    }
  }, [])

  const progress = (fontsReady ? 0.25 : 0) + (sceneReady ? 0.45 : 0) + (imagesReady ? 0.3 : 0)
  const ready = fontsReady && sceneReady && imagesReady

  const onLoaderDone = useCallback(() => {
    setLoaderGone(true)
    setState({ entered: true })
    lockScroll(false)
    if (prefersReducedMotion()) {
      world.intro = 1
    } else {
      gsap.to(world, { intro: 1, duration: 5.6, ease: 'none' })
    }
    // Deep link to a journey brief, e.g. #journey/petra
    const m = window.location.hash.match(/^#journey\/([\w-]+)/)
    if (m && destinationBySlug[m[1]]) setState({ active: m[1], brief: m[1] })
  }, [])

  const onSceneReady = useCallback(() => setSceneReady(true), [])

  return (
    <>
      <a className="skip-link" href="#discover">
        Skip to content
      </a>
      <div className="world-layer">
        {webgl ? (
          <WorldBoundary onError={onSceneReady}>
            <Suspense fallback={null}>
              <WorldCanvas onReady={onSceneReady} />
            </Suspense>
          </WorldBoundary>
        ) : (
          <StillWorld />
        )}
      </div>
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <Nav activeChapter={activeChapter} />
      <ChapterRail active={activeChapter} />

      <main aria-hidden={!entered ? true : undefined}>
        <Hero />
        <Discover />
        <Chapter
          id="mountains"
          index="01"
          label="Mountains"
          title={['Stone that', <>remembers <em>ice.</em></>]}
          intro="Up here the air is thin and the silence has texture. Two ranges, half a world apart, both still being carved by weather."
          slugs={['patagonia', 'dolomites']}
        />
        <Chapter
          id="ocean"
          index="02"
          label="Ocean"
          align="right"
          title={['Blue, in every', <><em>depth</em> of it.</>]}
          intro="The world is mostly water, and some of it is so clear you forget it is there. Drift down to the reef line."
          slugs={['maldives']}
          flipFirst
        />
        <Chapter
          id="hidden"
          index="03"
          label="Hidden places"
          title={['Where the road', <>simply <em>stops.</em></>]}
          intro="Fiords that swallow the light, steppe that runs to the edge of hearing. Places you reach slowly, and leave even more slowly."
          slugs={['fiordland', 'altai']}
        />
        <Chapter
          id="ancient"
          index="04"
          label="Ancient worlds"
          align="right"
          title={['Older than', <>every <em>name.</em></>]}
          intro="A city cut from rose coloured cliffs, a forest of trees that died nine hundred years ago and forgot to fall. Time moves differently in the dry."
          slugs={['petra', 'namib']}
          flipFirst
        />
        <Chapter
          id="night"
          index="05"
          label="Night and stars"
          title={['The sky,', <><em>unedited.</em></>]}
          intro="Turn the lights off. Wait. The cold sharpens, the stars thicken, and then, without warning, the sky begins to move."
          slugs={['iceland']}
        />
        <Atlas />
        <Explorer />
        <Journey />
      </main>
      <Footer />

      <Brief />
      <Toast />
      <Cursor />
      {!loaderGone && <Loader progress={progress} ready={ready} onDone={onLoaderDone} />}
    </>
  )
}
