
// Extensions
import { genTooltipButton, isStringParsableFunction } from '../VSchemaEditor/helpers'
import { VNode } from 'vue'
import VLabel from '../VLabel/VLabel'
import VDivider from '../VDivider/VDivider'
import VSchemaEditorEntry from '../VSchemaEditor/VSchemaEditorEntry'
import VChip from '../VChip/VChip'
import VSwitch from '../VSwitch/VSwitch'
import VSimpleCheckbox from '../VCheckbox/VSimpleCheckbox'

// Utils

// Types

/* @vue/component */
export default VSchemaEditorEntry.extend({
  props: {
    ariaLabelChangeSlotMenu: {
      type: String,
      default: '$vuetify.schemaBuilder.ariaLabel.changeSlot',
    },
    ariaLabelSettings: {
      type: String,
      default: '$vuetify.schemaBuilder.ariaLabel.settings',
    },
    ariaLabelToggleDynmaic: {
      type: String,
      default: '$vuetify.schemaBuilder.ariaLabel.dynamics',
    },
  },

  data () {
    return {
      nextChildState: null,
    }
  },

  computed: {
    isFunctionalChild (): boolean {
      return typeof this.itemMeta.ref.children === 'function' ||
        (typeof this.itemMeta.ref.children === 'string' && isStringParsableFunction(this.itemMeta.ref.children))
    },
  },

  methods: {
    genLabel (): VNode {
      return this.$createElement(
        VChip,
        {
          props: {
            outlined: true,
            dense: true,
          },
        },
        [
          this.itemMeta.ref?.tag,
          this.$createElement(
            VDivider,
            {
              staticClass: 'ms-2',
              props: {
                vertical: true,
              },
            }
          ),
          this.genAddSchemaDialogBtn({
            small: true,
            color: this.isFunctionalChild ? 'secondary' : 'success',
            disabled: this.isFunctionalChild,
          }, {
            small: true,
          }),
          this.genToggleDynamicChildBtn(),
          this.genSettingsDialogBtn(),
          this.genChangeSlotMenuBtn(),
          this.genEntryOptionsMenu({
            small: true,
          }, {
            small: true,
          }),
        ]
      )
    },
    genToggleDynamicChildBtn (btnProps: any = {}, iconProps: any = {}): VNode {
      return genTooltipButton(
        this.$createElement,
        this.$vuetify.lang.t(this.ariaLabelToggleDynmaic),
        this.isFunctionalChild ? 'mdi-pipe' : 'mdi-pipe-disconnected',
        {
          icon: true,
          color: this.isFunctionalChild ? 'success' : 'grey',
          small: true,
          ...btnProps,
        },
        {
          small: true,
          ...iconProps,
        },
        (e: MouseEvent) => {
          this.$emit('dynamics', this.itemMeta, e)
        }
      )
    },
    genSettingsDialogBtn (btnProps: any = {}, iconProps: any = {}): VNode {
      return genTooltipButton(
        this.$createElement,
        this.$vuetify.lang.t(this.ariaLabelSettings),
        'mdi-cog-outline',
        {
          icon: true,
          color: 'primary',
          small: true,
          ...btnProps,
        },
        {
          small: true,
          ...iconProps,
        },
        (e: MouseEvent) => {
          this.$emit('settings', this.itemMeta, e)
        }
      )
    },
    genChangeSlotMenuBtn (btnProps: any = {}, iconProps: any = {}): VNode {
      return genTooltipButton(
        this.$createElement,
        this.$vuetify.lang.t(this.ariaLabelChangeSlotMenu),
        'mdi-file-table-box-outline',
        {
          icon: true,
          color: 'secondary',
          small: true,
          ...btnProps,
        },
        {
          small: true,
          ...iconProps,
        },
        (e: MouseEvent) => {
          this.$emit('slots', this.itemMeta, e)
        }
      )
    },
  },
  render (h) {
    return this.genLabel()
  },
})
