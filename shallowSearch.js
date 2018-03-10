/**
 * shallowSearch
 * @param {string} path The path to the sketch file.
 * @param {string} symbolName The name of the symbol to look for.
 * @param {object} result The result object returned to the user (for error reporting).
 * @return {Promise} Resolves with an object containing whether a match was detected.
 */
module.exports = (zip, symbolName, result) => {
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
    result['error'] = 'No page labelled "Symbols"'
    return false
  }

  for (let symbolId in symbols) {
    if (symbols[symbolId].name === symbolName) {
      return true
    }
  }
}
