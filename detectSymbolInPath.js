const async = require('async')
const fs = require('fs')
const path = require('path')
const detectSymbolInFile = require('./detectSymbolInFile')

/**
 * detectSymbolInPath
 * @param {string} path The path to the file or directory of sketch files.
 * @param {string} symbolName The name of the symbol to look for.
 * @param {function} progressCb A callback function for each match found.
 * @return {Promise} Resolves with an object containing info about current progress.
 */
module.exports = (path, symbolName, progressCb) => {
  return new Promise((resolve, reject) => {
    fs.lstat(path, (err, stats) => {
      if (err) throw err

      const output = {
        path: path,
        symbolName: symbolName,
        sketchFiles: [],
        matchedFiles: []
      }

      if (stats.isDirectory()) {
        const files = _getSketchFilesFromDir(path)
        output.sketchFiles = output.sketchFiles.concat(files)

        // Parse 20 files at once
        async.eachLimit(files, 20,
          (path, done) => {
            detectSymbolInFile(path, symbolName)
              .then(result => {
                output.matchedFiles.push(result)

                if (progressCb)
                  progressCb(output)

                done()
              })
              .catch(err => { throw err })
          },
          (err) => {
            if (err) reject(err)

            resolve(output)
          }
        )
      }
      else if (stats.isFile()) {
        output.sketchFiles.push(path)

        detectSymbolInFile(path, symbolName)
          .then(result => {
            output.matchedFiles.push(result)

            if (progressCb)
              progressCb(output)

            resolve(output)
          })
          .catch(err => { throw err })
      }
    })
  })
}

function _getSketchFilesFromDir(dir) {
  return fs.readdirSync(dir).reduce((files, file) => {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      return files.concat(_getSketchFilesFromDir(path.join(dir, file)))
    }
    else if (_isSketchFile(file)) {
      return files.concat(path.join(dir, file))
    }
    else {
      return files
    }
  }, [])
}

function _isSketchFile(path) {
  const extension = path.split('.').pop()
  return (extension === 'sketch')
}
