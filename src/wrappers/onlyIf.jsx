import React from 'react'

function onlyIf (renderFlagName) {
  return function onlyIfImpl (Component) {
    class OnlyIf extends React.Component {
      render () {
        const {props} = this
        return props[renderFlagName]
          ? <Component {...props} />
          : null
      }
    }
    return OnlyIf
  }
}

export default onlyIf
