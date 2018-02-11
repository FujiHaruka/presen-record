import React, { Component } from 'react'
import './App.css'
import {withStateHandlers} from 'recompose'
import {
  Media,
  RecordButton,
  ResetButton,
} from './components'
import {
  readdir,
  join,
  extname,
} from './helpers/nodejs'
import updaterOf from './helpers/updaterOf'
import db from './db'
import {ProgressEvent} from './Consts'
import AudioRecorder from './helpers/AudioRecorder'

class App extends Component {
  render () {
    const {
      ready,
      recording,
      recordingDone,
      mouseTracking,
      setMouseTracking,
      unsetMouseTracking,
      recordingSeconds,
      countupAssetIndex,
      countdownAssetIndex,
      assets,
      assetIndex,
      playing,
      togglePlaying,
    } = this.props
    const {
      onClickRecordingButton,
    } = this
    return (
      <div className='App'>
        <Media
          {...{
            playing,
            togglePlaying,
            assetIndex,
            assets,
            recording,
            mouseTracking,
            setMouseTracking,
            unsetMouseTracking,
            countupAssetIndex,
            countdownAssetIndex,
            recordingSeconds,
            recordingDone,
          }}
        />
        <div className='App-menu-wrap'>
          <div className='App-menu'>
            <RecordButton
              onClick={onClickRecordingButton}
              {...{
                ready,
                recording,
                recordingDone,
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  async componentDidMount () {
    const {assetDir} = window.globals
    const files = await readdir(assetDir)
    const videoPaths = files
      .filter((file) => ['.mp4', '.mov'].includes(extname(file)))
      .map((file) => join(assetDir, file))
    this.props.setAssets(videoPaths)

    // データベースにデータがあれば録音完了とみなす
    for (const Resource of Object.values(db)) {
      const data = await Resource.load()
      if (data.length > 1) {
        this.props.toggleRecordingDone()
        break
      }
    }

    this.recorder = new AudioRecorder()
    await this.recorder.ready()
    this.props.readyOk()
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

  onClickRecordingButton = async () => {
    const {
      ready,
      recording,
      recordingDone,
      toggleRecording,
      toggleRecordingDone,
      resetAssetIndex,
    } = this.props
    if (!ready) {
      return
    }
    if (recordingDone) {
      this.cleanUpRecordingResult()
      return
    }
    toggleRecording()
    if (recording) {
      // Stop recording
      toggleRecordingDone()
      this.recorder.stopAndSaveRecording()
      db.Progress.append({
        event: ProgressEvent.END,
        at: Date.now()
      })
    } else {
      // Start recording
      this.recorder.startRecording()
      resetAssetIndex()
      db.Progress.append({
        event: ProgressEvent.START,
        at: Date.now()
      })
    }
  }

  cleanUpRecordingResult = async () => {
    const ok = window.confirm('データを消去してよろしいですか？')
    if (!ok) {
      return
    }
    console.log('Reset')
    const {
      recordingDone,
      toggleRecordingDone,
      resetAssetIndex,
      resetRecordingSeconds,
    } = this.props
    if (recordingDone) {
      toggleRecordingDone()
    }
    resetAssetIndex()
    resetRecordingSeconds()
    await this.recorder.delete()
    for (const Resource of Object.values(db)) {
      await Resource.drop()
    }
  }
}

export default withStateHandlers(
  () => ({
    ready: false,
    recording: false,
    recordingDone: false,
    recordingSeconds: 0,
    mouseTracking: false,
    assets: [],
    assetIndex: 0,
    playing: false,
  }),
  {
    readyOk: () => () => ({ready: true}),
    toggleRecording: ({recording}) => () => ({recording: !recording}),
    toggleRecordingDone: ({recordingDone}) => () => ({recordingDone: !recordingDone}),
    setMouseTracking: () => () => ({mouseTracking: true}),
    unsetMouseTracking: () => () => ({mouseTracking: false}),
    countupRecordingSeconds: ({recordingSeconds}) => () => ({recordingSeconds: recordingSeconds + 1}),
    resetRecordingSeconds: () => () => ({recordingSeconds: 0}),
    setAssets: updaterOf('assets'),
    countupAssetIndex: ({assetIndex}) => () => ({assetIndex: assetIndex + 1}),
    countdownAssetIndex: ({assetIndex}) => () => ({assetIndex: assetIndex > 0 ? assetIndex - 1 : 0}),
    resetAssetIndex: () => () => ({assetIndex: 0}),
    togglePlaying: updaterOf('playing'),
  }
)(App)
