import './Media.css'
import React from 'react'
import {pure} from 'recompose'
import db from '../db'
import {assetPathToUrl} from '../helpers'
import {ProgressEvent} from '../Consts'

const noop = () => {}

const Keys = {
  ENTER: 13,
  RIGHT: 39,
  LEFT: 37,
}

const MediaSize = {
  WIDTH: 640,
  HEIGHT: 360,
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
            <canvas className='Media-canvas' width={MediaSize.WIDTH} height={MediaSize.HEIGHT} ref={(c) => { this.canvas = c }} />
            {
              assetPath &&
              <video
                className='Media-video'
                src={assetPathToUrl(assetPath)}
                width={MediaSize.WIDTH}
                height={MediaSize.HEIGHT}
                ref={(v) => { this.video = v }}
              />
            }
            {
              !assetPath &&
              <div className='Media-nocontent'>
                <div>no contents</div>
              </div>
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

  componentDidUpdate (prev) {
    const prevAssetPath = prev.assets[prev.assetIndex]
    const {
      assets,
      assetIndex,
    } = this.props
    const assetPath = assets[assetIndex]
    if (prevAssetPath !== assetPath) {
      const {video, canvas} = this
      video.addEventListener('canplay', () => {
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, MediaSize.WIDTH, MediaSize.HEIGHT)
      })
    }
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
        break
      default:
        break
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
      recording,
      playing,
      togglePlaying,
      countupAssetIndex,
    } = this.props
    if (playing) {
      this.stop()
      togglePlaying(false)
      countupAssetIndex()
    } else {
      togglePlaying(true)
      this.play()
    }
    if (recording) {
      db.Progress.append({
        event: ProgressEvent.NEXT,
        at: Date.now()
      })
    }
  }

  doPrev = () => {
    const {
      recording,
      togglePlaying,
      countdownAssetIndex,
    } = this.props
    if (recording) {
      console.warn('Disabled doPrev while recording')
      return
    }
    this.stop()
    togglePlaying(false)
    countdownAssetIndex()
  }

  /**
    video 操作
  */

  play () {
    const {video, canvas} = this
    if (!video) {
      return
    }
    const ctx = canvas.getContext('2d')
    const syncCanvas = () => {
      ctx.drawImage(video, 0, 0, MediaSize.WIDTH, MediaSize.HEIGHT)
      window.requestAnimationFrame(syncCanvas)
    }
    this.animationId = window.requestAnimationFrame(syncCanvas)
    video.play()
    video.addEventListener('ended', () => {
      this.stop()
    })
    console.log('Animation started')
  }

  stop () {
    this.pause()
    if (this.animationId) {
      window.cancelAnimationFrame(this.animationId)
      this.animationId = null
      console.log('Animation stopped')
    }
  }

  pause () {
    if (this.video) {
      this.video.pause()
    }
  }
}

export default pure(Media)
