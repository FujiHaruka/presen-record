import './Time.css'
import React from 'react'
import {pure, compose} from 'recompose'

const pad2 = (str) => ('00' + str).slice(-2)
const formatTime = (total) => {
  const seconds = total % 60
  const minutes = Math.floor(total / 60)
  return `${pad2(minutes)}:${pad2(seconds)}`
}

const Time = ({
  totalSeconds
}) => (
  <div className='Time'>
    <pre><code>{formatTime(totalSeconds)}</code></pre>
  </div>
)

export default compose(
  pure
)(Time)
