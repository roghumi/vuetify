
// Extensions
import VTreeview from '../VTreeview/VTreeview'
import VSystemBar from '../VSystemBar/VSystemBar'
import VSpacer from '../VGrid/VSpacer'
import VDivider from '../VDivider/VDivider'
import VSheet from '../VSheet/VSheet'
import VLabel from '../VLabel/VLabel'
import VSchemaEditorEntry from './VSchemaEditorEntry'

// Types
import { PropType, VNode, VNodeChildren } from 'vue'
import { SchemaItemMaker } from 'types/services/renderer'

// Utils
import {
  genTooltipButton,
  genConfirmDialog,
  genAddSchemaDialog,
  SchemaEditorItemMeta,
  SchemaEditorMenuOptionItem,
} from './helpers'
import DefaultSchemaItemMakers from './schemaItemMakers'
import { mergeDeep, genRandomId } from '../../util/helpers'
import { NormalizedScopedSlot, ScopedSlotChildren } from 'vue/types/vnode'

export type SchemaRootType = 'object' | 'array'

/* @vue/component */
export default VSheet.extend({
  name: 'v-schema-editor',

  props: {
    label: String,
    dense: Boolean,
    rootType: {
      type: String as PropType<SchemaRootType>,
      default: 'object',
    },
    rootMetaId: {
      type: String,
      default: '__root_meta_id__',
    },
    schemasDictionary: {
      type: Object as PropType<{[key: string]: SchemaItemMaker }>,
      default: null,
    },
    defaultSchemasDictionary: {
      type: Object as PropType<{[key: string]: SchemaItemMaker }>,
      default: () => (DefaultSchemaItemMakers),
    },
    value: {
      type: [Object, Array],
      default: null,
    },
    hideDefaultSchemas: Boolean,
    hideRootSwitchBtn: Boolean,
    hideAddChildBtn: Boolean,
    hideDownloadBtn: Boolean,
    hideUploadBtn: Boolean,
    hideClearBtn: Boolean,
    entryLabelClass: String,
    ariaLabelRootSwitch: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.rootSwitch',
    },
    ariaLabelAddChild: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.addChild',
    },
    ariaLabelDownload: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.download',
    },
    ariaLabelUpload: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.upload',
    },
    ariaLabelClear: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.clear',
    },
    ariaLabelClearAccept: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.clearAccept',
    },
    ariaLabelClearCancel: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.clearCancel',
    },
    ariaLabelAddChildOk: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.addChildOk',
    },
    ariaLabelObjectPropertyName: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.objectPropertyName',
    },
    ariaLabelObjectPropertyValue: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.objectPropertyValue',
    },
    ariaLabelOptionsMenuCopy: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.optionsMenu.copy',
    },
    ariaLabelOptionsMenuPasteAsChild: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.optionsMenu.pasteAsChild',
    },
    ariaLabelOptionsMenuPasteAsSibling: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.optionsMenu.pasteAsSibling',
    },
    ariaLabelOptionsMenuMoveUp: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.optionsMenu.moveUp',
    },
    ariaLabelOptionsMenuMoveDown: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.optionsMenu.moveDown',
    },
    ariaLabelOptionsMenuMoveFirst: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.optionsMenu.moveFirst',
    },
    ariaLabelOptionsMenuMoveLast: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.optionsMenu.moveLast',
    },
    ariaLabelOptionsMenuRemove: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.optionsMenu.remove',
    },
    messageClearWarning: {
      type: String,
      default: '$vuetify.schemaEditor.message.clearWarning',
    },
    messageChangeTypeWarning: {
      type: String,
      default: '$vuetify.schemaEditor.message.changeTypeWarning',
    },
    messageAddRootChild: {
      type: String,
      default: '$vuetify.schemaEditor.message.addRootChild',
    },
  },

  data () {
    return {
      internalValue: Array.isArray(this.value) ? mergeDeep([], this.value) : mergeDeep({}, this.value),
      internalRootType: Array.isArray(this.value) ? 'array' : 'object',
    }
  },

  computed: {
    availableSchemas (): {[key: string]: any} {
      return {
        ...(this.schemasDictionary ?? {}),
        ...(this.defaultSchemasDictionary ?? {}),
      }
    },
    items (): any[] {
      const makeItemOnReference = (ref: any, path: string, parentMeta?: SchemaEditorItemMeta): any => {
        const items: any[] = []
        Object.entries(ref).forEach((e, index) => {
          const key = e[0]
          const val = e[1] as {[key: string]: any}
          const meta = {
            id: key,
            ref: e[1],
            path: path + '.' + key,
            index,
            isRoot: path === this.rootMetaId,
            isRootChild: parentMeta?.isRoot,
            isLeaf: typeof e[1] !== 'object',
            type: Array.isArray(e[1]) ? 'array' : typeof val,
            component: typeof val === 'object' ? (val?._component ?? undefined) : undefined,
            parent: parentMeta,
          } as SchemaEditorItemMeta
          items.push({
            id: meta.id,
            name: `${meta.type}[${meta.index}] ${meta.id}`,
            children: typeof e[1] === 'object' ? makeItemOnReference(e[1], path + '.' + e[0], meta) : undefined,
            meta,
          })
        })
        return items
      }

      return makeItemOnReference(this.internalValue, 'root', {
        id: this.rootMetaId,
        ref: this.internalValue,
        path: this.rootMetaId,
        isRoot: true,
        isRootChild: false,
        isLeaf: false,
        type: this.internalRootType,
        index: 0,
      })
    },
  },

  watch: {
    value () {
      this.internalRootType = Array.isArray(this.value) ? 'array' : 'object'
      this.internalValue = Array.isArray(this.value) ? mergeDeep([], this.value) : mergeDeep({}, this.value)
    },
  },

  methods: {
    onMoveItemUp (item: SchemaEditorItemMeta) {},
    onMoveItemDown (item: SchemaEditorItemMeta) {},
    onMoveItemFirst (item: SchemaEditorItemMeta) {},
    onMoveItemLast (item: SchemaEditorItemMeta) {},
    onMakeItemNull (item: SchemaEditorItemMeta) {},
    onMakeItemUndifined (item: SchemaEditorItemMeta) {},
    onMakeItemEmpty (item: SchemaEditorItemMeta) {},
    onRemoveItem (item: SchemaEditorItemMeta) {
      this.modifyInternalValueItemParent(
        item,
        (parent: {[key: string]: any}) => (obj: {[key: string]: any}, key: string) => {
          if (item.id !== key) {
            obj[key] = parent[key]
          }
          return obj
        },
        (parent: any) => (arr: Array<any>, index: number) => {
          if (item.id !== index.toString()) {
            arr.push(parent[index])
          }
          return arr
        },
      )
      this.$emit('input', this.internalValue)
    },
    onUpdateItemKey (key: string, item: SchemaEditorItemMeta) {
      this.modifyInternalValueItemParent(
        item,
        (parent: {[key: string]: any}) => (obj: {[key: string]: any}, oldkey: string) => {
          obj[oldkey === item.id ? key : oldkey] = parent[oldkey]
          return obj
        },
        (parent: any) => (obj: Array<any>, index: number) => {},
      )
      this.$emit('input', this.internalValue)
    },
    onUpdateItemValue (value: any, item: SchemaEditorItemMeta) {
      if (item.parent && item.parent.id !== this.rootMetaId) {
        this.$set(item.parent.ref, item.id, value)
      } else {
        this.$set(this.internalValue, item.id, value)
      }
      this.$emit('input', this.internalValue)
    },
    onAddChildToItem (schemas: Array<SchemaItemMaker>, item: SchemaEditorItemMeta) {
      schemas.forEach((schema: SchemaItemMaker) => {
        if (item.parent && !item.isRoot) {
          if (item.type === 'array') {
            item.ref.push(schema.genNewEmptyItem())
          } else {
            this.$set(item.ref, genRandomId(), schema.genNewEmptyItem())
          }
        } else {
          if (Array.isArray(this.internalValue)) {
            this.$set(this.internalValue, genRandomId(), schema.genNewEmptyItem())
          } else {
            this.internalValue.push(schema.genNewEmptyItem())
          }
        }
        this.$emit('input', this.internalValue)
      })
    },
    getOptionsForItem (item: SchemaEditorItemMeta): Array<SchemaEditorMenuOptionItem> {
      return [
        {
          id: 'copy',
          title: this.$vuetify.lang.t(this.ariaLabelOptionsMenuCopy),
          icon: 'mdi-content-copy',
          color: 'secondary',
          index: 10,
        },
        ...(item.isLeaf ? [] : [{
          id: 'pasteAsChild',
          title: this.$vuetify.lang.t(this.ariaLabelOptionsMenuPasteAsChild),
          icon: 'mdi-content-paste',
          color: 'warning',
          index: 20,
        }]),
        {
          id: 'pasteAsSibling',
          title: this.$vuetify.lang.t(this.ariaLabelOptionsMenuPasteAsSibling),
          icon: 'mdi-content-paste',
          color: 'warning',
          index: 30,
        },
        {
          id: 'divider',
          index: 40,
        },
        {
          id: 'moveFirst',
          title: this.$vuetify.lang.t(this.ariaLabelOptionsMenuMoveFirst),
          icon: 'mdi-chevron-double-up',
          color: 'secondary',
          index: 50,
        },
        {
          id: 'moveUp',
          title: this.$vuetify.lang.t(this.ariaLabelOptionsMenuMoveUp),
          icon: 'mdi-chevron-up',
          color: 'secondary',
          index: 60,
        },
        {
          id: 'moveDown',
          title: this.$vuetify.lang.t(this.ariaLabelOptionsMenuMoveDown),
          icon: 'mdi-chevron-down',
          color: 'secondary',
          index: 70,
        },
        {
          id: 'moveLast',
          title: this.$vuetify.lang.t(this.ariaLabelOptionsMenuMoveLast),
          icon: 'mdi-chevron-double-down',
          color: 'secondary',
          index: 80,
        },
        {
          id: 'divider',
          index: 90,
        },
        {
          id: 'removeItem',
          title: this.$vuetify.lang.t(this.ariaLabelOptionsMenuRemove),
          icon: 'mdi-delete',
          color: 'error',
          index: 100,
        },
      ]
    },
    genDownloadToolbarBtn (): VNode {
      return genTooltipButton(
        this.$createElement,
        this.$vuetify.lang.t(this.ariaLabelDownload),
        'mdi-download',
        {
          icon: true,
          xSmall: true,
          color: 'secondary',
        },
        {
          xSmall: true,
        },
        (event: MouseEvent) => {

        }
      )
    },
    genUploadToolbarBtn (): VNode {
      return genTooltipButton(
        this.$createElement,
        this.$vuetify.lang.t(this.ariaLabelUpload),
        'mdi-upload',
        {
          icon: true,
          xSmall: true,
          color: 'warning',
        },
        {
          xSmall: true,
          color: 'warning',
        },
        (event: MouseEvent) => {

        }
      )
    },
    genClearToolbarBtn (): VNode {
      return genConfirmDialog(
        this.$createElement,
        ({ on }) => genTooltipButton(
          this.$createElement,
          this.$vuetify.lang.t(this.ariaLabelClear),
          'mdi-close',
          {
            icon: true,
            xSmall: true,
            color: 'red',
          },
          {
            xSmall: true,
            color: 'red',
          },
          on.click,
        ),
        this.$vuetify.lang.t(this.messageClearWarning),
        this.$vuetify.lang.t(this.ariaLabelClearAccept),
        this.$vuetify.lang.t(this.ariaLabelClearCancel),
        {
        },
        {
          color: 'warning',
        },
        {
          color: 'red',
        },
        {
          color: 'primary',
        },
        (event: MouseEvent) => {
          if (this.rootType === 'object') {
            this.internalValue = {}
          } else {
            this.internalValue = []
          }
          this.$emit('input', this.internalValue)
        },
        (event: MouseEvent) => {},
      )
    },
    genChangeRootToolbarBtn (): VNode {
      const targetType = this.$vuetify.lang.t(
        '$vuetify.schemaEditor.ariaLabel.' + (this.internalRootType === 'object' ? 'array' : 'object')
      )
      return genConfirmDialog(
        this.$createElement,
        ({ on }) => genTooltipButton(
          this.$createElement,
          this.$vuetify.lang.t(this.ariaLabelRootSwitch, targetType),
          this.internalRootType === 'object' ? 'mdi-code-array' : 'mdi-code-braces-box',
          {
            icon: true,
            xSmall: true,
            color: 'blue',
          },
          {
            xSmall: true,
            color: 'blue',
          },
          on.click
        ),
        this.$vuetify.lang.t(this.messageChangeTypeWarning, targetType),
        this.$vuetify.lang.t(this.ariaLabelClearAccept),
        this.$vuetify.lang.t(this.ariaLabelClearCancel),
        {
        },
        {
          color: 'warning',
        },
        {
          color: 'red',
        },
        {
          color: 'primary',
        },
        (event: MouseEvent) => {
          if (targetType === 'array') {
            this.internalValue = []
            this.internalRootType = 'array'
          } else {
            this.internalValue = {}
            this.internalRootType = 'object'
          }
          this.$emit('input', this.internalValue)
        },
        (event: MouseEvent) => {},
      )
    },
    genAddChildToolbarBtn (): VNode {
      return genAddSchemaDialog(
        this.$createElement,
        ({ on }) => genTooltipButton(
          this.$createElement,
          this.$vuetify.lang.t(this.ariaLabelAddChild),
          'mdi-plus',
          {
            icon: true,
            xSmall: true,
            color: 'success',
          },
          {
            xSmall: true,
            color: 'success',
          },
          on.click
        ),
        this.$vuetify.lang.t(this.messageAddRootChild),
        this.$vuetify.lang.t(this.ariaLabelAddChildOk),
        this.availableSchemas,
        {},
        {},
        {},
        {},
        (schemas: Array<SchemaItemMaker>) => {
          schemas.forEach((schema: SchemaItemMaker) => {
            if (this.internalRootType === 'object') {
              this.$set(this.internalValue, genRandomId(), schema.genNewEmptyItem())
            } else {
              this.internalValue.push(schema.genNewEmptyItem())
            }
            this.$emit('input', this.internalValue)
          })
        },
      )
    },
    genToolbar (): VNode {
      return this.$createElement(
        VSystemBar,
        {
        },
        [
          this.$createElement(VLabel, { props: {} }, [this.label]),
          this.$createElement(VSpacer, { staticClass: 'me-3' }, []),
          this.$slots?.toolbarButtons,
          this.hideAddChildBtn || this.genAddChildToolbarBtn(),
          this.hideRootSwitchBtn || this.genChangeRootToolbarBtn(),
          this.$createElement(VDivider, { staticClass: 'mx-2', props: { vertical: true } }),
          this.hideDownloadBtn || this.genDownloadToolbarBtn(),
          this.hideUploadBtn || this.genUploadToolbarBtn(),
          this.hideClearBtn || this.genClearToolbarBtn(),
        ]
      )
    },
    genTreeview (): VNode {
      return this.$createElement(VTreeview, {
        props: {
          items: this.items,
          dense: this.dense,
        },
        scopedSlots: {
          label: e => this.genScoppedEditorEntry(e),
        },
      }, [])
    },
    genScoppedEditorEntry (e: any): ScopedSlotChildren {
      const hasSlot = !!this.$scopedSlots.editorEntries

      return hasSlot ? this.$scopedSlots.editorEntries!(e.item) : this.genDefaultEditorEntry(e)
    },
    genDefaultEditorEntry (e: any): VNode[] {
      return [this.$createElement(
        VSchemaEditorEntry,
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
    modifyInternalValueItemParent (
      item: SchemaEditorItemMeta,
      objectModifier: any,
      arrayModifier: any,
    ) {
      if (item.parent && !item.isRootChild) {
        let newParent
        if (item.parent.type === 'object') {
          newParent = Object.keys(item.parent.ref).reduce(objectModifier(item.parent?.ref), {})
        } else {
          newParent = Object.keys(item.parent.ref).reduce(arrayModifier(item.parent?.ref), [])
        }
        if (item.parent.parent) {
          this.$set(item.parent.parent.ref, item.parent.id, newParent)
        } else {
          this.$set(this.internalValue, item.parent.id, newParent)
        }
      } else {
        let newParent
        if (Array.isArray(this.internalValue)) {
          newParent = Object.keys(this.internalValue).reduce(objectModifier(this.internalValue), [])
        } else {
          newParent = Object.keys(this.internalValue).reduce(objectModifier(this.internalValue), {})
        }
        this.$set(this, 'internalValue', newParent)
      }
      this.$emit('input', this.internalValue)
    },
  },

  render (h) {
    return h('div', {
      staticClass: 'd-flex flex-column justify-start',
    }, [
      this.genToolbar(),
      this.genTreeview(),
    ])
  },
})
