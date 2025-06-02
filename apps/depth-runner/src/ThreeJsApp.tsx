import { createSignal, onMount } from 'solid-js'
import * as THREE from 'three'

function ThreeJsApp() {
  const [container, setContainer] = createSignal<HTMLDivElement | undefined>(undefined)
  
  onMount(async () => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    
    const containerEl = container()
    if (!containerEl) return
    
    // Load textures
    const textureLoader = new THREE.TextureLoader()
    const imageTexture = await textureLoader.loadAsync('/image4.jpg')
    const depthTexture = await textureLoader.loadAsync('/image4-depth.png')
    const originalWidth = imageTexture.image.width
    const originalHeight = imageTexture.image.height
    renderer.setSize(originalWidth, originalHeight)
    containerEl.appendChild(renderer.domElement)
    
    // Create geometry with more vertices for better displacement
    const geometry = new THREE.PlaneGeometry(2.25, 3.95, 128, 96)
    
    // Custom vertex shader for depth displacement
    const vertexShader = `
      uniform sampler2D uDepthMap;
      uniform float uDisplacementScale;
      uniform vec2 uMouse;
      
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        vUv = uv;
        vNormal = normal;
        
        // Sample depth map
        vec4 depthColor = texture2D(uDepthMap, uv);
        float depth = depthColor.r; // Use red channel for depth
        
        // Calculate displacement based on mouse position
        vec2 mouseOffset = (uMouse - 0.5) * 2.0; // Normalize to -1 to 1
        float displacement = depth * uDisplacementScale * 0.5;
        
        // Apply perspective-like displacement
        vec3 pos = position;
        pos.z += displacement;
        pos.x += depth * mouseOffset.x * 0.1;
        pos.y += depth * mouseOffset.y * 0.1;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `
    
    // Fragment shader for lighting
    const fragmentShader = `
      uniform sampler2D uTexture;
      uniform vec3 uLightPosition;
      
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        vec4 textureColor = texture2D(uTexture, vUv);
        
        // Simple lighting calculation
        vec3 lightDir = normalize(uLightPosition);
        float lighting = max(dot(vNormal, lightDir), 0.3);
        
        gl_FragColor = vec4(textureColor.rgb * lighting, textureColor.a);
      }
    `
    
    // Create material with custom shaders
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: imageTexture },
        uDepthMap: { value: depthTexture },
        uDisplacementScale: { value: 0.3 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uLightPosition: { value: new THREE.Vector3(0, 0, 1) }
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    
    camera.position.z = 3
    
    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      const mouseX = (event.clientX - rect.left) / rect.width
      const mouseY = 1 - (event.clientY - rect.top) / rect.height
      
      material.uniforms.uMouse.value.set(mouseX, mouseY)
      
      // Smooth camera movement
      const targetX = (mouseX - 0.5) * 0.5
      const targetY = (mouseY - 0.5) * 0.5
      
      camera.position.x += (targetX - camera.position.x) * 0.05
      camera.position.y += (targetY - camera.position.y) * 0.05
      camera.lookAt(0, 0, 0)
    }
    
    renderer.domElement.addEventListener('mousemove', handleMouseMove)
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()
  })
  
  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', 'align-items': 'center', padding: '2rem 0' }}>
      <div ref={setContainer} style={{ border: '1px solid #ccc', 'border-radius': '8px', overflow: 'hidden' }} />
    </div>
  )
}

export default ThreeJsApp 