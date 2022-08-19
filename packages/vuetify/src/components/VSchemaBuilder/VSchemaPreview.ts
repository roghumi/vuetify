
// Extensions
import VSystemBar from '../VSystemBar/VSystemBar'
import VSpacer from '../VGrid/VSpacer'
import VDivider from '../VDivider/VDivider'
import VSheet from '../VSheet/VSheet'
import VSchemaEditor from '../VSchemaEditor/VSchemaEditor'
import VSchemaRenderer from '../VSchemaRenderer/VSchemaRenderer'
import DynamicContext from './../../mixins/renderer/DynamicContext'

// Utils
import { genTooltipButton } from '../VSchemaEditor/helpers'
import { DefaultScreenSizeDictionary, ScreenSize, ScreenSizeProperties } from './screenSizes'

// Types
import Vue, { PropType, VNode } from 'vue'
import { SchemaDefinition } from 'types/services/renderer'
import { mergeDeep } from '../../util/helpers'

/* @vue/component */
export default Vue.extend({
  name: 'v-schema-preview',
  props: {
    schemasDictionary: {
      type: Object as PropType<{[key: string]: SchemaDefinition }>,
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
        VSheet,
        {
          staticClass: 'd-flex flex-column flex-grow-1 pa-5 overflow-auto',
          style: {
            background: 'repeating-linear-gradient(45deg, darkgrey, darkgrey 6px, grey 6px, grey 12px)',
          },
          props: {
            width: '100%',
            height: '100%',
            maxWith: '100%',
            maxHeight: '100%',
            color: 'grey lighten-2',
            tile: true,
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
