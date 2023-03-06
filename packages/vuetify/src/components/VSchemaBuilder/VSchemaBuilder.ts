import './VSchemaBuilder.scss'

// Extensions
import VTreeview from '../VTreeview/VTreeview'
import VSystemBar from '../VSystemBar/VSystemBar'
import { VToolbar, VToolbarItems, VToolbarTitle } from '../VToolbar'
import VSpacer from '../VGrid/VSpacer'
import VDivider from '../VDivider/VDivider'
import VSheet from '../VSheet/VSheet'
import VSchemaEditor from '../VSchemaEditor/VSchemaEditor'
import VSchemaBuilderEntry from './VSchemaBuilderEntry'
import VSchemaPreview from './VSchemaPreview'
import VLabel from '../VLabel/VLabel'
import VSplitSheet from '../VSplitSheet/VSplitSheet'
import VTextarea from '../VTextarea/VTextarea'
import VBtn from '../VBtn/VBtn'
import VTooltip from '../VTooltip/VTooltip'
import { VCard, VCardTitle, VCardActions, VCardText } from '../VCard'
import VIcon from '../VIcon/VIcon'
import VDialog from '../VDialog/VDialog'
import VAutocomplete from '../VAutocomplete/VAutocomplete'
import VVirtualScroll from '../VVirtualScroll/VVirtualScroll'
import VMenu from '../VMenu/VMenu'
import VTextField from '../VTextField/VTextField'
import VSchemaRenderer from '../VSchemaRenderer/VSchemaRenderer'
import {
  VList,
  VListGroup,
  VListItem,
  VListItemAction,
  VListItemAvatar,
  VListItemIcon,
  VListItemGroup,
  VListItemContent,
  VListItemTitle,
} from '../VList'
import {
  VTabs,
  VTab,
  VTabsItems,
  VTabItem,
  VTabsSlider,
} from '../VTabs'

// Utils
import {
  genConfirmDialog,
  genAddSchemaDialog,
  SchemaEditorItemMeta,
  genTooltipButton, genOptionsMenu, SchemaEditorMenuOptionItem, getSchemaFromString, getStringFromSchema,
  isStringParsableFunction,
} from '../VSchemaEditor/helpers'
import { genBuilderComponentSettingsDialog } from './helpers'
import { DefaultScreenSizeDictionary, ScreenSize, ScreenSizeProperties } from './screenSizes'
import { mergeDeep, genRandomId, getNestedValue, setNestedValue } from '../../util/helpers'
import { syntaxHighlightJsonString } from './syntaxHighlight'
import Renderer from './../../mixins/renderer'
import DynamicContext from './../../mixins/renderer/DynamicContext'
import mixins from '../../util/mixins'

// Types
import { PropType, VNode } from 'vue'
import { AsyncComponentFactory } from 'vue/types/options'
import { SchemaItemMaker } from 'types/services/renderer'

export enum SchemaBuilderViewMode {
  Full = 'full',
  Preview = 'preview',
  Code = 'code',
  Editor = 'editor'
}

