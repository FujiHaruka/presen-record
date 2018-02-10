import React, { Component } from 'react'
import './App.css'
import {withStateHandlers} from 'recompose'
import {
  Header,
  Media,
  RecordButton,
  ResetButton,
  Time,
} from './components'
import {
  readdir,
  join,
} from './helpers/nodejs'
import updaterOf from './helpers/updaterOf'
import db from './db'
import {ProgressEvent} from './Consts'

class App extends Component {
  render () {
    const {
      recording,
      toggleRecording,
      recordingDone,
      toggleRecordingDone,
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
      resetRecording,
      onClickRecordingButton,
    } = this
    return (
      <div className='App'>
        <Header />
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
          }}
        />
        <div className='App-menu-wrap'>
          <div className='App-menu'>
            <Time
              totalSeconds={recordingSeconds}
            />
            <RecordButton
              onClick={onClickRecordingButton}
              {...{
                recording,
                recordingDone,
              }}
            />
            {
              recordingDone &&
              <div className='App-ResetButton'>
                <ResetButton
                  {...{
                    resetRecording
                  }}
                />
              </div>
            }
          </div>
        </div>
      </div>
    )
  }

  async componentDidMount () {
    const {assetDir} = window.globals
    const files = await readdir(assetDir)
    const filePaths = files.map((file) => join(assetDir, file))
    this.props.setAssets(filePaths)

    // データベースにデータがあれば録音完了とみなす
    for (const Resource of Object.values(db)) {
      const data = await Resource.load()
      if (data.length > 1) {
        this.props.toggleRecordingDone()
        break
      }
    }
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
      recording,
      recordingDone,
      toggleRecording,
      toggleRecordingDone,
      resetAssetIndex,
    } = this.props
    if (recordingDone) {
      return
    }
    resetAssetIndex()
    toggleRecording()
    if (recording) {
      toggleRecordingDone()
      db.Progress.append({
        event: ProgressEvent.END,
        at: Date.now()
      })
    } else {
      db.Progress.append({
        event: ProgressEvent.START,
        at: Date.now()
      })
    }
  }

  resetRecording = async () => {
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
    for (const Resource of Object.values(db)) {
      await Resource.drop()
    }
  }
}

export default withStateHandlers(
  () => ({
    recording: false,
    recordingDone: false,
    recordingSeconds: 0,
    mouseTracking: false,
    assets: [],
    assetIndex: 0,
    playing: false,
  }),
  {
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
