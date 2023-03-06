
// Extensions
import VTextField from '../VTextField/VTextField'
import VSystemBar from '../VSystemBar/VSystemBar'
import VSpacer from '../VGrid/VSpacer'
import VDivider from '../VDivider/VDivider'
import VSheet from '../VSheet/VSheet'
import VChip from '../VChip/VChip'
import VCheckbox from '../VCheckbox/VCheckbox'
import VTextarea from '../VTextarea/VTextarea'

// Types
import Vue, { PropType, VNode } from 'vue'
import { SchemaItemMaker } from 'types/services/renderer'
import VLabel from '../VLabel/VLabel'

// Utils
import {
  genTooltipButton,
  genTooltipIcon,
  genConfirmDialog,
  genAddSchemaDialog,
  SchemaEditorItemMeta,
  genOptionsMenu,
  SchemaEditorMenuOptionItem,
} from './helpers'
import { mergeDeep } from '../../util/helpers'

/* @vue/component */
export default Vue.extend({
  name: 'v-schema-editor-entry',

  props: {
    itemMeta: {
      type: Object as PropType<SchemaEditorItemMeta>,
      default: null,
    },
    itemOptionsMenu: {
      type: Array as PropType<Array<SchemaEditorMenuOptionItem>>,
      default: null,
    },
    labelClass: {
      type: String,
      default: 'd-flex align-center justify-end col-sm-4 col-md-3 col-lg-2 pb-1 pt-2 pe-0',
    },
    valueClass: {
      type: String,
      default: 'd-flex flex-row col-sm-8 col-md-9 col-lg-10 pb-1 pt-2 ps-0',
    },
    ariaLabelObjectPropertyName: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.objectPropertyName',
    },
    ariaLabelObjectPropertyValue: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.objectPropertyValue',
    },
    ariaLabelObjectPropertyOptions: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.objectPropertyOptions',
    },
    ariaLabelObjectPropertyAddChild: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.objectPropertyAddChild',
    },
    ariaLabelAddChildOk: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.addChildOk',
    },
    messagesAddChildToNode: {
      type: String,
      default: '$vuetify.schemaEditor.message.addChildToNode',
    },
    ariaLabelAcceptChanges: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.acceptChanges',
    },
    ariaLabelCancelChanges: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.cancelChanges',
    },
    ariaLabelSelectChildType: {
      type: String,
      default: '$vuetify.schemaEditor.ariaLabel.selectChildType',
    },
  },

  data () {
    return {
      internalKey: this.itemMeta.id,
      internalValue: typeof this.itemMeta.ref === 'object' ? null : this.itemMeta.ref,
      isKeyDirty: false,
      schemasSearchTerm: '',
    }
  },

  watch: {
    'itemMeta.id' () {
      this.internalKey = this.itemMeta.id
    },
    'itemMeta.ref' () {
      this.internalValue = typeof this.itemMeta.ref === 'object' ? null : this.itemMeta.ref
    },
  },

  methods: {
    acceptKeyChanges (): void {
      this.isKeyDirty = false
      this.$emit('update-key', this.internalKey, this.itemMeta)
    },
    revertKeyChanges (): void {
      this.internalKey = this.itemMeta.id
      this.isKeyDirty = false
    },
    acceptValueChange (v: any): void {
      this.$emit('update-value', v, this.itemMeta)
    },
    genEntryOptionsMenu (btnProps: any = {}, iconProps: any = {}): VNode {
      return genOptionsMenu(
        this.$createElement,
        ({ on }) => genTooltipButton(
          this.$createElement,
          this.$vuetify.lang.t(this.ariaLabelObjectPropertyOptions),
          'mdi-dots-vertical',
          {
            color: 'secondary',
            icon: true,
            ...btnProps,
          },
          iconProps,
          on.click,
        ),
        this.itemOptionsMenu,
        (item: SchemaEditorMenuOptionItem): any => {
        },
        (item: SchemaEditorMenuOptionItem): any => {
          return {
            color: item.color,
            small: true,
          }
        },
        (item: SchemaEditorMenuOptionItem): any => {
          return {
            color: item.color,
          }
        },
        {
        },
        {
          dense: true,
        }
      )
    },
    genAddSchemaDialogBtn (btnProps: any = {}, iconProps: any = {}): VNode {
      return genTooltipButton(
        this.$createElement,
        this.$vuetify.lang.t(this.ariaLabelObjectPropertyAddChild),
        'mdi-plus-box',
        {
          color: 'success',
          icon: true,
          ...btnProps,
        },
        iconProps,
        (e: MouseEvent) => {
          this.$emit('add-child', this.itemMeta, e)
        }
      )
    },
    genObjectEntry (): VNode {
      return this.genItemRowWithParentControl(
        this.$createElement(
          'span',
          {},
        ),
      )
    },
    genArrayEntry (): VNode {
      return this.genItemRowWithParentControl(
        this.$createElement(
          'div',
          {},
        ),
      )
    },
    genNumberEntry (): VNode {
      return this.genItemRowWithParentControl(
        this.$createElement(
          VTextField,
          {
            props: {
              label: this.$vuetify.lang.t(this.ariaLabelObjectPropertyValue),
              hideDetails: 'auto',
              dense: true,
              type: 'number',
              value: this.itemMeta.ref,
            },
            on: {
              change: (v: boolean) => {
                this.acceptValueChange(v)
              },
            },
          },
        ),
      )
    },
    genBooleanEntry (): VNode {
      return this.genItemRowWithParentControl(
        this.$createElement(
          VCheckbox,
          {
            props: {
              label: this.$vuetify.lang.t(this.ariaLabelObjectPropertyValue),
              hideDetails: 'auto',
              dense: true,
              inputValue: this.itemMeta.ref,
            },
            on: {
              change: (v: boolean) => {
                this.acceptValueChange(v)
              },
            },
          },
        ),
      )
    },
    genStringEntry (): VNode {
      return this.genItemRowWithParentControl(
        this.$createElement(
          VTextField,
          {
            props: {
              label: this.$vuetify.lang.t(this.ariaLabelObjectPropertyValue),
              hideDetails: 'auto',
              dense: true,
              value: this.itemMeta.ref,
              clearable: true,
            },
            on: {
              change: (v: boolean) => {
                this.acceptValueChange(v)
              },
            },
          },
        ),
      )
    },
    genFunctionEntry (): VNode {
      return this.genItemRowWithParentControl(
        this.$createElement(
          VTextarea,
          {
            props: {
              label: this.$vuetify.lang.t(this.ariaLabelObjectPropertyValue),
              hideDetails: 'auto',
              dense: true,
              value: this.itemMeta.ref?.toString(),
            },
          }
        ),
      )
    },
    genItemRowWithParentControl (itemControl: VNode): VNode {
      return this.$createElement(
        'div',
        {
          staticClass: 'd-flex flex-row justify-center align-top flex-grow-1',
        },
        [
          this.$createElement(
            'div',
            {
              staticClass: this.labelClass,
            },
            [this.genParentEnty()]
          ),
          this.$createElement(
            'div',
            { staticClass: this.valueClass },
            [
              this.isKeyDirty || this.genEntryOptionsMenu(),
              this.isKeyDirty || this.itemMeta.isLeaf || this.genAddSchemaDialogBtn(),
              itemControl,
            ],
          ),
        ]
      )
    },
    genParentObjectEntry (): VNode {
      return this.$createElement(
        VTextField,
        {
          props: {
            label: this.$vuetify.lang.t(this.ariaLabelObjectPropertyName),
            hideDetails: 'auto',
            dense: true,
            value: this.internalKey,
            color: this.isKeyDirty ? 'warning' : undefined,
          },
          on: {
            change: (newKey: string) => {
              this.internalKey = newKey
            },
            keydown: (e: KeyboardEvent) => {
              if (!this.isKeyDirty) {
                this.isKeyDirty = true
              }
            },
            keyup: (e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                this.acceptKeyChanges()
              } else if (e.key === 'Escape') {
                this.revertKeyChanges()
              }
            },
          },
        },
        [
          this.$createElement(
            'template',
            { slot: 'append' },
            [
              !this.isKeyDirty || genTooltipIcon(
                this.$createElement,
                this.$vuetify.lang.t(this.ariaLabelCancelChanges),
                'mdi-cancel',
                {
                  color: 'primary',
                },
                () => {
                  this.revertKeyChanges()
                }
              ),
              !this.isKeyDirty || genTooltipIcon(
                this.$createElement,
                this.$vuetify.lang.t(this.ariaLabelAcceptChanges),
                'mdi-check',
                {
                  color: 'warning',
                },
                () => {
                  this.acceptKeyChanges()
                }
              ),
            ],
          ),
        ]
      )
    },
    genParentArrayEntry (): VNode {
      return this.$createElement(
        'div',
        {
          staticClass: 'd-flex align-center justify-end flex-grow-1',
        },
        [
          this.$createElement(
            VChip,
            {
              staticClass: 'me-2',
              props: {
                label: true,
              },
            },
            [
              `#${this.itemMeta.id}`,
            ]
          ),
        ]
      )
    },
    genParentEnty (): VNode {
      if (this.itemMeta?.parent?.type === 'array') {
        return this.genParentArrayEntry()
      } else if (this.itemMeta?.parent?.type === 'object') {
        return this.genParentObjectEntry()
      }
      return this.$createElement('div', 'unknown parent control')
    },
    genDynamicEntry (): VNode {
      if (this.itemMeta?.type === 'array') {
        return this.genArrayEntry()
      } else if (this.itemMeta?.type === 'object') {
        return this.genObjectEntry()
      } else if (this.itemMeta?.type === 'string') {
        return this.genStringEntry()
      } else if (this.itemMeta?.type === 'number') {
        return this.genNumberEntry()
      } else if (this.itemMeta?.type === 'boolean') {
        return this.genBooleanEntry()
      } else if (this.itemMeta?.type === 'function') {
        return this.genFunctionEntry()
      }
      return this.$createElement('div', {}, 'unknown type')
    },
  },

  render (h) {
    return this.genDynamicEntry()
  },
})
