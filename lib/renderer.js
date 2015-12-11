function Node(type, c) {
	this.t = type
	this.c = c || []
}

function getAttr(token, name) {
	var result = ''
	if (token.attrs) {
		token.attrs.cl_some(function(attr) {
			if (attr[0] === name) {
				result = attr[1]
				return true
			}
		})
	}
	return result
}

function renderTokens(tokens) {
	var i = 0

	function renderLevel(level) {
		var result = [],
			token,
			node
		while (tokens[i] && tokens[i].level >= level) {
			token = tokens[i++]
			node = undefined
			switch (token.type) {
				case 'heading_open':
					node = new Node('Header', [
						parseInt(token.tag.slice(1), 10),  // level
						['', [], []], // id, classes, attrs
					])
					node.c.push(renderLevel(level + 1))
					i++ // heading_close
					break
				case 'paragraph_open':
					node = new Node(token.hidden ? 'Plain' : 'Para', renderLevel(level + 1))
					i++ // paragraph_close
					break
				case 'blockquote_open':
					node = new Node('BlockQuote', renderLevel(level + 1))
					i++ // blockquote_close
					break
				case 'em_open':
					node = new Node('Emph', renderLevel(level + 1))
					i++ // em_close
					break
				case 'strong_open':
					node = new Node('Strong', renderLevel(level + 1))
					i++ // strong_close
					break
				case 's_open':
					node = new Node('Strikeout', renderLevel(level + 1))
					i++ // s_close
					break
				case 'bullet_list_open':
					node = new Node('BulletList', renderLevel(level + 1))
					i++ // bullet_list_close
					break
				case 'ordered_list_open':
					node = new Node('OrderedList', [
						[getAttr(token, 'start') || 1, new Node('Decimal'), new Node('Period')], // Int, ListNumberStyle, ListNumberDelim
					])
					node.c.push(renderLevel(level + 1))
					i++ // ordered_list_close
					break
				case 'list_item_open':
					node = renderLevel(level + 1)
					i++ // list_item_close
					break
				case 'table_open':
					var aligns = []
					var headers = []
					var rows = []
					for (; tokens[i].type !== 'thead_close'; i++) {
						if (tokens[i].type === 'th_open') {
							var align = new Node('AlignDefault')
							var style = getAttr(tokens[i], 'style')
							if (style === 'text-align:center') {
								align = new Node('AlignCenter')
							} else if (style === 'text-align:right') {
								align = new Node('AlignRight')
							}
							aligns.push(align)
							i++ // th_open
							headers.push([new Node('Plain', renderLevel(tokens[i].level))])
						}
					}
					i++ // thead_close
					while (tokens[i].type !== 'tbody_close') {
						var row = []
						for (; tokens[i].type !== 'tr_close'; i++) {
							if (tokens[i].type === 'td_open') {
								i++ // td_open
								row.push([new Node('Plain', renderLevel(tokens[i].level))])
							}
						}
						i++ // tr_close
						rows.push(row)
					}
					i++ // tbody_close
					node = new Node('Table', [
						[], // caption
						aligns,
						aligns.cl_map(function() {
							return 0
						}), // widths,
						headers,
						rows
					])
					i++ // table_close
					break
				case 'link_open':
					node = new Node('Link', [renderLevel(level + 1)])
					node.c.push([getAttr(token, 'href'), getAttr(token, 'title')])
					i++ // link_close
					break
				case 'image':
					node = new Node('Image', [renderTokens(token.children)])
					node.c.push([getAttr(token, 'src'), 'fig:' + getAttr(token, 'title')])
					i++ // link_close
					break
				case 'inline':
					result = result.concat(renderTokens(token.children))
					break
				case 'text':
					token.content.split(/\s+/).cl_each(function(str, j) {
						if (j > 0) {
							result.push(new Node('Space'))
						}
						result.push(new Node('Str', str))
					})
					break
				case 'code_inline':
					node = new Node('Code', [
						['', [], []], // id, classes, attrs
						token.content
					])
					break
				case 'fence':
				case 'code_block':
					node = new Node('CodeBlock', [
						['', [], []], // id, classes, attrs
						token.content
					])
					break
				case 'html_block':
					node = new Node('RawBlock', [
						'html',
						token.content
					])
					break
				case 'html_inline':
					node = new Node('RawInline', [
						'html',
						token.content
					])
					break
				case 'softbreak':
					result.push(new Node('Space'))
					break
				case 'hardbreak':
					result.push(new Node('LineBreak'))
					break
				case 'hr':
					result.push(new Node('HorizontalRule'))
					break
				default:
					node = token
			}
			node && result.push(node)
		}
		return result
	}

	return renderLevel(0)
}

exports.render = function(tokens) {
	return [{
		unMeta: {}
	}, renderTokens(tokens)]
}
