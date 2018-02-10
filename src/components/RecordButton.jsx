import './RecordButton.css'
import React from 'react'
import {pure} from 'recompose'
import c from 'classnames'

const RecordButton = ({
  onClick,
  recording = false,
  recordingDone,
}) => (
  <div className='RecordButton'>
    <span
      className={c('RecordButton-button', {
        'RecordButton-button-on': !recordingDone && recording,
        'RecordButton-button-off': !recordingDone && !recording,
        'RecordButton-button-disabled': recordingDone,
      })}
      onClick={onClick}
    />
  </div>
)

export default pure(RecordButton)
