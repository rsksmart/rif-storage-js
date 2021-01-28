module.exports = {
  depCheck: {
    ignore: ['readable-stream', 'typedoc', 'typedoc-plugin-markdown', '@types/*', 'tasegir', '@erebos/api-bzz-browser']
  },
  tsconfig: {
    compilerOptions: {
      skipLibCheck: true
    }
  }
}
