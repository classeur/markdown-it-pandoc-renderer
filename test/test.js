/* global describe, it */
/* eslint quotes:0, key-spacing:0, comma-spacing:0 */
require('should')
var fs = require('fs')
var path = require('path')
var renderer = require('../markdown-it-pandoc-renderer')
var md = require('markdown-it')()
var markdownitAnchor = require('markdown-it-anchor')
var markdownitAbbr = require('markdown-it-abbr')
var markdownitDeflist = require('markdown-it-deflist')
var markdownitFootnote = require('markdown-it-footnote')
var markdownitSub = require('markdown-it-sub')
var markdownitSup = require('markdown-it-sup')
var markdownitMathjax = require('markdown-it-mathjax')

md.set({
  html: true,
  linkify: true,
  langPrefix: 'language-'
})

md.use(markdownitAnchor)
md.use(markdownitAbbr)
md.use(markdownitDeflist)
md.use(markdownitFootnote)
md.use(markdownitSub)
md.use(markdownitSup)
md.use(markdownitMathjax)

function render (str, options) {
  return renderer(md.parse(str, {}), options)
}

describe('Header', function () {
  it('should work properly', function () {
    render(`
# abc
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Header","c":[1,["abc",[],[]],[{"t":"Str","c":"abc"}]]}]})
  })
  it('should work with setext', function () {
    render(`
abc
---
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Header","c":[2,["abc",[],[]],[{"t":"Str","c":"abc"}]]}]})
  })
})

describe('Para', function () {
  it('should work properly', function () {
    render(`
abc
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Str","c":"abc"}]}]})
  })
  it('should work not contain control characters', function () {
    render('a\x00\x01\tb\x0B  \nc\x1F\x7F').should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Str","c":"a"},{"t":"Space"},{"t":"Str","c":"b"},{"t":"LineBreak"},{"t":"Str","c":"c"}]}]})
  })
})

describe('BlockQuote', function () {
  it('should work properly', function () {
    render(`
> abc
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"BlockQuote","c":[{"t":"Para","c":[{"t":"Str","c":"abc"}]}]}]})
  })
})

