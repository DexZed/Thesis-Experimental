import './style.css'
import { setupCounter } from './counter.js'

document.querySelector('#app').innerHTML = `
  <div>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">

      Put everything in src folder 
    </p>
    <p> See the figma file or unzip the draft file for designs</p>
  </div>
`

setupCounter(document.querySelector('#counter'))
