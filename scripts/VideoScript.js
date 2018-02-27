const {
  test,
  exec: execOriginal,
  mkdir,
  rm,
} = require('shelljs')
const exec = (...args) => {
  console.log('$ ' + args[0])
  return execOriginal(...args)
}
const {join, basename, resolve} = require('path')
const assertExists = (path) => {
  if (!test('-f', path)) {
    throw new Error(`File doesn't exists: ${path}`)
  }
}
const pad2 = (str) => ('00' + str).slice(-2)
const head6 = (str) => String(str).slice(0, 6)
const asInputArgs = (files) => files.map((file) => `-i ${file}`).join(' ')

class VideoScript {
  constructor (projectDir) {
    this.projectDir = resolve(projectDir)
    this.tmpdir = join(projectDir, 'tmp')
    mkdir('-p', this.tmpdir)
  }

  lastFrame (videoSrc, options = {}) {
    const {force = true} = options
    assertExists(videoSrc)
    const pictureDest = join(
      this.tmpdir,
      basename(videoSrc.replace(/\.\w+$/, '-last.png'))
    )
    if (!force) {
      if (test('-f', pictureDest)) {
        return pictureDest
      }
    }
    console.log(`Creating ${pictureDest}`)
    let lastFrame = exec(`ffprobe -loglevel error -show_streams "${videoSrc}" | grep nb_frames | head -1 | cut -d \\= -f 2`, {silent: true})
    lastFrame -= 2 // 1 だと失敗することがある
    exec(`ffmpeg -y -loglevel error -i ${videoSrc} -vf "select='eq(n,${lastFrame})'" -vframes 1 ${pictureDest}`)
    return pictureDest
  }

  firstFrame (videoSrc, options = {}) {
    const {force = true} = options
    assertExists(videoSrc)
    const pictureDest = join(
      this.tmpdir,
      basename(videoSrc.replace(/\.\w+$/, '-first.png'))
    )
    if (!force) {
      if (test('-f', pictureDest)) {
        return pictureDest
      }
    }
    console.log(`Creating ${pictureDest}`)
    exec(`ffmpeg -y -loglevel error -i ${videoSrc} -vframes 1 ${pictureDest}`)
    return pictureDest
  }

  duration (videoSrc) {
    const duration = exec(`ffprobe -loglevel error -show_streams "${videoSrc}" | grep duration= | head -1 | cut -d \\= -f 2`, {silent: true})
    if (isNaN(Number(duration))) {
      throw new Error(`duration is NaN`)
    }
    // ミリ秒
    return Number(duration) * 1000
  }

  singlePictureVideo (pictureSrc, options = {}) {
    assertExists(pictureSrc)
    const {
      duration = 10 * 1000, // ミリ秒
      force = true
    } = options
    const seconds = duration / 1000
    const minutesF = pad2(Math.floor(seconds / 60))
    let secondsF = seconds % 60
    if (secondsF < 10) {
      secondsF = '0' + secondsF
    }
    secondsF = head6(secondsF)
    const durationF = `${minutesF}:${secondsF}`
    const dest = join(
      this.tmpdir,
      basename(pictureSrc.replace(/\.\w+$/, '.mp4'))
    )
    if (!force) {
      if (test('-f', dest)) {
        return dest
      }
    }
    console.log(`Creating ${dest}`)
    exec(`ffmpeg -y -loop 1 -loglevel error -i ${pictureSrc} -c:v h264 -t ${durationF} -pix_fmt yuv420p -r 30 ${dest}`)
    return dest
  }

  concat (videos = [], options = {}) {
    const {force = true} = options
    videos.forEach(assertExists)
    const dest = join(
      this.tmpdir,
      'concat.mp4'
    )
    if (!force) {
      if (test('-f', dest)) {
        return dest
      }
    }
    console.log(`Creating ${dest}`)
    exec(`ffmpeg -y -loglevel error ${asInputArgs(videos)} -filter_complex "concat=n=${videos.length}:v=1:a=0" ${dest}`)
    return dest
  }

  cut (src, options = {}) {
    const {
      duration,
      force = true,
    } = options
    assertExists(src)
    const dest = join(
      this.tmpdir,
      basename(src)
    )
    if (!force) {
      if (test('-f', dest)) {
        return dest
      }
    }
    console.log(`Creating ${dest}`)
    const seconds = duration / 1000
    exec(`ffmpeg -y -loglevel error -i ${src} -t ${seconds} -ss 0 ${dest}`)
    return dest
  }

  mixVideoAudio ({video, audio}) {
    [video, audio].forEach(assertExists)
    const dest = join(
      this.tmpdir,
      'mixed.mp4'
    )
    console.log(`Creating ${dest}`)
    // ここで再エンコードする
    exec(`ffmpeg -y -loglevel error ${asInputArgs([video, audio])} -vcodec libx264 -pix_fmt yuv420p ${dest}`)
    return dest
  }

  denoiseAuido (audioSrc, options = {}) {
    const {force = false} = options
    const tmpWavFile = join(
      this.tmpdir,
      'tmp.wav'
    )
    const dest = join(
      this.tmpdir,
      'audio.wav'
    )
    if (!force) {
      if (test('-f', dest)) {
        return dest
      }
    }
    console.log(`Creating ${dest}`)
    // 映像なしの wav ファイルに変換
    exec(`ffmpeg -y -loglevel error -i ${audioSrc} -vn ${tmpWavFile}`)
    // ローパスフィルタで高音を除去
    exec(`sox ${tmpWavFile} ${dest} lowpass 3800`)
    rm(tmpWavFile)
    return dest
  }
}

module.exports = VideoScript
