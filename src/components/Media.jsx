import './Media.css'
import React from 'react'
import {pure} from 'recompose'
import db from '../db'

const noop = () => {}

class Media extends React.Component {
  render () {
    const {
      recording,
      mouseTracking,
      setMouseTracking,
      unsetMouseTracking,
    } = this.props
    return (
      <div className='Media'>
        <div
          className='Media-main'
          onMouseEnter={setMouseTracking}
          onMouseLeave={unsetMouseTracking}
          onMouseMove={(recording && mouseTracking) ? this.recordMouseMoving : noop}
        >
          a
        </div>
      </div>
    )
  }

  recordMouseMoving = (e) => {
    const {top, left} = e.target.getBoundingClientRect()
    const cursor = {
      at: Date.now(),
      x: e.clientX - left,
      y: e.clientY - top,
    }
    db.Cursor.append(cursor)
  }
}

export default pure(Media)
