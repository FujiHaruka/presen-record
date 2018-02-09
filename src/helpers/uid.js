import uuid from 'uuid'

const uid = () => uuid.v4().split('-').join('').slice(0, 10)

export default uid
