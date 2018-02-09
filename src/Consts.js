import conf from './conf.json'

export const ViewPage = {
  SETTINGS_PAGE: 'SETTINGS_PAGE',
  EDIT_PAGE: 'EDIT_PAGE',
  ASSET_PAGE: 'ASSET_PAGE',
  PRESENTATION_PAGE: 'PRESENTATION_PAGE',
  RECORDING_PAGE: 'RECORDING_PAGE',
}

export const AssetType = {
  VIDEO: 'video',
  PHOTO: 'photo',
}

export const AssetPageTab = {
  VIDEO: 'video',
  PHOTO: 'photo',
}

export const ProjectDirs = {
  ASSETS: 'assets',
}

export const Ports = {
  ASSETS_SERVER_PORT: conf.ASSETS_SERVER_PORT,
}

export const PlaybackSpeed = {
  PLAYBACK_NORMAL: 1.0,
  PLAYBACK_FAST: 5.0,
}

export const PresenSize = {
  NORMAL_WIDTH: 640,
  NORMAL_HEIGHT: 360,
  WIDE_WIDTH: 1280,
  WIDE_HEIGHT: 720,
}
