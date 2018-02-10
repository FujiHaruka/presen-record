import {
  writeFile,
  readFile,
  join,
  existsFile,
  unlink,
} from './helpers/nodejs'
import asleep from 'asleep'

class Resource {
  constructor (name) {
    this.name = name + '.log'
    this.busy = false
  }

  get filePath () {
    return join(window.globals.projectDir, this.name)
  }

  async append (entity) {
    if (this.busy) {
      await this._wait()
    }
    this.busy = true
    try {
      const line = JSON.stringify(entity) + '\n'
      await writeFile(this.filePath, line, {flag: 'a'})
    } catch (e) {
      throw e
    } finally {
      this.busy = false
    }
  }

  async load () {
    const {filePath} = this
    const exists = await existsFile(filePath)
    if (!exists) {
      return []
    }
    const entities = (await readFile(filePath))
      .toString()
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line))
    return entities
  }

  async drop () {
    const {filePath} = this
    const exists = await existsFile(filePath)
    if (exists) {
      await unlink(filePath)
    }
  }

  async _wait () {
    while (this.busy) {
      await asleep(10)
    }
  }
}

const db = {
  Cursor: new Resource('cursor'),
  Progress: new Resource('progress')
}

export default db
