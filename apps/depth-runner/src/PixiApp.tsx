import { createSignal, onMount } from 'solid-js'
import {Application, Assets, Sprite, DisplacementFilter} from 'pixi.js'
import './App.css'

function App() {
  const [pixiContainer, setPixiContainer] = createSignal<HTMLDivElement | undefined>(undefined)
  const [originalSize, setOriginalSize] = createSignal<{width: number, height: number} | undefined>(undefined)
  const [currentScale, setCurrentScale] = createSignal({ x: 0, y: 0 })

  onMount(async () => {
    // 이미지와 depth map을 Assets로 미리 로드
    const [imgTexture, depthTexture] = await Promise.all([
      Assets.load('/image8.jpg'),
      Assets.load('/image8-depth.png'),
    ])
    
    // 원본 이미지 크기 확인
    const originalWidth = imgTexture.width
    const originalHeight = imgTexture.height

    const app = new Application()
    await app.init({
      width: originalWidth,
      height: originalHeight,
      antialias: true,
      backgroundColor: 0x1099bb,
    })
    pixiContainer()?.appendChild(app.canvas)

    const img = new Sprite(imgTexture)
    img.width = originalWidth
    img.height = originalHeight
    app.stage.addChild(img)

    // Depth map을 원본 크기로 유지하여 정확도 보장
    const depthMap = new Sprite(depthTexture)
    depthMap.width = originalWidth
    depthMap.height = originalHeight
    depthMap.x = 0
    depthMap.y = 0
    // 경계에서 깨짐 방지를 위해 clamp-to-edge 사용
    depthMap.texture.source.style.addressMode = 'clamp-to-edge'
    depthMap.visible = false
    app.stage.addChild(depthMap)

    // 내장 DisplacementFilter 사용하되 더 보수적인 scale
    const displacementFilter = new DisplacementFilter({
      sprite: depthMap,
      scale: { x: 0, y: 0 }
    })
    
    app.stage.filters = [displacementFilter]
    setOriginalSize({ width: originalWidth, height: originalHeight })
    
    // 부드러운 애니메이션을 위한 ticker 추가
    app.ticker.add(() => {
      const filter = displacementFilter
      const current = currentScale()
      
      // 부드럽게 목표값으로 이동 (lerp)
      filter.scale.x += (current.x - filter.scale.x) * 0.15
      filter.scale.y += (current.y - filter.scale.y) * 0.15
    })
  })

  const handleMouseMove = (e: MouseEvent) => {
    const size = originalSize()
    if (!size) {
      return
    }
    
    // 더 보수적인 scale 제한으로 경계 깨짐 방지
    const maxScale = 30 // 적당한 범위로 제한
    const rawScaleX = (size.width / 2 - e.offsetX) / 20 // 덜 민감하게 조정
    const rawScaleY = (size.height / 2 - e.offsetY) / 20
    
    // 경계 근처에서 scale 감소 (거리 기반 falloff)
    const centerX = size.width / 2
    const centerY = size.height / 2
    const distanceFromCenter = Math.sqrt(
      Math.pow(e.offsetX - centerX, 2) + Math.pow(e.offsetY - centerY, 2)
    )
    const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2))
    const falloffFactor = Math.max(0.3, 1 - (distanceFromCenter / maxDistance) * 0.7)
    
    const scaleX = Math.max(-maxScale, Math.min(maxScale, rawScaleX * falloffFactor))
    const scaleY = Math.max(-maxScale, Math.min(maxScale, rawScaleY * falloffFactor))
    
    setCurrentScale({ x: scaleX, y: scaleY })
  }


  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center' }}>
      <div ref={setPixiContainer} onMouseMove={handleMouseMove} />
    </div>
  )
}

export default App
