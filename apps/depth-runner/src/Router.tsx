import { Router, Route } from '@solidjs/router'
import { type Component, lazy } from 'solid-js'
import Navigation from './Navigation'

const PixiDepth = lazy(() => import('./PixiApp'))
const ThreeDepth = lazy(() => import('./ThreeJsApp'))

const AppRouter: Component = () => {
  return (
    <Router>
        <Route path="/" component={PixiDepth} />
        <Route path="/three" component={ThreeDepth} />
    </Router>
  )
}

export default AppRouter 