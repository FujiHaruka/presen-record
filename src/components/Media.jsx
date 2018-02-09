import './Media.css'
import React from 'react'
import {pure} from 'recompose'
import db from '../db'
import {assetPathToUrl} from '../helpers'

const noop = () => {}

const Keys = {
  ENTER: 13,
  RIGHT: 39,
  LEFT: 37,
}

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
    const assetPath = assets[assetIndex]
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
            {
              assetPath &&
              <video
                src={assetPathToUrl(assetPath)}
                width={640}
                height={360}
                ref={(v) => { this.video = v }}
              />
            }
            {
              !assetPath &&
              'no contents'
            }
          </div>
        </div>
      </div>
    )
  }

  componentDidMount () {
    document.addEventListener('keydown', this.onKeyDown)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.onKeyDown)
  }

  onKeyDown = (e) => {
    const {keyCode} = e
    switch (keyCode) {
      case Keys.ENTER:
      case Keys.RIGHT:
        this.doNext()
        return
      case Keys.LEFT:
        this.doPrev()
    }
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

  doNext = () => {
    const {
      playing,
      togglePlaying,
      countupAssetIndex,
    } = this.props
    const {video} = this
    if (playing) {
      togglePlaying(false)
      countupAssetIndex()
    } else {
      togglePlaying(true)
      video && video.play()
    }
  }

  doPrev = () => {
    const {
      togglePlaying,
      countdownAssetIndex,
    } = this.props
    togglePlaying(false)
    countdownAssetIndex()
  }
}

export default pure(Media)
