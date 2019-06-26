interface IObj {
  [propName: string]: any
}

// 异步加载script
const scripts: IObj = {}

export function getScript(uri: string, opts = {}) {
  if (!uri) throw new Error('miss uri')
  if (scripts[uri] === true) return Promise.resolve()
  const head = document.head || document.getElementsByTagName('head')[0] || document.body
  const el = document.createElement('script')
  Object.assign(el, opts)
  el.src = uri
  el.async = true
  el.crossOrigin = 'anonymous'
  const promise: any = new Promise((resolve, reject) => {
    el.onload = function() {
      el.onload = null
      scripts[uri] = true
      resolve()
    }
    el.onerror = function(error) {
      el.onerror = null
      reject(error)
    }
  })
  head.appendChild(el)
  return promise
}
