
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
  name: 'v-draggable-divider',

  data () {
    return {
      isDragging: false,
      valueOnMouseDown: null as number | null,
      valueOnMouseUp: null as number | null,
    }
  },

  methods: {
    isAllowed (value: number) {
      return true
    },
    onMouseDown (e: MouseEvent | TouchEvent) {
      e.preventDefault()

      this.valueOnMouseDown = null
      this.valueOnMouseUp = null
      this.isDragging = true
      this.onDragMove(e)
    },
    onMouseUp (e: MouseEvent | TouchEvent) {
      e.stopPropagation()

      this.isDragging = false
      if (this.valueOnMouseUp !== null && this.isAllowed(this.valueOnMouseUp)) {
        this.$emit('change', this.valueOnMouseUp)
      }
    },
    onDragMove (e: MouseEvent | TouchEvent) {
      e.preventDefault()
    },
  },
  render (h) {
    return h(VDivider, {
      staticClass: 'mx-1',
      props: {
        vertical: true,
      },
      on: {
        mousedown: this.onMouseDown,
        mouseup: this.onMouseUp,
        mouseleave: (e: MouseEvent) => (this.isDragging && this.onMouseUp(e)),
        touchstart: this.onMouseDown,
        touchend: this.onMouseUp,
        mousemove: this.onDragMove,
        touchmove: this.onDragMove,
      },
    })
  },
})
