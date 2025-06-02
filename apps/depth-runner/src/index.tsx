/* @refresh reload */
import { render } from 'solid-js/web'
import Router from './Router'
import './index.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error(
    'Root element not found',
  )
}

render(() => <Router />, root)
