import { createSignal, onMount } from 'solid-js'
import './CssDepthEffect.css'

function CssDepthEffect() {
  const [container, setContainer] = createSignal<HTMLDivElement | undefined>(undefined)
  const [mousePos, setMousePos] = createSignal({ x: 0, y: 0 })

  onMount(() => {
    const containerEl = container()
    if (!containerEl) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerEl.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      
      setMousePos({ x, y })
      
      // Apply 3D transforms to layers
      const layers = containerEl.querySelectorAll('.depth-layer')
      layers.forEach((layer, index) => {
        const depth = (index + 1) * 0.1
        const offsetX = (x - 0.5) * depth * 50
        const offsetY = (y - 0.5) * depth * 50
        const rotateX = (y - 0.5) * depth * 20
        const rotateY = (x - 0.5) * depth * 20
        
        ;(layer as HTMLElement).style.transform = `
          translate3d(${offsetX}px, ${offsetY}px, ${depth * 10}px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
        `
      })
    }

    const handleMouseLeave = () => {
      const layers = containerEl.querySelectorAll('.depth-layer')
      layers.forEach((layer) => {
        ;(layer as HTMLElement).style.transform = 'translate3d(0, 0, 0) rotateX(0) rotateY(0)'
      })
    }

    containerEl.addEventListener('mousemove', handleMouseMove)
    containerEl.addEventListener('mouseleave', handleMouseLeave)
  })

  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', padding: '2rem 0' }}>
      <h2 style={{ margin: '0 0 2rem 0', color: '#333' }}>CSS 3D Transforms</h2>
      <div 
        ref={setContainer}
        class="depth-container"
      >
        <img src="/image.jpg" alt="Main image" class="depth-layer main-image" />
        <div class="depth-layer depth-overlay-1"></div>
        <div class="depth-layer depth-overlay-2"></div>
        <div class="depth-layer depth-overlay-3"></div>
      </div>
      <p style={{ 'margin-top': '1rem', 'text-align': 'center', 'max-width': '500px', color: '#666' }}>
        순수 CSS 3D transforms만으로 구현한 가벼운 depth effect입니다.
      </p>
    </div>
  )
}

export default CssDepthEffect 