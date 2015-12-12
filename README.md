# markdown-it-pandoc-renderer

[![Build Status](https://img.shields.io/travis/classeur/markdown-it-pandoc-renderer/master.svg?style=flat)](https://travis-ci.org/classeur/markdown-it-pandoc-renderer)
[![NPM version](https://img.shields.io/npm/v/markdown-it-pandoc-renderer.svg?style=flat)](https://www.npmjs.org/package/markdown-it-pandoc-renderer)

> [Markdown-it](https://github.com/markdown-it/markdown-it) renderer that generates Pandoc compatible AST.

## Install

```bash
npm install markdown-it-pandoc-renderer --save
```

## Use

```js
var md = require('markdown-it')()
var render = require('markdown-it-pandoc-renderer')

render(md.parse('abc', {})) // => '[{"unMeta":{}},[{"t":"Para","c":[{"t":"Str","c":"abc"}]}]]'
```

_Differences in browser._ If you load script directly into the page, without
package system, module will add itself globally as `window.markdownitPandocRenderer`.


## License

[MIT](https://github.com/classeur/markdown-it-pandoc-renderer/blob/master/LICENSE)
