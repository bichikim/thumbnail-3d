import { createSignal, onMount } from 'solid-js'
import {Application, Assets, DisplacementFilter, Sprite} from 'pixi.js'
import './App.css'

function App() {
  const [pixiContainer, setPixiContainer] = createSignal<HTMLDivElement | undefined>(undefined)
  const [originalSize, setOriginalSize] = createSignal<{width: number, height: number} | undefined>(undefined)
  const [currentScale, setCurrentScale] = createSignal({ x: 0, y: 0 })

  onMount(async () => {
    try {
      console.log('Loading images...')
      // 이미지와 depth map을 Assets로 미리 로드
      const [imgTexture, depthTexture] = await Promise.all([
        Assets.load('/image8.jpg'),
        Assets.load('/image8-depth.png'),
      ])
      
      console.log('Images loaded:', imgTexture, depthTexture)
      
      // 원본 이미지 크기 확인
      const originalWidth = imgTexture.width
      const originalHeight = imgTexture.height
      
      console.log('Image dimensions:', originalWidth, originalHeight)

      const app = new Application()
      await app.init({
        width: originalWidth,
        height: originalHeight,
        antialias: true,
        backgroundColor: 0x1099bb,
      })
      pixiContainer()?.append(app.canvas)

      const img = new Sprite(imgTexture)
      img.width = originalWidth
      img.height = originalHeight
      app.stage.addChild(img)
      
      console.log('Main image sprite added')

      const depthMap = new Sprite(depthTexture)
      depthMap.texture.source.style.addressMode = 'repeat'
      // depth map은 화면에 보이지 않도록 처리
      depthMap.visible = false
      app.stage.addChild(depthMap)
      
      console.log('Depth map sprite added')

      // 내장 DisplacementFilter 사용하되 scale 제한으로 갈라짐 방지
      const displacementFilter = new DisplacementFilter({
        sprite: depthMap,
        scale: 20,
      })
      
      app.stage.filters = [displacementFilter]
      setOriginalSize({ width: originalWidth, height: originalHeight })
      
      // 부드러운 애니메이션을 위한 ticker 추가
      app.ticker.add(() => {
        const filter = displacementFilter
        const current = currentScale()
        
        // 부드럽게 목표값으로 이동 (lerp)
        filter.scale.x += (current.x - filter.scale.x) * 0.1
        filter.scale.y += (current.y - filter.scale.y) * 0.1
      })
      
      console.log('Smooth displacement filter applied successfully')
    } catch (error) {
      console.error('Error initializing app:', error)
    }
  })

  const handleMouseMove = (e: MouseEvent) => {
    const size = originalSize()
    if (!size) {
      return
    }
    
    // scale 값을 제한해서 갈라짐 방지 + 부드러운 보간
    const maxScale = 15 // 갈라짐 방지를 위한 최대값 제한
    const rawScaleX = (size.width / 2 - e.offsetX) / 20
    const rawScaleY = (size.height / 2 - e.offsetY) / 20
    
    // 값을 제한하고 부드럽게 만들기
    const scaleX = Math.max(-maxScale, Math.min(maxScale, rawScaleX))
    const scaleY = Math.max(-maxScale, Math.min(maxScale, rawScaleY))
    
    setCurrentScale({ x: scaleX, y: scaleY })
  }


  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center' }}>
      <div ref={setPixiContainer} onMouseMove={handleMouseMove} />
    </div>
  )
}

export default App
