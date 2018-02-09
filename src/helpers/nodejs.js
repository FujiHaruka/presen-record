import promisify from 'es6-promisify'

const fs = window.require('fs')
const childProcess = window.require('child_process')
const path = window.require('path')
const assert = window.require('assert')

export const join = path.join
export const extname = path.extname
export const ok = assert.ok

export const readFile = promisify(fs.readFile)
export const writeFile = promisify(fs.writeFile)
export const existsFile = (path) => new Promise((resolve) => {
  fs.stat(path, (err) => err ? resolve(false) : resolve(true))
})
export const mkdirp = (path) => new Promise((resolve) => {
  fs.mkdir(path, (e) => resolve())
})
export const copy = (src, dest) => new Promise((resolve, reject) => {
  const read = fs.createReadStream(src)
  const write = fs.createWriteStream(dest)
  read.on('error', reject)
  write.on('error', reject)
  write.on('close', resolve)
  read.pipe(write)
})
export const unlink = promisify(fs.unlink)

export const exec = promisify(childProcess.exec)
