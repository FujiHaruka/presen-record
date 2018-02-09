import {Ports} from '../Consts'

const assetPathToUrl = (path) => `http://localhost:${Ports.ASSETS_SERVER_PORT}/${path}`

export default assetPathToUrl
