import './RecordButton.css'
import React from 'react'
import {pure} from 'recompose'
import c from 'classnames'
import db from '../db'
import {ProgressEvent} from '../Consts'

const RecordButton = ({
  recording = false,
  recordingDone,
  toggleRecording,
  toggleRecordingDone,
}) => (
  <div className='RecordButton'>
    <span
      className={c('RecordButton-button', {
        'RecordButton-button-on': !recordingDone && recording,
        'RecordButton-button-off': !recordingDone && !recording,
        'RecordButton-button-disabled': recordingDone,
      })}
      onClick={() => {
        if (recordingDone) {
          return
        }
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
      }}
    />
  </div>
)

export default pure(RecordButton)
