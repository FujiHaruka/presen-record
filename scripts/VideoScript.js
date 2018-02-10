const {
  test,
  exec: execOriginal,
  mkdir,
} = require('shelljs')
const exec = (...args) => {
  console.log('$ ' + args[0])
  return execOriginal(...args)
}
const {join, basename} = require('path')
const assertExists = (path) => {
  if (!test('-f', path)) {
    throw new Error(`File doesn't exists: ${path}`)
  }
}
const pad2 = (str) => ('00' + str).slice(-2)
const head6 = (str) => str.slice(0, 6)
const asInputArgs = (files) => files.map((file) => `-i ${file}`).join(' ')

class VideoScript {
  constructor (projectDir) {
    this.projectDir = projectDir
    this.tmpdir = join(projectDir, 'tmp')
    mkdir('-p', this.tmpdir)
  }

  lastFrame (videoSrc) {
    assertExists(videoSrc)
    const pictureDest = join(
      this.tmpdir,
      basename(videoSrc.replace(/\.\w+$/, '-last.png'))
    )
    console.log(`Creating ${pictureDest}`)
    let lastFrame = exec(`ffprobe -show_streams "${videoSrc}" 2> /dev/null | grep nb_frames | head -1 | cut -d \\= -f 2`, {silent: true})
    lastFrame -= 1
    exec(`ffmpeg -y -loglevel error -i ${videoSrc} -vf select=\\'eq\\(n,${lastFrame}\\) -vframes 1 ${pictureDest}`)
    return pictureDest
  }

  firstFrame (videoSrc) {
    assertExists(videoSrc)
    const pictureDest = join(
      this.tmpdir,
      basename(videoSrc.replace(/\.\w+$/, '-first.png'))
    )
    console.log(`Creating ${pictureDest}`)
    exec(`ffmpeg -y -loglevel error -i ${videoSrc} -vframes 1 ${pictureDest}`)
    return pictureDest
  }

  singlePictureVideo (pictureSrc, options = {}) {
    assertExists(pictureSrc)
    const {duration = 10} = options
    const durationF = `${pad2(Math.floor(duration / 60))}:${head6(pad2(duration % 60))}`
    const dest = join(
      this.tmpdir,
      basename(pictureSrc.replace(/\.\w+$/, '.mp4'))
    )
    console.log(`Creating ${dest}`)
    exec(`ffmpeg -y -loop 1 -loglevel error -i ${pictureSrc} -c:v h264 -t ${durationF} -pix_fmt yuv420p -r 30 ${dest}`)
    return dest
  }

  concat (videos = []) {
    videos.forEach(assertExists)
    const dest = join(
      this.tmpdir,
      'concat.mp4'
    )
    console.log(`Creating ${dest}`)
    exec(`ffmpeg -y -loglevel error ${asInputArgs(videos)} -filter_complex "concat=n=${videos.length}:v=1:a=0" ${dest}`)
    return dest
  }

  mixVideoAudio ({video, audio}) {
    [video, audio].forEach(assertExists)
    const dest = join(
      this.tmpdir,
      'mixed.mp4'
    )
    console.log(`Creating ${dest}`)
    exec(`ffmpeg -y -loglevel error ${asInputArgs([video, audio])} -vcodec copy -acodec copy ${dest}`)
    return dest
  }
}

module.exports = VideoScript
