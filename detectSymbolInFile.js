const StreamZip = require('node-stream-zip')
const deepSearch = require('./deepSearch')
const shallowSearch = require('./shallowSearch')

/**
 * detectSymbolInFile
 * @param {string} path The path to the sketch file.
 * @param {string} symbolName The name of the symbol to look for.
 * @param {boolean} deep Whether to perform a deep search or not.
 * @return {Promise} Resolves with an object containing whether a match was detected.
 */
module.exports = (path, symbolName, deep) => {
  return new Promise((resolve, reject) => {
    const result = {
      path: path,
      symbolName: symbolName,
      matched: false
    }

    const zip = new StreamZip({
      file: path,
      storeEntries: true
    })
    .on('ready', () => {
      const searchFn = deep ? deepSearch : shallowSearch
      const detected = searchFn(zip, symbolName, result)

      zip.close()

      if (detected) {
        result['matched'] = true
        return resolve(result)
      }
      else {
        return reject(result)
      }
    })
    .on('error', ((result, err) => {
      zip.close()

      result['error'] = err

      reject(result)
    }).bind(undefined, result))
  })
}
