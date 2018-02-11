import blobToBuffer from 'blob-to-buffer'
import {writeFile, join, unlink, existsFile} from './nodejs'

const RecordRTC = require('recordrtc')
const {MediaStreamRecorder} = RecordRTC
if (!MediaStreamRecorder) {
  throw new Error(`MediaStreamRecorder is ${MediaStreamRecorder}`)
}
if (!navigator.getUserMedia) {
  throw new Error(`navigator.getUserMedia is not supported`)
}

class AudioRecorder {
  constructor () {
    this.filePath = join(window.globals.projectDir, 'audio.webm')
    this.recordRTC = null
  }

  async ready () {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia({audio: true},
        (stream) => {
          console.log('Got user media')
          const options = {
            type: 'audio',
            recorderType: MediaStreamRecorder,
            mimeType: 'audio/webm'
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
