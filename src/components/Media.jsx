import './Media.css'
import React from 'react'
import {pure} from 'recompose'
import db from '../db'
import {assetPathToUrl} from '../helpers'

const noop = () => {}

class Media extends React.Component {
  render () {
    const {
      assets,
      assetIndex,
      recording,
      mouseTracking,
      setMouseTracking,
      unsetMouseTracking,
    } = this.props
    const assetPath = assets[assetIndex] || ''
    return (
      <div className='Media'>
        <div className='Media-main-wrap'>
          <div
            className='Media-info'
          >{assetIndex + 1} / {assets.length}</div>
          <div
            className='Media-main'
            onMouseEnter={setMouseTracking}
            onMouseLeave={unsetMouseTracking}
            onMouseMove={(recording && mouseTracking) ? this.recordMouseMoving : noop}
          >
            <video src={assetPathToUrl(assetPath)} width={640} height={360} />
          </div>
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
