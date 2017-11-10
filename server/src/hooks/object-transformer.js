const t = result => {
  if (result._id) {
    result.id = result._id.toHexString()
    delete result._id
  }
}

const transform = () => async hook => {
  if (!hook.result) {
    return hook
  }
  if (Array.isArray(hook.result.data)) {
    for (const result of hook.result.data) {
      t(result)
    }
  } else {
    t(hook.result)
  }

  return hook
}

module.exports = transform
