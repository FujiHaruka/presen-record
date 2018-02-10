import blobToBuffer from 'blob-to-buffer'
import {writeFile, join, unlink, existsFile} from './nodejs'

const RecordRTC = require('recordrtc')
const {StereoAudioRecorder} = RecordRTC
if (!StereoAudioRecorder) {
  throw new Error(`StereoAudioRecorder is ${StereoAudioRecorder}`)
}
if (!navigator.getUserMedia) {
  throw new Error(`navigator.getUserMedia is not supported`)
}

class AudioRecorder {
  constructor () {
    this.filePath = join(window.globals.projectDir, 'audio.wav')
    this.recordRTC = null
  }

  async ready () {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia({audio: true},
        (stream) => {
          console.log('Got user media')
          const options = {
            type: 'audio',
            recorderType: StereoAudioRecorder,
            mimeType: 'audio/wav'
          }
          this.recordRTC = RecordRTC(stream, options)
          resolve()
        },
        (err) => {
          reject(err)
        }
      )
    })
  }

  startRecording () {
    this.recordRTC.startRecording()
  }

  async stopAndSaveRecording () {
    const {recordRTC} = this
    const blob = await new Promise((resolve, reject) => {
      recordRTC.stopRecording((audioUrl) => {
        const blob = recordRTC.getBlob()
        resolve(blob)
      })
    })
    const buffer = await new Promise((resolve, reject) => {
      blobToBuffer(blob, (err, buffer) => err ? reject(err) : resolve(buffer))
    })
    await writeFile(this.filePath, buffer)
    recordRTC.clearRecordedData()
  }

  async delete () {
    const exists = await existsFile(this.filePath)
    if (exists) {
      await unlink(this.filePath)
    }
  }
}

export default AudioRecorder
