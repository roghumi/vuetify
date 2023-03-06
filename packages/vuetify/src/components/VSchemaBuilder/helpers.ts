import { VNode } from 'vue'

import VBtn from '../VBtn/VBtn'
import VSystemBar from '../VSystemBar/VSystemBar'
import VTooltip from '../VTooltip/VTooltip'
import VSpacer from '../VGrid/VSpacer'
import VDivider from '../VDivider/VDivider'
import VSheet from '../VSheet/VSheet'
import { VCard, VCardTitle, VCardActions, VCardText } from '../VCard'
import VIcon from '../VIcon/VIcon'
import VDialog from '../VDialog/VDialog'
import VAutocomplete from '../VAutocomplete/VAutocomplete'
import VMenu from '../VMenu/VMenu'
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

import { CreateElement } from 'vue/types/umd'
import { ScopedSlot } from 'vue/types/vnode'
import { SchemaItemMaker, RendererableSchema } from 'types/services/renderer'
import VVirtualScroll from '../VVirtualScroll/VVirtualScroll'
import VTextField from '../VTextField/VTextField'

export type BuilderComponentSettingsValueCallback = (search: string) => void

export function genBuilderComponentSettingsDialog (
  h: CreateElement,
  activator: ScopedSlot,
  message: string,
  dialogProps: any,
  cardProps: any,
  form: RendererableSchema,
  formValue: any,
  formValueChangeCallback: BuilderComponentSettingsValueCallback
): VNode {
  return h(
    VDialog,
    {
      props: {
        ...dialogProps,
      },
      scopedSlots: {
        activator,
      },
    },
    [
      h(VCard, { props: cardProps }, [
        h(VCardTitle, {}, [message]),
        h(VDivider, {}),
        h(VCardText, {}, []),
      ]),
    ]
  )
}
