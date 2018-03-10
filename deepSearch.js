/**
 * deepSearch
 * @param {string} path The path to the sketch file.
 * @param {string} symbolName The name of the symbol to look for.
 * @param {object} result The result object returned to the user (for error reporting).
 * @return {Promise} Resolves with an object containing whether a match was detected.
 */
module.exports = (zip, symbolName, result) => {
  const metaData = zip.entryDataSync('meta.json')
  const metaJson = JSON.parse(metaData.toString())
  const pages = metaJson['pagesAndArtboards']

  const symbolsPageId = _getSymbolsPageId(pages)

  if (!symbolsPageId) {
    result['error'] = 'No page labelled "Symbols"'
    return false
  }

  const symbolId = _getSymbolId(zip, symbolsPageId, symbolName)

  if (!symbolId) {
    return false
  }

  return _findSymbolInPages(zip, pages, symbolId, symbolsPageId)
}

function _getSymbolsPageId(pages) {
  for (let pageId in pages) {
    if (pages[pageId].name === 'Symbols') {
      return pageId
    }
  }
}

function _getSymbolId(zip, symbolsPageId, symbolName) {
  const symbolsData = zip.entryDataSync(`pages/${symbolsPageId}.json`)
  const symbolsJson = JSON.parse(symbolsData.toString())

  for (let layer of symbolsJson.layers) {
    if (layer['_class'] == 'symbolMaster' && layer.name == symbolName) {
      return layer.symbolID
    }
  }
}

function _findSymbolInPages(zip, pages, symbolId, symbolsPageId) {
  for (let pageId in pages) {
    if (pageId == symbolsPageId) {
      continue
    }

    const pageData = zip.entryDataSync(`pages/${pageId}.json`)
    const pageJson = JSON.parse(pageData.toString())

    return _layerSearch(pageJson.layers, symbolId)
  }
}

function _layerSearch(layers, symbolId) {
  for (let layer of layers) {
    if (layer['_class'] == 'symbolInstance' && layer.symbolID == symbolId) {
      return true
    }

    if (layer.layers.length) {
      return _layerSearch(layer.layers, symbolId)
    }
  }
}
