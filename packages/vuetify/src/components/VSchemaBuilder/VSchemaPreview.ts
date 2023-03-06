import './VSchemaBuilder.scss'

// Extensions
import VSheet from '../VSheet/VSheet'
import VSchemaRenderer from '../VSchemaRenderer/VSchemaRenderer'

// Utils
import { DefaultScreenSizeDictionary, ScreenSize, ScreenSizeProperties } from './screenSizes'

// Types
import Vue, { PropType, VNode } from 'vue'
import { AsyncComponentFactory } from 'vue/types/options'

/* @vue/component */
export default Vue.extend({
  name: 'v-schema-preview',
  props: {
    schemasDictionary: {
      type: Object as PropType<{[key: string]: AsyncComponentFactory }>,
      default: null,
    },
    value: {
      type: Object as PropType<{[key: string]: any}>,
      default: null,
    },
    screenSize: {
      type: String as PropType<ScreenSize>,
      default: ScreenSize.Auto,
    },
    screenSizeDictionary: {
      type: Object as PropType<{[key: string]: ScreenSizeProperties }>,
      default: () => (DefaultScreenSizeDictionary),
    },
  },
  data () {
    return {
      internalValue: {},
    }
  },

  methods: {
    genPreviewScreenContent (): VNode[] {
      return [
        this.$createElement(
          VSheet,
          {
            staticClass: this.screenSizeDictionary[this.screenSize].staticClass,
            props: {
              ...(this.screenSizeDictionary[this.screenSize]),
              elevation: 15,
              tile: true,
            },
          },
          [
            this.$createElement(VSchemaRenderer,
              {
                props: {
                  schema: this.value,
                },
              }
            ),
          ]
        ),
      ]
    },
    genPreviewFrame (content: VNode[]): VNode {
      return this.$createElement(
        'div',
        {
          staticClass: 'v-schema-builder-preview d-flex flex-column flex-grow-1 pa-5 overflow-auto',
          style: {
            background: 'repeating-linear-gradient(45deg, darkgrey, darkgrey 6px, grey 6px, grey 12px)',
          },
        },
        content
      )
    },
  },

  render (h) {
    return this.genPreviewFrame(this.genPreviewScreenContent())
  },
})
