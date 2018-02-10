const {
  cat,
} = require('shelljs')
const {join} = require('path')
// src/Consts.js
const ProgressEvent = {
  START: 'start',
  END: 'end',
  NEXT: 'next',
}

class VideoData {
  constructor (projectDir) {
    this.projectDir = projectDir

    // Load data
    // TODO あとで
    // const cursorPath = join(projectDir, 'cursor.log')
    // const cursors = cat(cursorPath)
    //   .toString()
    //   .trim()
    //   .split('\n')
    //   .map((line) => JSON.parse(line))
    const progressPath = join(projectDir, 'progress.log')
    const progresses = cat(progressPath)
      .toString()
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line))

    // Parse data
    if (progresses[0].event !== ProgressEvent.START) {
      throw new Error('First event must be "start"')
    }
    if (progresses[progresses.length - 1].event !== ProgressEvent.END) {
      throw new Error('Last event must be "end"')
    }
    // ミリ秒
    this.startAt = progresses[0].at
    this.endAt = progresses[progresses.length - 1].at
    this.totalDuration = this.endAt - this.startAt
    this.eventTimes = progresses
      .map((p) => p.at)
      .map((time) => time - this.startAt)
  }
}

module.exports = VideoData
