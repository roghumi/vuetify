// Extensions
import VDivider from '../VDivider/VDivider'
import VSheet from '../VSheet/VSheet'

// Types
import { PropType, VNode } from 'vue'

// Helper functions
import {
  getAccumulatedArrayValues,
  DragRectHelper,
  getUnifiedDragWidth,
  getUnifiedDragPercent,
  getRectData,
} from './helpers'

/* @vue/component */
export default VSheet.extend({
  props: {
    horizontal: Boolean,
    dontGrow: Boolean,
    value: {
      type: Array as PropType<Array<number>>,
      default: () => ([0.5]),
    },
    sheetGrabWidth: {
      type: Number,
      default: 10,
    },
    minSheetWidth: {
      type: Number,
      default: 40,
    },
    verticalDragCursor: {
      type: String,
      default: 'col-resize',
    },
    horizontalDragCursor: {
      type: String,
      default: 'row-resize',
    },
  },
  data () {
    return {
      internalValue: (this.value ?? []).map(v => v),
      isDragging: false,
      dragStartRect: null as DragRectHelper | null,
      grabbedDividerIndex: -1,
    }
  },

  computed: {
    sheets (): number {
      return this.internalValue.length + 1
    },
    valuesAccumulated (): number[] {
      return getAccumulatedArrayValues(this.internalValue)
    },
    sheetIndexes (): Array<number> {
      return [...Array(this.sheets + Math.ceil(this.sheets / 2)).keys()]
    },
    sheetWidths (): Array<number> {
      return this.sheetIndexes.map(i => {
        const index = i + 1
        if (index % 2 !== 0) {
          const key = Math.floor(index / 2) + 1
          if (this.internalValue && this.internalValue[key - 1]) {
            return this.internalValue[key - 1]
          }
          return 1 - this.internalValue.slice(0, key - 1).reduce((a, c) => a + c, 0)
        }
        return 0
      })
    },
  },

  methods: {
    genDivider (index: number): VNode|VNode[] {
      const dividerIndex = index / 2
      return this.$scopedSlots['divider' + dividerIndex]?.({
        dividerIndex,
        horizontal: this.horizontal,
        cursor: this.horizontal ? this.horizontalDragCursor : this.verticalDragCursor,
        class: this.horizontal ? 'py-1' : 'px-1',
      }) ??
      this.$createElement(
        VDivider,
        {
          staticClass: this.horizontal ? 'py-1' : 'px-1',
          style: {
            cursor: this.horizontal ? this.horizontalDragCursor : this.verticalDragCursor,
          },
          props: {
            vertical: !this.horizontal,
          },
        },
      )
    },
    genSheetContentAtIndex (index: number): VNode {
      const sheetIndex = index / 2
      return this.$createElement(
        'div',
        {
          style: {
            [this.horizontal ? 'height' : 'width']: Math.floor(this.sheetWidths[index] * 100) + '%',
          },
        },
        this.$scopedSlots['sheet' + sheetIndex]?.({ index: sheetIndex }) ?? ''
      )
    },
    genNodeAtIndex (index: number): VNode|VNode[] {
      if (index % 2 === 0) {
        return this.genSheetContentAtIndex(index)
      } else {
        return this.genDivider(index)
      }
    },
    getNearestDividerIndex (drag: DragRectHelper): number {
      return this.valuesAccumulated.map(v => v * getUnifiedDragWidth(this.horizontal, drag)).findIndex(v => {
        if (Math.abs(v - (this.horizontal ? drag.localY : drag.localX)) <= this.sheetGrabWidth) {
          return true
        }
        return false
      })
    },
    onMouseDown (e: MouseEvent | TouchEvent) {
      e.preventDefault()
      const drag = getRectData(e)
      if (drag) {
        const dividerIndex = this.getNearestDividerIndex(drag)
        if (dividerIndex >= 0) {
          this.isDragging = true
          this.dragStartRect = drag
          this.grabbedDividerIndex = dividerIndex
        }
        this.onDragMove(e)
      }
    },
    onMouseUp (e: MouseEvent | TouchEvent) {
      e.preventDefault()
      if (this.isDragging) {
        this.isDragging = false
      }
    },
    onDragMove (e: MouseEvent | TouchEvent) {
      const drag = getRectData(e)
      if (drag) {
        const movePercent = getUnifiedDragPercent(this.horizontal, drag)
        if (this.isDragging && movePercent > 0) {
          const fullDistance = getUnifiedDragWidth(this.horizontal, drag)
          const dragPercent = Math.max(
            this.valuesAccumulated.filter((v, i) => i < this.grabbedDividerIndex)
              .reduce((total, v) => {
                return total - v
              }, movePercent),
            this.minSheetWidth / fullDistance
          )
          const accumulatedAfter = getAccumulatedArrayValues(
            (this.internalValue ?? []).map((v, i) => (i === this.grabbedDividerIndex ? dragPercent : v))
          )
          const lastWindowWith = (1 - accumulatedAfter[this.internalValue.length - 1]) * fullDistance
          if (lastWindowWith > this.minSheetWidth) {
            this.$set(this.internalValue, this.grabbedDividerIndex, dragPercent)
          }
        }
      }
    },
  },

  render (h) {
    const data = {
      class: {
        ...this.classes,
        'd-flex': true,
        'flex-row': !this.horizontal,
        'flex-column': this.horizontal,
        'flex-grow-1': !this.dontGrow,
      },
      style: this.styles,
      on: {
        mousedown: this.onMouseDown,
        mouseup: this.onMouseUp,
        mouseleave: (e: MouseEvent) => {
          this.onMouseUp(e)
        },
        touchstart: this.onMouseDown,
        touchend: this.onMouseUp,
        mousemove: this.onDragMove,
        touchmove: this.onDragMove,
      },
    }
    return h(
      this.tag,
      this.setBackgroundColor(this.color, data),
      [].concat.apply(this.sheetIndexes.map((index: number) => this.genNodeAtIndex(index)))
    )
  },
})
