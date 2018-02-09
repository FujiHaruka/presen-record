import React, { Component } from 'react'
import './App.css'
import {withStateHandlers} from 'recompose'
import {
  Header,
  Media,
  RecordButton,
  Time,
} from './components'
import {
  readdir,
  join,
} from './helpers/nodejs'
import updaterOf from './helpers/updaterOf'

class App extends Component {
  render () {
    const {
      recording,
      toggleRecording,
      mouseTracking,
      setMouseTracking,
      unsetMouseTracking,
      recordingSeconds,
      resetRecordingSeconds,
      assets,
      assetIndex,
    } = this.props
    return (
      <div className='App'>
        <Header />
        <Media
          {...{
            assetIndex,
            assets,
            recording,
            mouseTracking,
            setMouseTracking,
            unsetMouseTracking,
          }}
        />
        <div className='App-menu'>
          <Time
            totalSeconds={recordingSeconds}
          />
          <RecordButton
            recording={recording}
            onToggleRecording={toggleRecording}
          />
        </div>
      </div>
    )
  }

  async componentDidMount () {
    const {assetDir} = window.globals
    const files = await readdir(assetDir)
    const filePaths = files.map((file) => join(assetDir, file))
    this.props.setAssets(filePaths)
  }

  componentDidUpdate (prev) {
    if (this.props.recording !== prev.recording) {
      const {
        recording,
        countupRecordingSeconds,
      } = this.props
      if (recording) {
        this.timeTimer = setInterval(countupRecordingSeconds, 1000)
      } else {
        clearInterval(this.timeTimer)
      }
    }
  }
}

export default withStateHandlers(
  () => ({
    recording: false,
    recordingSeconds: 0,
    mouseTracking: false,
    assets: [],
    assetIndex: 0,
  }),
  {
    toggleRecording: ({recording}) => () => ({recording: !recording}),
    setMouseTracking: () => () => ({mouseTracking: true}),
    unsetMouseTracking: () => () => ({mouseTracking: false}),
    countupRecordingSeconds: ({recordingSeconds}) => () => ({recordingSeconds: recordingSeconds + 1}),
    resetRecordingSeconds: () => () => ({recordingSeconds: 0}),
    setAssets: updaterOf('assets'),
    countupAssetIndex: ({assetIndex}) => () => ({assetIndex: assetIndex + 1}),
    countdownAssetIndex: ({assetIndex}) => () => ({assetIndex: assetIndex - 1}),
  }
)(App)
