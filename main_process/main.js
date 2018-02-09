#!/usr/bin/env electron
const electron = require('electron')
const parseArgs = require('electron-args')
const { app, BrowserWindow, protocol } = electron
const path = require('path')
const {resolve} = require('path')
const serve = require('serve')
const {
  ASSETS_SERVER_PORT,
  DEV_SERVER_PORT,
} = require('../src/conf')

const usage = `
Usage
$ presen-record [project-dir]

project-dir - Project directory
`

const cli = parseArgs(usage, {
  alias: {
    h: 'help',
    v: 'version'
  }
})

let [projectDir] = cli.input
if (!projectDir) {
  console.log(usage)
  process.exit()
}
projectDir = resolve(projectDir)

// Serve project assets
serve(projectDir, {
  port: ASSETS_SERVER_PORT,
  ignore: ['node_modules']
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize
  win = new BrowserWindow({
    width: width,
    height: height,
    frame: true
  })

  // and load the index.html of the app.
  const query = `projectDir=${projectDir}`
  const url = process.env.NODE_ENV === 'development' ? `http://localhost:${DEV_SERVER_PORT}?${query}` : `file:///index.html?${query}`
  win.loadURL(url)

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools({ mode: 'detach' })
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  protocol.interceptFileProtocol('file', (req, callback) => {
    let requestedUrl = req.url.substr(7) // 'file://'
    requestedUrl = requestedUrl.split('?')[0]

    if (path.isAbsolute(requestedUrl)) {
      const normalized = path.normalize(path.join(__dirname, '../build', requestedUrl))
      callback(normalized)
    } else {
      callback(requestedUrl)
    }
  })
})

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  serve.stop()
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})
