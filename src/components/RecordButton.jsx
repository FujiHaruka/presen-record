import './RecordButton.css'
import React from 'react'
import {pure} from 'recompose'
import c from 'classnames'

const RecordButton = ({
  onClick,
  recording = false,
  recordingDone,
  ready,
}) => (
  <div className='RecordButton'>
    <span
      className={c('RecordButton-button', {
        'RecordButton-button-on': ready && !recordingDone && recording,
        'RecordButton-button-off': ready && !recordingDone && !recording,
        'RecordButton-button-done': !ready || recordingDone,
      })}
      onClick={onClick}
    >{recordingDone && <code>RESET</code>}</span>
  </div>
)

export default pure(RecordButton)
