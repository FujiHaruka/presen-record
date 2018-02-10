import './ResetButton.css'
import React from 'react'
import {pure} from 'recompose'

const ResetButton = ({
  cleanUpRecordingResult
}) => (
  <span
    className='ResetButton'
    onClick={cleanUpRecordingResult}
  >
    RESET
  </span>
)

export default pure(ResetButton)
