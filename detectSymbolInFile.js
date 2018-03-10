const StreamZip = require('node-stream-zip')

/**
 * detectSymbolInFile
 * @param {string} path The path to the sketch file.
 * @param {string} symbolName The name of the symbol to look for.
 * @return {Promise} Resolves with an object containing whether a match was detected.
 */
module.exports = (path, symbolName) => {
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
      const data = zip.entryDataSync('meta.json')
      const metaJson = JSON.parse(data.toString())
      const pages = metaJson['pagesAndArtboards']
      let symbols

      for (let pageId in pages) {
        if (pages[pageId].name === 'Symbols') {
          symbols = pages[pageId].artboards
        }
      }

      if (!symbols) {
        zip.close()

        result['error'] = 'No page labelled "Symbols"'
        return reject(result)
      }

      for (let symbolId in symbols) {
        if (symbols[symbolId].name === symbolName) {
          zip.close()

          result['matched'] = true

          return resolve(result)
        }
      }

      zip.close()
      resolve(result)
    })
    .on('error', ((result, err) => {
      zip.close()

      result['error'] = err

      reject(result)
    }).bind(undefined, result))
  })
}
