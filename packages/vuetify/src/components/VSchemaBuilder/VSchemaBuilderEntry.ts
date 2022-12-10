
// Extensions
import VSchemaEditorEntry from '../VSchemaEditor/VSchemaEditorEntry'

// Utils

// Types

/* @vue/component */
export default VSchemaEditorEntry.extend({
  render (h) {
    return h(
      'div',
      {},
      [
        this.genEntryOptionsMenu(),
        this.genAddSchemaDialog(),
        this.itemMeta.ref?.tag,
      ]
    )
  },
})
