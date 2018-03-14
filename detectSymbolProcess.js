const detectSymbolInFile = require('./detectSymbolInFile')


process.on('message', args => {
  const paths = args[0]
  const symbolName = args[1]
  const deep = args[2]

  paths.forEach(path =>
    detectSymbolInFile(path, symbolName, deep)
      .then(result => process.send(result))
      .catch(result => process.send(result))
  )
})
