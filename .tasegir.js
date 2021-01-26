module.exports = {
  depCheck: {
    ignore: ['readable-stream', 'sinon', 'typedoc', 'typedoc-plugin-markdown', '@types/*', 'tasegir']
  },
  tsconfig: {
    compilerOptions: {
      skipLibCheck: true
    }
  }
}
