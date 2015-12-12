/* global describe, it */
/* eslint quotes:0, key-spacing:0, comma-spacing:0 */
require('should')
var renderer = require('../markdown-it-pandoc-renderer')
var md = require('markdown-it')()
var markdownitAbbr = require('markdown-it-abbr')
var markdownitDeflist = require('markdown-it-deflist')
var markdownitFootnote = require('markdown-it-footnote')
var markdownitSub = require('markdown-it-sub')
var markdownitSup = require('markdown-it-sup')
var markdownitMathjax = require('markdown-it-mathjax')

md.set({
	html: true,
	breaks: true,
	linkify: true,
	typographer: true,
	langPrefix: 'language-'
})

md.use(markdownitAbbr)
md.use(markdownitDeflist)
md.use(markdownitFootnote)
md.use(markdownitSub)
md.use(markdownitSup)
md.use(markdownitMathjax)

function render(str) {
	return renderer(md.parse(str, {}))
}

describe('Header', function() {
	it('should work properly', function() {
		render(`
# abc
		`).should.eql([{"unMeta":{}},[{"t":"Header","c":[1,["",[],[]],[{"t":"Str","c":"abc"}]]}]])
	})
	it('should work with setext', function() {
		render(`
abc
---
		`).should.eql([{"unMeta":{}},[{"t":"Header","c":[2,["",[],[]],[{"t":"Str","c":"abc"}]]}]])
	})
})

describe('Para', function() {
	it('should work properly', function() {
		render(`
abc
		`).should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Str","c":"abc"}]}]])
	})
	it('should work not contain control characters', function() {
		render('a\x00\x01\tb\x0B  \nc\x1F\x7F').should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Str","c":"a"},{"t":"Space","c":[]},{"t":"Str","c":"b"},{"t":"LineBreak","c":[]},{"t":"Str","c":"c"}]}]])
	})
})

describe('BlockQuote', function() {
	it('should work properly', function() {
		render(`
> abc
		`).should.eql([{"unMeta":{}},[{"t":"BlockQuote","c":[{"t":"Para","c":[{"t":"Str","c":"abc"}]}]}]])
	})
})

describe('BulletList', function() {
	it('should work properly', function() {
		render(`
- a
- b
- c
		`).should.eql([{"unMeta":{}},[{"t":"BulletList","c":[[{"t":"Plain","c":[{"t":"Str","c":"a"}]}],[{"t":"Plain","c":[{"t":"Str","c":"b"}]}],[{"t":"Plain","c":[{"t":"Str","c":"c"}]}]]}]])
	})
})

describe('OrderedList', function() {
	it('should work properly', function() {
		render(`
1. a
2. b
3. c
		`).should.eql([{"unMeta":{}},[{"t":"OrderedList","c":[[1,{"t":"Decimal","c":[]},{"t":"Period","c":[]}],[[{"t":"Plain","c":[{"t":"Str","c":"a"}]}],[{"t":"Plain","c":[{"t":"Str","c":"b"}]}],[{"t":"Plain","c":[{"t":"Str","c":"c"}]}]]]}]])
	})
	it('should work not starting from 1', function() {
		render(`
2. a
3. b
4. c
		`).should.eql([{"unMeta":{}},[{"t":"OrderedList","c":[[2,{"t":"Decimal","c":[]},{"t":"Period","c":[]}],[[{"t":"Plain","c":[{"t":"Str","c":"a"}]}],[{"t":"Plain","c":[{"t":"Str","c":"b"}]}],[{"t":"Plain","c":[{"t":"Str","c":"c"}]}]]]}]])
	})
})

describe('CodeBlock', function() {
	it('should work properly', function() {
		render(`
	123
		abc
		`).should.eql([{"unMeta":{}},[{"t":"CodeBlock","c":[["",[],[]],"123\n\tabc\n"]}]])
	})
	it('should work from fence', function() {
		render(`
\`\`\`
123
	abc
\`\`\`
		`).should.eql([{"unMeta":{}},[{"t":"CodeBlock","c":[["",[],[]],"123\n\tabc\n"]}]])
	})
})

describe('Link', function() {
	it('should work properly', function() {
		render(`
[abc](http://123)
		`).should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Link","c":[[{"t":"Str","c":"abc"}],["http://123",""]]}]}]])
	})
	it('should work with alt', function() {
		render(`
[abc](http://123 "alt")
		`).should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Link","c":[[{"t":"Str","c":"abc"}],["http://123","alt"]]}]}]])
	})
})

describe('Image', function() {
	it('should work properly', function() {
		render(`
![abc](http://123)
		`).should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Image","c":[[{"t":"Str","c":"abc"}],["http://123","fig:"]]}]}]])
	})
	it('should work with "alt"', function() {
		render(`
![abc](http://123 "alt")
		`).should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Image","c":[[{"t":"Str","c":"abc"}],["http://123","fig:alt"]]}]}]])
	})
})

describe('Note', function() {
	it('should work properly', function() {
		render(`
Abc.[^1]

[^1]: xyz.
		`).should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Str","c":"Abc."},{"t":"Note","c":[{"t":"Para","c":[{"t":"Str","c":"xyz."}]}]}]}]])
	})
	it('should work inline', function() {
		render(`
Abc.^[xyz]
		`).should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Str","c":"Abc."},{"t":"Note","c":[{"t":"Para","c":[{"t":"Str","c":"xyz"}]}]}]}]])
	})
})

