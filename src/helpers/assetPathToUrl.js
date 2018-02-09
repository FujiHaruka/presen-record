import {Ports} from '../Consts'
import {relative} from './nodejs'

const assetPathToUrl = (path) =>
  `http://localhost:${Ports.ASSETS_SERVER_PORT}/${relative(window.globals.projectDir, path)}`

export default assetPathToUrl