describe('BulletList', function () {
  it('should work properly', function () {
    render(`
- a
- b
- c
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"BulletList","c":[[{"t":"Plain","c":[{"t":"Str","c":"a"}]}],[{"t":"Plain","c":[{"t":"Str","c":"b"}]}],[{"t":"Plain","c":[{"t":"Str","c":"c"}]}]]}]})
  })
})

describe('OrderedList', function () {
  it('should work properly', function () {
    render(`
1. a
2. b
3. c
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"OrderedList","c":[[1,{"t":"Decimal"},{"t":"Period"}],[[{"t":"Plain","c":[{"t":"Str","c":"a"}]}],[{"t":"Plain","c":[{"t":"Str","c":"b"}]}],[{"t":"Plain","c":[{"t":"Str","c":"c"}]}]]]}]})
  })
  it('should work not starting from 1', function () {
    render(`
2. a
3. b
4. c
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"OrderedList","c":[[2,{"t":"Decimal"},{"t":"Period"}],[[{"t":"Plain","c":[{"t":"Str","c":"a"}]}],[{"t":"Plain","c":[{"t":"Str","c":"b"}]}],[{"t":"Plain","c":[{"t":"Str","c":"c"}]}]]]}]})
  })
})

describe('CodeBlock', function () {
  it('should work properly', function () {
    render(`
    123
        abc
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"CodeBlock","c":[["",[],[]],"123\n    abc"]}]})
  })
  it('should work from fence', function () {
    render(`
\`\`\`
123
    abc
\`\`\`
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"CodeBlock","c":[["",[],[]],"123\n    abc"]}]})
  })
})

describe('Link', function () {
  it('should work properly', function () {
    render(`
[abc](http://123)
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Link","c":[["",[],[]],[{"t":"Str","c":"abc"}],["http://123",""]]}]}]})
  })
  it('should work with "alt"', function () {
    render(`
[abc](http://123 "alt")
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Link","c":[["",[],[]],[{"t":"Str","c":"abc"}],["http://123","alt"]]}]}]})
  })
})

describe('Image', function () {
  it('should work properly', function () {
    render(`
![abc](http://123)
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Figure","c":[["",[],[]],[null,[{"t":"Plain","c":[{"t":"Str","c":"abc"}]}]],[{"t":"Plain","c":[{"t":"Image","c":[["",[],[]],[{"t":"Str","c":"abc"}],["http://123",""]]}]}]]}]})
  })
  it('inline should work properly', function () {
    render(`
Inline ![abc](http://123).
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Str","c":"Inline"},{"t":"Space"},{"t":"Image","c":[["",[],[]],[{"t":"Str","c":"abc"}],["http://123",""]]},{"t":"Str","c":"."}]}]})
  })
  it('should work with empty src', function () {
    render(`
![abc]()
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[]}]})
  })
  it('should work with "alt"', function () {
    render(`
![abc](http://123 "alt")
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Figure","c":[["",[],[]],[null,[{"t":"Plain","c":[{"t":"Str","c":"abc"}]}]],[{"t":"Plain","c":[{"t":"Image","c":[["",[],[]],[{"t":"Str","c":"abc"}],["http://123","alt"]]}]}]]}]})
  })
})

describe('Note', function () {
  it('should work properly', function () {
    render(`
Abc.[^1]

[^1]: xyz.
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Str","c":"Abc."},{"t":"Note","c":[{"t":"Para","c":[{"t":"Str","c":"xyz."}]}]}]}]})
  })
  it('should work inline', function () {
    render(`
Abc.^[xyz]
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Str","c":"Abc."},{"t":"Note","c":[{"t":"Para","c":[{"t":"Str","c":"xyz"}]}]}]}]})
  })
})

describe('Emph', function () {
  it('should work properly', function () {
    render(`
*abc*
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Emph","c":[{"t":"Str","c":"abc"}]}]}]})
  })
})

describe('Strong', function () {
  it('should work properly', function () {
    render(`
**abc**
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Strong","c":[{"t":"Str","c":"abc"}]}]}]})
  })
})

describe('Strikeout', function () {
  it('should work properly', function () {
    render(`
~~abc~~
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Strikeout","c":[{"t":"Str","c":"abc"}]}]}]})
  })
})

describe('Code', function () {
  it('should work properly', function () {
    render(`
\`abc\`
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Code","c":[["",[],[]],"abc"]}]}]})
  })
})

describe('Subscript', function () {
  it('should work properly', function () {
    render(`
~abc~
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Subscript","c":[{"t":"Str","c":"abc"}]}]}]})
  })
})

describe('Superscript', function () {
  it('should work properly', function () {
    render(`
^abc^
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Superscript","c":[{"t":"Str","c":"abc"}]}]}]})
  })
})

describe('LineBreak', function () {
  it('should work properly', function () {
    render('abc  \n123').should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Str","c":"abc"},{"t":"LineBreak"},{"t":"Str","c":"123"}]}]})
  })
  it('should not work without two spaces', function () {
    render('abc\n123').should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Str","c":"abc"},{"t":"SoftBreak"},{"t":"Str","c":"123"}]}]})
  })
  it('should work without two spaces if breaks option', function () {
    render('abc\n123', {
      breaks: true
    }).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Str","c":"abc"},{"t":"LineBreak"},{"t":"Str","c":"123"}]}]})
  })
})

describe('HorizontalRule', function () {
  it('should work properly', function () {
    render(`
---
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"HorizontalRule"}]})
  })
})

