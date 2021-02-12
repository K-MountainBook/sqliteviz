import CM from 'codemirror'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/sql-hint.js'
import store from '@/store'
import { debounce } from 'debounce'

export function getHints (cm, options) {
  const token = cm.getTokenAt(cm.getCursor()).string.toUpperCase()
  const result = CM.hint.sql(cm, options)
  // Don't show the hint if there is only one option
  // and the token is already completed with this option
  if (result.list.length === 1 && result.list[0].text.toUpperCase() === token) {
    result.list = []
  }
  return result
}

const hintOptions = {
  get tables () {
    const tables = {}
    if (store.state.schema) {
      store.state.schema.forEach(table => {
        tables[table.name] = table.columns.map(column => column.name)
      })
    }
    return tables
  },
  completeSingle: false,
  completeOnSingleClick: true,
  alignWithWord: false
}

export default {
  show: debounce(function (editor) {
    // Don't show autocomplete after a space or semicolon or in string literals
    const token = editor.getTokenAt(editor.getCursor())
    const ch = token.string.slice(-1)
    const tokenType = token.type
    if (tokenType === 'string' || !ch || ch === ' ' || ch === ';') {
      return
    }

    CM.showHint(editor, getHints, hintOptions)
  }, 400)
}