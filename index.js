require('clunderscore')
var renderer = require('./lib/renderer')
var md = require('markdown-it')()
md.set({
	html: true,
	breaks: true,
	linkify: true,
	typographer: true,
	langPrefix: 'language-'
})

function render(str) {
	return renderer.render(md.parse(str, {}))
}

exports.render = render
exports.renderer = renderer