describe('Emph', function() {
	it('should work properly', function() {
		render(`
*abc*
		`).should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Emph","c":[{"t":"Str","c":"abc"}]}]}]])
	})
})

describe('Strong', function() {
	it('should work properly', function() {
		render(`
**abc**
		`).should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Strong","c":[{"t":"Str","c":"abc"}]}]}]])
	})
})

describe('Strikeout', function() {
	it('should work properly', function() {
		render(`
~~abc~~
		`).should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Strikeout","c":[{"t":"Str","c":"abc"}]}]}]])
	})
})

describe('Code', function() {
	it('should work properly', function() {
		render(`
\`abc\`
		`).should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Code","c":[["",[],[]],"abc"]}]}]])
	})
})

describe('Subscript', function() {
	it('should work properly', function() {
		render(`
~abc~
		`).should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Subscript","c":[{"t":"Str","c":"abc"}]}]}]])
	})
})

describe('Superscript', function() {
	it('should work properly', function() {
		render(`
^abc^
		`).should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Superscript","c":[{"t":"Str","c":"abc"}]}]}]])
	})
})

describe('LineBreak', function() {
	it('should work properly', function() {
		render('abc  \n123').should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Str","c":"abc"},{"t":"LineBreak","c":[]},{"t":"Str","c":"123"}]}]])
	})
})

describe('HorizontalRule', function() {
	it('should work properly', function() {
		render(`
---
		`).should.eql([{"unMeta":{}},[{"t":"HorizontalRule","c":[]}]])
	})
})

describe('Table', function() {
	it('should work properly', function() {
		render(`
| a | b | c |
|---|:-:|--:|
| 1 | 2 | 3 |
| 4 | 5 | 6 |
		`).should.eql([{"unMeta":{}},[{"t":"Table","c":[[],[{"t":"AlignDefault","c":[]},{"t":"AlignCenter","c":[]},{"t":"AlignRight","c":[]}],[0.0,0.0,0.0],[[{"t":"Plain","c":[{"t":"Str","c":"a"}]}],[{"t":"Plain","c":[{"t":"Str","c":"b"}]}],[{"t":"Plain","c":[{"t":"Str","c":"c"}]}]],[[[{"t":"Plain","c":[{"t":"Str","c":"1"}]}],[{"t":"Plain","c":[{"t":"Str","c":"2"}]}],[{"t":"Plain","c":[{"t":"Str","c":"3"}]}]],[[{"t":"Plain","c":[{"t":"Str","c":"4"}]}],[{"t":"Plain","c":[{"t":"Str","c":"5"}]}],[{"t":"Plain","c":[{"t":"Str","c":"6"}]}]]]]}]])
	})
})

describe('DefinitionList', function() {
	it('should work properly', function() {
		render(`
abc
:  123
		`).should.eql([{"unMeta":{}},[{"t":"DefinitionList","c":[[[{"t":"Str","c":"abc"}],[[{"t":"Plain","c":[{"t":"Str","c":"123"}]}]]]]}]])
	})
	it('should work with multiple defintions', function() {
		render(`
abc
:  123
:  456
		`).should.eql([{"unMeta":{}},[{"t":"DefinitionList","c":[[[{"t":"Str","c":"abc"}],[[{"t":"Plain","c":[{"t":"Str","c":"123"}]}],[{"t":"Plain","c":[{"t":"Str","c":"456"}]}]]]]}]])
	})
	it('should work with multiple terms', function() {
		render(`
abc

:  123

efg

:  456

:  789
		`).should.eql([{"unMeta":{}},[{"t":"DefinitionList","c":[[[{"t":"Str","c":"abc"}],[[{"t":"Para","c":[{"t":"Str","c":"123"}]}]]],[[{"t":"Str","c":"efg"}],[[{"t":"Para","c":[{"t":"Str","c":"456"}]}],[{"t":"Para","c":[{"t":"Str","c":"789"}]}]]]]}]])
	})
})

describe('Abbrevation', function() {
	it('should be skipped', function() {
		render(`
abc.

*[abc]: 123
		`).should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Str","c":"abc."}]}]])
	})
})

describe('RawInline', function() {
	it('should work properly', function() {
		render(`
<b>abc</b>
		`).should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"RawInline","c":["html","<b>"]},{"t":"Str","c":"abc"},{"t":"RawInline","c":["html","</b>"]}]}]])
	})
})

describe('RawBlock', function() {
	it('should work properly', function() {
		render(`
<p>
abc
</p>
		`).should.eql([{"unMeta":{}},[{"t":"RawBlock","c":["html","<p>\nabc\n</p>\n"]}]])
	})
})

describe('InlineMath', function() {
	it('should work properly', function() {
		render(`
$abc$
		`).should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Math","c":[{"t":"InlineMath","c":[]},"abc"]}]}]])
	})
})

describe('DisplayMath', function() {
	it('should work properly', function() {
		render(`
$$abc$$
		`).should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Math","c":[{"t":"DisplayMath","c":[]},"abc"]}]}]])
	})
	it('should work with sections', function() {
		render(`
\\begin{section}1 *2* 3\\end{section}
		`).should.eql([{"unMeta":{}},[{"t":"Para","c":[{"t":"Math","c":[{"t":"DisplayMath","c":[]},"\\begin{section}1 *2* 3\\end{section}"]}]}]])
	})
})
