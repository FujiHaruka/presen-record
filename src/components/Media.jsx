import './Media.css'
import React from 'react'
import {pure} from 'recompose'
import db from '../db'
import {assetPathToUrl} from '../helpers'
import {ProgressEvent} from '../Consts'
import Time from './Time'

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
      recordingSeconds,
    } = this.props
    const assetPath = assets[assetIndex]
    return (
      <div className='Media'>
        <div className='Media-main-wrap'>
          <div className='Media-header'>
            <Time totalSeconds={recordingSeconds} />
            <div className='Media-header-page'><code>{assetIndex + 1}/{assets.length}</code></div>
          </div>
          <div
            className='Media-main'
            onMouseEnter={setMouseTracking}
            onMouseLeave={unsetMouseTracking}
            onMouseMove={(recording && mouseTracking) ? this.recordMouseMoving : noop}
          >
            <canvas className='Media-canvas' width={MediaSize.WIDTH} height={MediaSize.HEIGHT} ref={(c) => { this.canvas = c }} />
            <video
              className='Media-video'
              src={assetPath && assetPathToUrl(assetPath)}
              width={MediaSize.WIDTH}
              height={MediaSize.HEIGHT}
              ref={(v) => { this.video = v }}
            />
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

    const {video, canvas} = this
    video.addEventListener('canplay', () => {
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, MediaSize.WIDTH, MediaSize.HEIGHT)
      if (this.props.assetIndex > 0) {
        this.play()
        this.props.togglePlaying(true)
      }
    })
    video.addEventListener('ended', () => {
      this.stop()
    })
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.onKeyDown)
  }

  componentDidUpdate (prev) {
    const {
      recordingDone,
    } = this.props
    if (!prev.recordingDone && recordingDone) {
      this.stop()
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
      assets,
      assetIndex,
    } = this.props
    const isLast = assetIndex === assets.length - 1
    this.stop()
    if (isLast) {
      return
    }
    if (assetIndex === 0 && !playing) {
      this.play()
    } else {
      countupAssetIndex()
    }
    togglePlaying(true)
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
    this.stop() // 前のビデオを終了する
    const ctx = canvas.getContext('2d')
    const syncCanvas = () => {
      ctx.drawImage(video, 0, 0, MediaSize.WIDTH, MediaSize.HEIGHT)
      window.requestAnimationFrame(syncCanvas)
    }
    this.animationId = window.requestAnimationFrame(syncCanvas)
    video.play()
    console.log(`Animation started (request id = ${this.animationId})`)
  }

  stop () {
    this.pause()
    if (this.animationId) {
      window.cancelAnimationFrame(this.animationId)
      console.log(`Animation stopped (request id = ${this.animationId})`)
      this.animationId = null
    }
  }

  pause () {
    if (this.video) {
      this.video.pause()
    }
  }
}

export default pure(Media)
