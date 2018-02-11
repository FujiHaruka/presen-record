#!/usr/bin/env node
const VideoData = require('./VideoData')
const VideoScript = require('./VideoScript')
const {join, extname, resolve} = require('path')
const {
  ls,
  exec,
} = require('shelljs')
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

  const assets = videos.map((videoPath) => {
    // 最初と最後のフレームを画像として保存
    const firstDuration = eventDurations.shift()
    if (firstDuration === undefined) {
      return {}
    }
    const firstFramePicture = script.firstFrame(videoPath, {force: false})
    const firstFrameVideo = script.singlePictureVideo(firstFramePicture, {
      duration: firstDuration,
      force: false
    })

    const videoDuration = script.duration(videoPath)
    const secondDuration = eventDurations.shift()
    if (secondDuration === undefined) {
      return {firstFrameVideo}
    }
    if (videoDuration >= secondDuration) {
      // カットする
      const mainVideo = script.cut(videoPath, {
        duration: secondDuration,
        force: false
      })
      return {
        mainVideo,
        firstFrameVideo,
      }
    }

    const lastDuration = secondDuration - videoDuration
    const lastFramePicture = script.lastFrame(videoPath, {force: false})
    const lastFrameVideo = script.singlePictureVideo(lastFramePicture, {
      duration: lastDuration,
      force: false
    })
    return {
      firstFrameVideo,
      mainVideo: videoPath,
      lastFrameVideo,
    }
  }).reduce((videos, {firstFrameVideo, mainVideo, lastFrameVideo}) =>
    videos.concat(firstFrameVideo, mainVideo, lastFrameVideo), []
  ).filter(Boolean)

  const fullVideo = script.concat(assets, {force: false})

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
