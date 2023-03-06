import { VNode } from 'vue'

export function syntaxHighlightJsonString (h: Function, json: string): VNode[] {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const parts = json.split(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/) ?? []
  console.log(parts)
  return h(
    'pre',
    {
      staticClass: 'v-schema-builder-code',
    },
    parts.map(match => {
      let cls = 'number'
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key'
        } else {
          cls = 'string'
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean'
      } else if (/null/.test(match)) {
        cls = 'null'
      }

      return h('span', {
        staticClass: cls,
      }, match)
    })
  )
}
