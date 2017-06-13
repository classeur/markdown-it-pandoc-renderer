;(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory()
  } else {
    root.markdownitPandocRenderer = factory()
  }
})(this, function () {
  function Node (type, c) {
    this.t = type
    this.c = c || []
  }

  function getAttr (token, name) {
    var result = ''
    if (token.attrs) {
      token.attrs.some(function (attr) {
        if (attr[0] === name) {
          result = attr[1]
          return true
        }
      })
    }
    return result
  }

  function strip (str) {
    // Strip str from unprintable characters
    // eslint-disable-next-line no-control-regex
    return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\uFFFD]/g, '').replace(/\n+$/, '')
  }

  function renderTokens (tokens, options, notes) {
    var i = 0
    options = options || {}
    notes = notes || []
    // Get rid of unnecessary types
    tokens = tokens.filter(function (token) {
      return token.type !== 'footnote_anchor'
    })

    function renderLevel (level, until) {
      var result = []
      var token
      var node
      // eslint-disable-next-line no-unmodified-loop-condition
      while (tokens[i] && tokens[i].level >= level && (!until || tokens[i].level > level || tokens[i].type !== until)) {
        token = tokens[i++]
        node = undefined
        switch (token.type) {
          case 'heading_open':
            node = new Node('Header', [
              parseInt(token.tag.slice(1), 10), // level
              [getAttr(token, 'id'), [], []] // id, classes, attrs
            ])
            node.c.push(renderLevel(tokens[i].level, 'heading_close'))
            i++ // heading_close
            break
          case 'paragraph_open':
            node = new Node(token.hidden ? 'Plain' : 'Para', renderLevel(tokens[i].level, 'paragraph_close'))
            i++ // paragraph_close
            break
          case 'blockquote_open':
            node = new Node('BlockQuote', renderLevel(tokens[i].level, 'blockquote_close'))
            i++ // blockquote_close
            break
          case 'em_open':
            node = new Node('Emph', renderLevel(tokens[i].level, 'em_close'))
            i++ // em_close
            break
          case 'strong_open':
            node = new Node('Strong', renderLevel(tokens[i].level, 'strong_close'))
            i++ // strong_close
            break
          case 's_open':
            node = new Node('Strikeout', renderLevel(tokens[i].level, 's_close'))
            i++ // s_close
            break
          case 'sup_open':
            node = new Node('Superscript', renderLevel(tokens[i].level, 'sup_close'))
            i++ // sup_close
            break
          case 'sub_open':
            node = new Node('Subscript', renderLevel(tokens[i].level, 'sub_close'))
            i++ // sub_close
            break
          case 'bullet_list_open':
            node = new Node('BulletList', renderLevel(tokens[i].level, 'bullet_list_close'))
            i++ // bullet_list_close
            break
          case 'ordered_list_open':
            node = new Node('OrderedList', [
              [getAttr(token, 'start') || 1, new Node('Decimal'), new Node('Period')] // Int, ListNumberStyle, ListNumberDelim
            ])
            node.c.push(renderLevel(tokens[i].level, 'ordered_list_close'))
            i++ // ordered_list_close
            break
          case 'list_item_open':
            node = renderLevel(tokens[i].level, 'list_item_close')
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
                } else if (style === 'text-align:left') {
                  align = new Node('AlignLeft')
                } else if (style === 'text-align:right') {
                  align = new Node('AlignRight')
                }
                aligns.push(align)
                i++ // th_open
                headers.push([new Node('Plain', renderLevel(tokens[i].level, 'th_close'))])
              }
            }
            i++ // thead_close
            for (; tokens[i].type !== 'tbody_close'; i++) {
              var row = []
              for (; tokens[i].type !== 'tr_close'; i++) {
                if (tokens[i].type === 'td_open') {
                  i++ // td_open
                  row.push([new Node('Plain', renderLevel(tokens[i].level, 'td_close'))])
                }
              }
              rows.push(row)
            }
            i++ // tbody_close
            node = new Node('Table', [
              [], // caption
              aligns,
              aligns.map(function () {
                return 0
              }), // widths,
              headers,
              rows
            ])
            i++ // table_close
            break
          case 'dl_open':
            rows = []
            while (tokens[i].type !== 'dl_close') {
              i++ // dt_open
              var term = renderLevel(tokens[i].level, 'dt_close')
              var definitions = []
              i++ // dt_close
              for (; tokens[i].type !== 'dt_open' && tokens[i].type !== 'dl_close'; i++) {
                if (tokens[i].type === 'dd_open') {
                  i++ // dd_open
                  definitions.push(renderLevel(tokens[i].level, 'dd_close'))
                }
              }
              rows.push([term, definitions])
            }
            node = new Node('DefinitionList', rows)
            i++ // dl_close
            break
          case 'link_open':
            node = new Node('Link', [
              ['', [], []], // id, classes, attrs
              renderLevel(tokens[i].level, 'link_close')
            ])
            node.c.push([getAttr(token, 'href'), getAttr(token, 'title')])
            i++ // link_close
            break
          case 'image':
            var src = getAttr(token, 'src')
            if (src) {
              node = new Node('Image', [
                ['', [], []], // id, classes, attrs
                renderTokens(token.children, options, notes)
              ])
              node.c.push([src, 'fig:' + getAttr(token, 'title')])
            }
            break
          case 'footnote_ref':
            node = new Node('Note')
            node.c = token.meta.id
            notes.push(node)
            break
          case 'footnote_open':
            var c = renderLevel(tokens[i].level, 'footnote_close')
            i++ // footnote_close
            notes.forEach(function (note) {
              if (note.c === token.meta.id) {
                note.c = c
              }
            })
            break
          case 'inline':
            result = result.concat(renderTokens(token.children, options, notes))
            break
          case 'inline_math':
            node = new Node('Math', [
              new Node('InlineMath'),
              strip(token.content)
            ])
            break
          case 'display_math':
          case 'math':
            node = new Node('Math', [
              new Node('DisplayMath'),
              strip(token.content)
            ])
            break
          case 'code_inline':
            node = new Node('Code', [
              ['', [], []], // id, classes, attrs
              strip(token.content)
            ])
            break
          case 'fence':
          case 'code_block':
            node = new Node('CodeBlock', [
              ['', token.info ? [token.info] : [], []], // id, classes, attrs
              strip(token.content)
            ])
            break
          case 'html_block':
            node = new Node('RawBlock', [
              'html',
              strip(token.content)
            ])
            break
          case 'html_inline':
            node = new Node('RawInline', [
              'html',
              strip(token.content)
            ])
            break
          case 'softbreak':
            result.push(new Node(options.breaks ? 'LineBreak' : 'SoftBreak'))
            break
          case 'hardbreak':
            result.push(new Node('LineBreak'))
            break
          case 'hr':
            result.push(new Node('HorizontalRule'))
            break
          case 'text':
          case 'abbr_open':
          case 'abbr_close':
          case 'footnote_block_open':
          case 'footnote_block_close':
          default:
            token.content && strip(token.content).split(/\s+/).forEach(function (str, j) {
              if (j === 0) {
                var lastNode = result.pop()
                if (lastNode) {
                  if (lastNode.t === 'Str') {
                    str = lastNode.c + str
                  } else {
                    result.push(lastNode)
                  }
                }
              } else {
                result.push(new Node('Space'))
              }
              if (str) {
                result.push(new Node('Str', str))
              }
            })
            break
        }
        node && result.push(node)
      }
      return result
    }

    return renderLevel(0)
  }

  return function (tokens, options) {
    return [{
      unMeta: {}
    }, renderTokens(tokens, options)]
  }
})
