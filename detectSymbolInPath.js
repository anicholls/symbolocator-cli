const fork = require('child_process').fork
const fs = require('fs')
const path = require('path')

/**
 * detectSymbolInPath
 * @param {string} filePath The path to the file or directory of sketch files.
 * @param {string} symbolName The name of the symbol to look for.
 * @param {boolean} deep Whether to perform a deep search or not.
 * @param {function} progressCb A callback function for each match found.
 * @return {Promise} Resolves with an object containing info about current progress.
 */
module.exports = (filePath, symbolName, deep, progressCb) => {
  return new Promise((resolve, reject) => {
    fs.lstat(filePath, (err, stats) => {
      if (err) throw err

      const output = {
        path: filePath,
        symbolName: symbolName,
        sketchFiles: [],
        searchedFiles: [],
        errors: []
      }

      if (stats.isDirectory()) {
        const files = _getSketchFilesFromDir(filePath)
        output.sketchFiles = output.sketchFiles.concat(files)

        const groupedFiles = _getGroupedFiles(files, 20)

        groupedFiles.forEach(group => {
          const detectSymbolProcess = fork(path.join(__dirname, 'detectSymbolProcess.js'))

          detectSymbolProcess
            .on('message', result => {
              if (result['error']) {
                output.errors.push(result)
              } else {
                output.searchedFiles.push(result)
              }

              if (progressCb) progressCb(output)
            })
            .on('error', (err) => {
              reject(err)
            })

          detectSymbolProcess.send([group, symbolName, deep])
        })

        resolve(output)
      }
      else if (stats.isFile()) {
        output.sketchFiles.push(filePath)

        detectSymbolInFile(filePath, symbolName, deep)
          .then(result => {
            output.searchedFiles.push(result)

            if (progressCb)
              progressCb(output)

            resolve(output)
          })
          .catch(err => {
            throw err
          })
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

function _isSketchFile(filePath) {
  const extension = filePath.split('.').pop()
  return (extension === 'sketch')
}

function _getGroupedFiles(files, size) {
  let groupedFiles = []

  while (files.length > 0) {
    groupedFiles.push(files.splice(0, size))
  }

  return groupedFiles
}