describe('Table', function () {
  it('should work properly', function () {
    render(`
| a | b | c |
|---|:-:|--:|
| 1 | 2 | 3 |
| 4 | 5 | 6 |
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Table","c":[["",[],[]],[null,[]],[[{"t":"AlignDefault"},{"t":"ColWidthDefault"}],[{"t":"AlignCenter"},{"t":"ColWidthDefault"}],[{"t":"AlignRight"},{"t":"ColWidthDefault"}]],[["",[],[]],[[["",[],[]],[[["",[],[]],{"t":"AlignDefault"},1,1,[{"t":"Plain","c":[{"t":"Str","c":"a"}]}]],[["",[],[]],{"t":"AlignDefault"},1,1,[{"t":"Plain","c":[{"t":"Str","c":"b"}]}]],[["",[],[]],{"t":"AlignDefault"},1,1,[{"t":"Plain","c":[{"t":"Str","c":"c"}]}]]]]]],[[["",[],[]],0,[],[[["",[],[]],[[["",[],[]],{"t":"AlignDefault"},1,1,[{"t":"Plain","c":[{"t":"Str","c":"1"}]}]],[["",[],[]],{"t":"AlignDefault"},1,1,[{"t":"Plain","c":[{"t":"Str","c":"2"}]}]],[["",[],[]],{"t":"AlignDefault"},1,1,[{"t":"Plain","c":[{"t":"Str","c":"3"}]}]]]],[["",[],[]],[[["",[],[]],{"t":"AlignDefault"},1,1,[{"t":"Plain","c":[{"t":"Str","c":"4"}]}]],[["",[],[]],{"t":"AlignDefault"},1,1,[{"t":"Plain","c":[{"t":"Str","c":"5"}]}]],[["",[],[]],{"t":"AlignDefault"},1,1,[{"t":"Plain","c":[{"t":"Str","c":"6"}]}]]]]]]],[["",[],[]],[]]]}]})
  })
})

describe('DefinitionList', function () {
  it('should work properly', function () {
    render(`
abc
:  123
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"DefinitionList","c":[[[{"t":"Str","c":"abc"}],[[{"t":"Plain","c":[{"t":"Str","c":"123"}]}]]]]}]})
  })
  it('should work with multiple defintions', function () {
    render(`
abc
:  123
:  456
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"DefinitionList","c":[[[{"t":"Str","c":"abc"}],[[{"t":"Plain","c":[{"t":"Str","c":"123"}]}],[{"t":"Plain","c":[{"t":"Str","c":"456"}]}]]]]}]})
  })
  it('should work with multiple terms', function () {
    render(`
abc

:  123

efg

:  456

:  789
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"DefinitionList","c":[[[{"t":"Str","c":"abc"}],[[{"t":"Para","c":[{"t":"Str","c":"123"}]}]]],[[{"t":"Str","c":"efg"}],[[{"t":"Para","c":[{"t":"Str","c":"456"}]}],[{"t":"Para","c":[{"t":"Str","c":"789"}]}]]]]}]})
  })
})

describe('Abbrevation', function () {
  it('should be skipped', function () {
    render(`
abc.

*[abc]: 123
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Str","c":"abc."}]}]})
  })
})

describe('RawInline', function () {
  it('should work properly', function () {
    render(`
<b>abc</b>
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"RawInline","c":["html","<b>"]},{"t":"Str","c":"abc"},{"t":"RawInline","c":["html","</b>"]}]}]})
  })
})

describe('RawBlock', function () {
  it('should work properly', function () {
    render(`
<p>
abc
</p>
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"RawBlock","c":["html","<p>\nabc\n</p>"]}]})
  })
})

describe('InlineMath', function () {
  it('should work properly', function () {
    render(`
$abc$
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Math","c":[{"t":"InlineMath"},"abc"]}]}]})
  })
})

describe('DisplayMath', function () {
  it('should work properly', function () {
    render(`
$$abc$$
    `).should.eql({"pandoc-api-version":[1,23],"meta":{},"blocks":[{"t":"Para","c":[{"t":"Math","c":[{"t":"DisplayMath"},"abc"]}]}]})
  })
})

describe('Markdown samples', function () {
  it('should work properly #1', function () {
    render(fs.readFileSync(path.join(__dirname, '/sample1.md'), 'utf-8')).should.eql(require('./sample1.json'))
  })
  it('should work properly #2', function () {
    render(fs.readFileSync(path.join(__dirname, '/sample2.md'), 'utf-8')).should.eql(require('./sample2.json'))
  })
})
