import React, { Component } from 'react'
import './App.css'
import {withStateHandlers} from 'recompose'
import {
  Header,
  Media,
  RecordButton,
  Time,
} from './components'

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
    } = this.props
    return (
      <div className='App'>
        <Header />
        <Media
          {...{
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
  }),
  {
    toggleRecording: ({recording}) => () => ({recording: !recording}),
    setMouseTracking: () => () => ({mouseTracking: true}),
    unsetMouseTracking: () => () => ({mouseTracking: false}),
    countupRecordingSeconds: ({recordingSeconds}) => () => ({recordingSeconds: recordingSeconds + 1}),
    resetRecordingSeconds: () => () => ({recordingSeconds: 0}),
  }
)(App)
