const path = require('path');

const postcss = require('postcss');
const rtlcss = require('rtlcss');
const postcssUrl = require('postcss-url');
const { ConcatSource } = require('webpack-sources');
const { Compilation } = require('webpack');

class MsntWebpackRtlPlugin {
  constructor(options) {
    this.options = Object.assign(
      {
        dist: 'rtl/',
      },
      options
    );
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap(
      'MsntWebpackRtlPlugin',
      (compilation) => {
        compilation.hooks.processAssets.tapAsync(
          {
            name: 'MsntWebpackRtlPlugin',
            stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
          },
          async (assets, done) => {
            let promises = [];

            compilation.chunks.forEach((chunk) => {
              chunk.files.forEach((file) => {
                if (path.extname(file) !== '.css') return;

                const distPath = `./${this.options.dist}${file}`;

                const source = compilation.assets[file]
                  .source()
                  // fix for last rule in CSS
                  // last rule doesn't have semicolon which will break RTL behavior
                  .replace(/(\/\*!rtl:.*?\*\/)}/g, '$1;}');

                const promise = postcss()
                  .use(
                    postcssUrl({
                      url: 'rebase',
                    })
                  )
                  .use(
                    rtlcss([
                      this.options.options,
                      this.options.plugins,
                      this.options.hooks,
                    ])
                  )
                  .process(source, {
                    to: distPath,
                  })
                  .then(({ css }) => {
                    compilation.assets[distPath] = new ConcatSource(css);
                  });

                promises.push(promise);
              });
            });

            Promise.all(promises).then(() => {
              done();
            });
          }
        );
      }
    );
  }
}

module.exports = MsntWebpackRtlPlugin;
