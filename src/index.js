import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import queryString from 'query-string'

const {resolve} = require('path')
const {projectDir} = queryString.parse(window.location.search)

console.log(`Project directory is ${resolve(projectDir)}`)

window.globals = {
  projectDir: resolve(projectDir)
}

// globals がセットされてから import したいので
const App = require('./App').default
ReactDOM.render(<App />, document.getElementById('root'))
