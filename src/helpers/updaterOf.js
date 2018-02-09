const updaterOf = (name) => (state) => (payload) => ({[name]: payload})

export default updaterOf
