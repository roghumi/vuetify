
// Extensions
import VTreeview from '../VTreeview/VTreeview'
import VSystemBar from '../VSystemBar/VSystemBar'
import VSpacer from '../VGrid/VSpacer'
import VDivider from '../VDivider/VDivider'
import VSheet from '../VSheet/VSheet'
import VSchemaEditor from '../VSchemaEditor/VSchemaEditor'
import VSchemaBuilderEntry from './VSchemaBuilderEntry'
import VSchemaPreview from './VSchemaPreview'
import VLabel from '../VLabel/VLabel'
import VSplitSheet from '../VSplitSheet/VSplitSheet'

// Utils
import { genTooltipButton, genOptionsMenu, SchemaEditorMenuOptionItem } from '../VSchemaEditor/helpers'
import { DefaultScreenSizeDictionary, ScreenSize, ScreenSizeProperties } from './screenSizes'

// Types
import { PropType, VNode } from 'vue'
import { AsyncComponentFactory } from 'vue/types/options'
import { mergeDeep } from '../../util/helpers'

export enum SchemaBuilderViewMode {
  Full = 'full',
  Preview = 'preview',
  Code = 'code',
  Editor = 'editor'
}

/* @vue/component */
export default VSchemaEditor.extend({
  name: 'v-schema-builder',

  props: {
    label: String,
    schemasDictionary: {
      type: Object as PropType<{[key: string]: AsyncComponentFactory }>,
      default: null,
    },
    screenSizeDictionary: {
      type: Object as PropType<{[key: string]: ScreenSizeProperties }>,
      default: () => (DefaultScreenSizeDictionary),
    },
    value: {
      type: Object as PropType<{[key: string]: any}>,
      default: null,
    },
    valueScreenSize: {
      type: String,
      default: ScreenSize.Auto,
    },
    valueViewMode: {
      type: String,
      default: SchemaBuilderViewMode.Full,
    },
    ariaLabelViewMode: {
      type: String,
      default: '$vuetify.schemaBuilder.ariaLabel.viewMode',
    },
    ariaLabelModeXSmall: {
      type: String,
      default: '$vuetify.schemaBuilder.ariaLabel.xSmall',
    },
    ariaLabelModeSmall: {
      type: String,
      default: '$vuetify.schemaBuilder.ariaLabel.small',
    },
    ariaLabelModeMedium: {
      type: String,
      default: '$vuetify.schemaBuilder.ariaLabel.medium',
    },
    ariaLabelModeLarge: {
      type: String,
      default: '$vuetify.schemaBuilder.ariaLabel.large',
    },
    ariaLabelModeXLarge: {
      type: String,
      default: '$vuetify.schemaBuilder.ariaLabel.xLarge',
    },
    ariaLabelModeAuto: {
      type: String,
      default: '$vuetify.schemaBuilder.ariaLabel.autoFloat',
    },
    ariaLabelModePreview: {
      type: String,
      default: '$vuetify.schemaBuilder.ariaLabel.modePreview',
    },
    ariaLabelModeFull: {
      type: String,
      default: '$vuetify.schemaBuilder.ariaLabel.modeFull',
    },
    ariaLabelModeCode: {
      type: String,
      default: '$vuetify.schemaBuilder.ariaLabel.modeCode',
    },
    ariaLabelModeEditor: {
      type: String,
      default: '$vuetify.schemaBuilder.ariaLabel.modeEditor',
    },
  },
  data () {
    return {
      internalValue: mergeDeep({}, this.value),
      screenSize: this.valueScreenSize,
      viewMode: this.valueViewMode,
      viewModesDictionary: {
        [SchemaBuilderViewMode.Full]: {
          id: SchemaBuilderViewMode.Full,
          title: this.$vuetify.lang.t(this.ariaLabelModeFull),
          icon: 'mdi-brush',
          next: SchemaBuilderViewMode.Preview,
        },
        [SchemaBuilderViewMode.Preview]: {
          id: SchemaBuilderViewMode.Preview,
          title: this.$vuetify.lang.t(this.ariaLabelModePreview),
          icon: 'mdi-eye',
          next: SchemaBuilderViewMode.Editor,
        },
        [SchemaBuilderViewMode.Editor]: {
          id: SchemaBuilderViewMode.Editor,
          title: this.$vuetify.lang.t(this.ariaLabelModeEditor),
          icon: 'mdi-code-braces-box',
          next: SchemaBuilderViewMode.Code,
        },
        [SchemaBuilderViewMode.Code]: {
          id: SchemaBuilderViewMode.Code,
          title: this.$vuetify.lang.t(this.ariaLabelModeCode),
          icon: 'mdi-code-json',
          next: SchemaBuilderViewMode.Full,
        },
      } as { [key: string]: any },
    }
  },

  computed: {
    isSchemaEditorVisible (): boolean {
      return [
        SchemaBuilderViewMode.Full,
        SchemaBuilderViewMode.Editor,
      ].includes(this.viewMode as SchemaBuilderViewMode)
    },
    isPreviewVisible (): boolean {
      return [
        SchemaBuilderViewMode.Full,
        SchemaBuilderViewMode.Preview,
      ].includes(this.viewMode as SchemaBuilderViewMode)
    },
    isCodeEditorVisible (): boolean {
      return [
        SchemaBuilderViewMode.Code,
      ].includes(this.viewMode as SchemaBuilderViewMode)
    },
    builderItems (): any[] {
      const filterredReduce = (flattened: any[], item: any) => {
        if (item.id === 'children') {
          flattened.push(...(item.children?.reduce(filterredReduce, []) ?? []))
        } else if (!isNaN(item.id)) {
          flattened.push({
            ...item,
            children: Array.isArray(item.children)
              ? item.children?.reduce(filterredReduce, []) : item.children,
          })
        }
        return flattened
      }
      return this.items.reduce(filterredReduce, [])
    },
  },

  methods: {
    genTreeview (): VNode {
      return this.$createElement(VTreeview, {
        props: {
          items: this.builderItems,
          dense: this.dense,
        },
        scopedSlots: {
          label: e => this.genScoppedEditorEntry(e),
        },
      }, [])
    },
    genPreviewModeButtons (): VNode[] {
      return [
        {
          id: 'xSmall',
          ariaLabel: this.ariaLabelModeXSmall,
          icon: 'mdi-cellphone',
        },
        {
          id: 'small',
          ariaLabel: this.ariaLabelModeSmall,
          icon: 'mdi-crop-portrait',
        },
        {
          id: 'medium',
          ariaLabel: this.ariaLabelModeMedium,
          icon: 'mdi-crop-landscape',
        },
        {
          id: 'large',
          ariaLabel: this.ariaLabelModeLarge,
          icon: 'mdi-laptop',
        },
        {
          id: 'xLarge',
          ariaLabel: this.ariaLabelModeXLarge,
          icon: 'mdi-monitor-screenshot',
        },
        {
          id: 'auto',
          ariaLabel: this.ariaLabelModeAuto,
          icon: 'mdi-arrow-expand-horizontal',
        },
      ].map(mode => genTooltipButton(
        this.$createElement,
        this.$vuetify.lang.t(mode.ariaLabel),
        mode.icon,
        {
          icon: true,
          xSmall: true,
        },
        {
          small: true,
          color: this.screenSize === mode.id ? 'primary' : 'secondary',
        },
        () => {
          this.screenSize = mode.id
        }
      ))
    },
    genViewModeButton (): VNode {
      return genOptionsMenu(
        this.$createElement,
        ({ on }) => genTooltipButton(
          this.$createElement,
          this.$vuetify.lang.t(this.ariaLabelViewMode),
          this.viewModesDictionary[this.viewMode].icon,
          {
            icon: true,
            xSmall: true,
          },
          {
            xSmall: true,
          },
          on.click,
        ),
        Object.entries(this.viewModesDictionary).map((entry: any, index: number) => ({
          id: entry[0],
          title: entry[1].title,
          icon: entry[1].icon,
          color: 'secondary',
          index,
        } as SchemaEditorMenuOptionItem)),
        item => ({
          dense: true,
        }),
        item => ({
          small: true,
        }),
        item => {
          this.viewMode = item.id
        },
        {},
        {}
      )
    },
    genPreviewScreen (): VNode {
      return this.$createElement(
        VSchemaPreview,
        {
          props: {
            value: this.internalValue,
            schemasDictionary: this.schemasDictionary,
            screenSize: this.screenSize,
          },
        },
      )
    },
    genSchemaEditor (): VNode {
      return this.genTreeview()
    },
    genDefaultEditorEntry (e: any): VNode[] {
      return [this.$createElement(
        VSchemaBuilderEntry,
        {
          props: {
            itemMeta: e.item.meta,
            itemOptionsMenu: this.getOptionsForItem(e.item.meta),
            schemasDictionary: this.availableSchemas,
            labelClass: this.entryLabelClass,
          },
          on: {
            remove: this.onRemoveItem,
            'make-empty': this.onMakeItemEmpty,
            'make-null': this.onMakeItemNull,
            'make-undfined': this.onMakeItemUndifined,
            'move-up': this.onMoveItemUp,
            'move-down': this.onMoveItemDown,
            'move-first': this.onMoveItemFirst,
            'move-last': this.onMoveItemLast,
            'add-child': this.onAddChildToItem,
            'update-key': this.onUpdateItemKey,
            'update-value': this.onUpdateItemValue,
          },
        }
      )]
    },
    genToolbar (): VNode {
      return this.$createElement(
        VSystemBar,
        {
          props: {},
        },
        [
          this.genViewModeButton(),
          this.$createElement(VLabel, { props: {} }, [this.label]),
          this.$createElement(VSpacer, { staticClass: 'me-3' }, []),
          ...this.genPreviewModeButtons(),
          this.$createElement(VDivider, { staticClass: 'mx-2', props: { vertical: true } }),
          this.hideAddChildBtn || this.genAddChildToolbarBtn(),
          this.$createElement(VDivider, { staticClass: 'mx-2', props: { vertical: true } }),
          this.hideDownloadBtn || this.genDownloadToolbarBtn(),
          this.hideUploadBtn || this.genUploadToolbarBtn(),
          this.hideClearBtn || this.genClearToolbarBtn(),
        ]
      )
    },
    genSplitSheet (): VNode[] {
      return [
        this.$createElement(
          VSplitSheet,
          {
            props: {
              sheets: ((this.isSchemaEditorVisible ? 1 : 0) + (this.isPreviewVisible ? 1 : 0)),
              value: [0.3],
            },
            scopedSlots: {
              sheet0: sheet => {
                return this.genSchemaEditor()
              },
              sheet1: sheet => {
                return this.genPreviewScreen()
              },
            },
          },
        ),
      ]
    },
  },

  render (h) {
    return h(
      VSheet, {
      },
      [
        this.genToolbar(),
        h(
          'div',
          {
            staticClass: 'd-flex flex-row flex-grow-1',
          },
          [
            (this.isSchemaEditorVisible || this.isPreviewVisible) ? this.genSplitSheet() : false,
          ]),
      ])
  },
})
