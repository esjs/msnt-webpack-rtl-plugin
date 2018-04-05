const path = require('path');

const postcss = require('postcss');
const rtlcss = require('rtlcss');
const postcssUrl = require("postcss-url");
const {ConcatSource} = require('webpack-sources');

class MsntWebpackRtlPlugin {
  constructor(options) {
    this.options = Object.assign({
      dist: 'rtl/'
    }, options);
  }

  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      compilation.chunks.forEach(chunk => {
        chunk.files.forEach(file => {
          if (path.extname(file) !== '.css') return;

          const source = compilation.assets[file].source();
          const rtlSource = postcss()
            .use(postcssUrl({
              url: 'rebase'
            }))
            .use(rtlcss([
              this.options.options,
              this.options.plugins,
              this.options.hooks
            ]))
            .process(source, {
              to: `./${this.options.dist}`,
            }).css;

          const newFilename = `${this.options.dist}${path.basename(file, '.css')}.css`;

          compilation.assets[newFilename] = new ConcatSource(rtlSource)
        });
      });

      callback();
    });
  }
}

module.exports = MsntWebpackRtlPlugin;