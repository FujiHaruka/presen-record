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
        'RecordButton-button-disabled': !ready || recordingDone,
      })}
      onClick={onClick}
    />
  </div>
)

export default pure(RecordButton)
