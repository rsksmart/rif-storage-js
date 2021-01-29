module.exports = {
  depCheck: {
    ignore: ['readable-stream', 'electron', 'typedoc', 'typedoc-plugin-markdown', '@types/*', 'tasegir', '@erebos/api-bzz-browser']
  },
  tsconfig: {
    compilerOptions: {
      skipLibCheck: true
    }
  }
}
