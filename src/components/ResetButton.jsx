import './ResetButton.css'
import React from 'react'
import {pure} from 'recompose'

const ResetButton = ({
  resetRecording
}) => (
  <span
    className='ResetButton'
    onClick={resetRecording}
  >
    RESET
  </span>
)

export default pure(ResetButton)
