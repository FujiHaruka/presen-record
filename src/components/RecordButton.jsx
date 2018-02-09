import './RecordButton.css'
import React from 'react'
import {pure} from 'recompose'
import c from 'classnames'

const RecordButton = ({
  recording = false,
  onToggleRecording
}) => (
  <div className='RecordButton'>
    <span
      className={c('RecordButton-button', {
        'RecordButton-button-on': recording,
        'RecordButton-button-off': !recording,
      })}
      onClick={onToggleRecording}
    />
  </div>
)

export default pure(RecordButton)
