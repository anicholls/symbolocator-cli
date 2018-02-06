#!/usr/bin/env node
'use strict'
const meow = require('meow')
const path = require('path')
const detectSymbolInPath = require('./detectSymbolInPath')

const cli = meow(`
  Usage
    $ symbolocator [directory] <symbol name>
`)

if (cli.flags.h) {
  cli.showHelp()
}

if (!cli.input || cli.input.length === 0) {
  console.error("Error: You must specify a directory to search within")
  cli.showHelp()
}
else if (cli.input.length === 1) {
  console.error("Error: You must specify a symbol name to search")
  cli.showHelp()
}
else {
  const filePath = path.resolve(cli.input[0])
  const symbolName = cli.input[1]

  detectSymbolInPath(filePath, symbolName)
    .then(result => {
      console.log(result)
    })
    .catch(err => { throw err })
}