/* @vue/component */
export default mixins(
  Renderer,
  DynamicContext,
  VSchemaEditor,
).extend({
  name: 'v-schema-builder',

  props: {
    label: String,
    schemasDictionary: {
      type: Object as PropType<{[key: string]: SchemaItemMaker }>,
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
    ariaLabelSettings: {
      type: String,
      default: '$vuetify.schemaBuilder.ariaLabel.settings',
    },
    ariaLabelSlots: {
      type: String,
      default: '$vuetify.schemaBuilder.ariaLabel.changeSlot',
    },
    ariaLabelDynamics: {
      type: String,
      default: '$vuetify.schemaBuilder.ariaLabel.dynamics',
    },
    ariaLabelSettingsSearch: {
      type: String,
      default: '$vuetify.schemaBuilder.ariaLabel.settingsSearch',
    },
  },
  data () {
    return {
      internalValue: mergeDeep({}, this.value),
      settingsDialogTarget: null as any,
      slotsDialogTarget: null as any,
      dynamicsDialogTarget: null as any,
      settingsDialogSearch: '',
      dynamicsDialogSearch: '',
      dynamicsTabIndex: 0,
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
    isFunctionalChildren (children: any): boolean {
      return typeof children === 'function' ||
        (typeof children === 'string' && isStringParsableFunction(children))
    },
    onAddChildToItem (schemas: Array<SchemaItemMaker>, item: SchemaEditorItemMeta) {
      schemas.forEach((schema: SchemaItemMaker) => {
        if (item?.parent && !item?.isRoot) {
          if (item?.type === 'array') {
            item.ref.push(schema.genNewEmptyItem())
          } else {
            if (item.ref.children) {
              item.ref.children.push(schema.genNewEmptyItem())
            }
          }
        } else {
          if (!this.internalValue.children) {
            this.internalValue.children = []
          }
          this.internalValue.children.push(schema.genNewEmptyItem())
        }
        this.$emit('input', this.internalValue)
      })
    },
    onShowSlotsDialog (item: SchemaEditorItemMeta) {
      this.slotsDialogTarget = item
      if (this.$refs.slotsDialog) {
        this.$set(this.$refs.slotsDialog, 'isActive', true)
      }
    },
    onShowSettingsDialog (item: SchemaEditorItemMeta) {
      this.settingsDialogTarget = item
      if (this.$refs.settingsDialog) {
        this.$set(this.$refs.settingsDialog, 'isActive', true)
      }
    },
    onShowDynamicsDialog (item: SchemaEditorItemMeta) {
      this.dynamicsDialogTarget = item
      if (this.$refs.dynamicsDialog) {
        this.$set(this.$refs.dynamicsDialog, 'isActive', true)
      }
    },
    genTreeview (): VNode {
      return this.$createElement(VTreeview, {
        props: {
          items: this.builderItems,
          dense: this.dense,
        },
        scopedSlots: {
          label: (e: any) => this.genScoppedEditorEntry(e),
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
            'add-child': this.onShowAddChildDialog,
            'update-key': this.onUpdateItemKey,
            'update-value': this.onUpdateItemValue,
            dynamics: this.onShowDynamicsDialog,
            settings: this.onShowSettingsDialog,
            slots: this.onShowSlotsDialog,
          },
        }
      )]
    },
    genToolbar (): VNode {
      return this.$createElement(
        VToolbar,
        {
          props: {
            dense: true,
            height: '42px',
          },
        },
        [
          this.genViewModeButton(),
          this.hideAddChildBtn || this.genAddChildToolbarBtn(),
          this.$createElement(VDivider, { staticClass: 'mx-2', props: { vertical: true } }),
          this.$createElement(
            VToolbarTitle,
            {},
            this.label
          ),
          this.$createElement(VSpacer, { staticClass: 'me-3' }, []),
          this.$createElement(
            VToolbarItems,
            {},
            [
              ...this.genPreviewModeButtons(),
              this.$createElement(VDivider, { staticClass: 'mx-2', props: { vertical: true } }),
              this.hideDownloadBtn || this.genDownloadToolbarBtn(),
              this.hideUploadBtn || this.genUploadToolbarBtn(),
              this.hideClearBtn || this.genClearToolbarBtn(),
            ]
          ),
          // this.$createElement(VLabel, { props: {} }, []),
        ]
      )
    },
    genSlotsDialog (): VNode {
      return this.$createElement(
        VDialog,
        {
          props: {
            maxWidth: '640px',
          },
          ref: 'slotsDialog',
        },
        [
          this.$createElement(VCard, {
            props: {
            },
          }, [
            this.$createElement(VCardTitle, {}, this.$vuetify.lang.t(this.ariaLabelSlots)),
            this.$createElement(VDivider, {}),
            this.$createElement(VCardText, {}, [
            ]),
          ]),
        ]
      )
    },
    genSettingsDialog (): VNode {
      const settings = this.schemasDictionary[this.settingsDialogTarget?.ref?.tag]
      return this.$createElement(
        VDialog,
        {
          props: {
            maxWidth: '640px',
          },
          ref: 'settingsDialog',
        },
        [
          this.$createElement(VCard, {
            props: {
            },
          }, [
            this.$createElement(VCardTitle, {}, this.$vuetify.lang.t(this.ariaLabelSettings)),
            this.$createElement(VDivider, {}),
            this.$createElement(VCardText, {}, [
              this.$createElement(VTextField, {
                props: {
                  dense: true,
                  fullWidth: true,
                  label: this.$vuetify.lang.t(this.ariaLabelSettingsSearch),
                  hideDetails: 'auto',
                  value: this.settingsDialogSearch,
                },
                on: {
                  change: (s: string) => {
                    this.settingsDialogSearch = s
                  },
                },
              }),
              this.$createElement(VVirtualScroll, {
                props: {
                  items: (settings?.form?.children ?? [])
                    .filter((c: any) => this.settingsDialogSearch?.length === 0 || c.id?.includes(this.settingsDialogSearch)),
                  itemHeight: '72px',
                  height: '320px',
                },
                scopedSlots: {
                  default: (item: any) => {
                    const dynoPath = this.settingsDialogTarget?.path.replace('root', 'internalValue') + '.props.$(' + item.item.id + ')'
                    const dynoValue = getNestedValue(this, dynoPath.split('.'))
                    const isDynoValue = this.isFunctionalChildren(dynoValue)

                    const inputNode = this.genComponentFromSchema(this, {
                      ...(item?.item ?? {}),
                      'v-model': {
                        get: (context: any) => {
                          const path = context.settingsDialogTarget?.path.replace('root', 'internalValue') + '.props.' + item.item.id
                          return getNestedValue(context, path.split('.'))
                        },
                        set: (context: any, value: any) => {
                          const path = context.settingsDialogTarget?.path.replace('root.', '') + '.props.' + item.item.id
                          setNestedValue(context, context.internalValue, path.split('.'), value)
                        },
                      },
                    })

                    const dynamoBtn = genTooltipButton(
                      this.$createElement,
                      this.$vuetify.lang.t(this.ariaLabelDynamics),
                      isDynoValue ? 'mdi-pipe' : 'mdi-pipe-disconnected',
                      {
                        icon: true,
                        small: true,
                        color: isDynoValue ? 'green' : undefined,
                      },
                      {
                        small: true,
                      },
                      () => {
                      }
                    )
                    // if (isDynoValue) {
                    //   inputNode.data.props.disabled = true
                    // }
                    // console.log(item.item, inputNode, dynoPath, dynoValue, isDynoValue)

                    return this.$createElement('div', {
                      staticClass: 'd-flex flex-row align-center justify-start',
                    }, [
                      dynamoBtn,
                      inputNode,
                    ])
                  },
                },
              }),
            ]),
          ]),
        ]
      )
    },
    genDynamicsDialog (): VNode {
      return this.$createElement(
        VDialog,
        {
          props: {
            maxWidth: '640px',
          },
          ref: 'dynamicsDialog',
        },
        [
          this.$createElement(VCard, {
            props: {
            },
          }, [
            this.$createElement(VCardTitle, {}, this.$vuetify.lang.t(this.ariaLabelDynamics)),
            this.$createElement(VDivider, {}),
            this.$createElement(VCardText, {
              staticClass: 'mb-1',
            }, [
              this.$createElement(VTabs, {
                props: {
                  value: this.dynamicsTabIndex,
                },
                on: {
                  change: (e: any) => {
                    this.dynamicsTabIndex = e
                  },
                },
              }, [
                this.$createElement(VTab, {}, ['V-Model']),
                this.$createElement(VTab, {}, ['Content']),
              ]),
              this.$createElement(VTabsItems, {
                props: {
                  value: this.dynamicsTabIndex,
                },
              }, [
                this.$createElement(VTabItem, {}, [
                  this.genComponentFromSchema(this, {
                    tag: 'VForm',
                    children: [
                      {
                        tag: 'VTextField',
                        props: {
                          hideDetails: 'auto',
                          label: 'Property name',
                          hint: 'Property name for v-model',
                        },
                      },
                      {
                        tag: 'VTextField',
                        props: {
                          hideDetails: 'auto',
                          label: 'Property event name for v-model',
                        },
                      },
                      {
                        tag: 'VTextarea',
                        staticClass: 'v-schema-builder-code',
                        style: {
                          fontFamily: 'courier',
                          fontSize: '12px',
                        },
                        props: {
                          hideDetails: 'auto',
                          label: 'Property Get script',
                        },
                      },
                      {
                        tag: 'VTextarea',
                        staticClass: 'v-schema-builder-code',
                        style: {
                          fontFamily: 'courier',
                          fontSize: '12px',
                        },
                        props: {
                          hideDetails: 'auto',
                          label: 'Property Set script',
                        },
                      },
                    ],
                  }),
                ]),
                this.$createElement(VTabItem, {}, [
                  this.genComponentFromSchema(this, {
                  }),
                ]),
              ]),
            ]),
          ]),
        ]
      )
    },
    genCodeEditor (): VNode {
      const jsonString = getStringFromSchema(this.internalValue)
      return this.$createElement(
        'div',
        {
          staticClass: 'd-flex flex-grow-1',
          style: {
            // position: 'relative',
          },
        },
        [
          // syntaxHighlightJsonString(this.$createElement, jsonString),
          this.$createElement(
            VTextarea,
            {
              staticClass: 'v-schema-builder-code',
              style: {
                fontFamily: 'courier',
                fontSize: '12px',
              },
              props: {
                rows: 30,
                value: jsonString,
              },
            },
          ),
        ]
      )
    },
    genSplitSheet (): VNode[] {
      return [
        this.$createElement(
          VSplitSheet,
          {
            props: {
              value: [0.3],
              maxWidth: '100%',
            },
            scopedSlots: {
              sheet0: ({ index, width }) => this.$createElement('div', {
                style: {
                  overflowX: 'scroll',
                  width,
                },
              }, [this.genSchemaEditor()]),
              sheet1: ({ index, width }) => this.$createElement('div', {
                style: {
                  overflowX: 'scroll',
                  width,
                },
              }, [this.genPreviewScreen()]),
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
        this.genAddChildDialog(),
        this.genSettingsDialog(),
        this.genSlotsDialog(),
        this.genDynamicsDialog(),
        this.genToolbar(),
        h(
          'div',
          {
            staticClass: 'd-flex flex-row flex-grow-1',
          },
          [
            !this.isCodeEditorVisible ? this.genSplitSheet() : this.genCodeEditor(),
          ]),
      ])
  },
})
