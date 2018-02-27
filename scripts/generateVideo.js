#!/usr/bin/env node
const VideoData = require('./VideoData')
const VideoScript = require('./VideoScript')
const {join, extname, resolve} = require('path')
const {
  ls,
  exec: execOriginal,
} = require('shelljs')
const exec = (...args) => {
  console.log('$ ' + args[0])
  return execOriginal(...args)
}
const boxen = require('boxen')

const projectDir = process.argv[2]
if (!projectDir) {
  console.error('projectDir is required.')
  process.exit()
}
generateVideo(projectDir)

function generateVideo (projectDir) {
  projectDir = resolve(projectDir)
  const data = new VideoData(projectDir)
  const script = new VideoScript(projectDir)
  const videos = ls(join(projectDir, 'assets'))
    .map((path) => join(projectDir, 'assets', path))
    .filter((path) => ['.mp4', '.mov'].includes(extname(path)))

  // Mutable
  const eventDurations = data.eventTimes
    .slice(1)
    .map((time, index) => {
      const prevTime = data.eventTimes[index] // これでよい
      return time - prevTime
    })

  const assets = videos.map((videoPath, index) => {
    // 最後のフレームを画像として保存
    const videoDuration = script.duration(videoPath)
    const playingDuration = eventDurations.shift()
    if (playingDuration === undefined) {
      return {}
    }
    if (videoDuration >= playingDuration) {
      // カットする
      const mainVideo = script.cut(videoPath, {
        duration: playingDuration,
        force: false
      })
      return {
        mainVideo,
      }
    }

    let waitingDuration = playingDuration - videoDuration
    const isLastVideo = index === videos.length - 1
    if (isLastVideo) {
      while (true) {
        let duration = eventDurations.shift()
        if (duration === undefined) {
          break
        } else {
          waitingDuration += duration
        }
      }
    }
    const lastFramePicture = script.lastFrame(videoPath, {force: false})
    const lastFrameVideo = script.singlePictureVideo(lastFramePicture, {
      duration: waitingDuration,
      force: true
    })
    return {
      mainVideo: videoPath,
      lastFrameVideo,
    }
  }).reduce((videos, {mainVideo, lastFrameVideo}) =>
    videos.concat(mainVideo, lastFrameVideo), []
  ).filter(Boolean)

  const fullVideo = script.concat(assets, {force: true})

  const audioOrig = join(projectDir, 'audio.webm')
  const audio = script.denoiseAuido(audioOrig, {force: true})

  // カーソル動画と合成
  const appDir = join(__dirname, '..')
  const asDockerScript = (command) => `
    docker run -t --rm -v ${appDir}:/home/ -v ${projectDir}:${projectDir} -w /home valian/docker-python-opencv-ffmpeg:py3 ${command}
  `.trim()
  const videoWithCorsor = join(projectDir, 'tmp/video_cursored.mov')
  const generateCursorVideoScript = `python3 scripts/generateCursorVideo.py ${projectDir} ${fullVideo} ${videoWithCorsor}`
  exec(asDockerScript(generateCursorVideoScript))

  // 音声と動画のミックス
  const completed = script.mixVideoAudio({video: videoWithCorsor, audio})

  const message = [
    'Congratulations !!',
    `Video was generated at ${completed}`
  ].join('\n')
  console.log(boxen(message, {
    padding: 1,
    margin: 1,
    borderColor: 'green'
  }))
}
