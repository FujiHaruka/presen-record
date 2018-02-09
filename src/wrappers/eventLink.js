const eventLink = (func) => (e) => func(e.target.value)

export default eventLink
