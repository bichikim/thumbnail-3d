import { A } from '@solidjs/router'
import './Navigation.css'

function Navigation() {
  return (
    <nav class="navigation">
      <div class="nav-container">
        <h1 class="nav-title">3D Depth Effects</h1>
        <div class="nav-links">
          <A href="/pixi" class="nav-link" activeClass="active">
            PixiJS
          </A>
          <A href="/three" class="nav-link" activeClass="active">
            Three.js
          </A>
          <A href="/css" class="nav-link" activeClass="active">
            CSS 3D
          </A>
        </div>
      </div>
    </nav>
  )
}

export default Navigation 