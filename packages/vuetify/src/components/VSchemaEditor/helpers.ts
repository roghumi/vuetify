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
import { SchemaItemMaker } from 'types/services/renderer'

export type AddSchemaDialogCallback = (schemas: Array<SchemaItemMaker>) => void

export interface SchemaEditorItemMeta {
  id: string
  ref: any
  path: string
  index: number
  type: string
  isRoot: boolean
  isLeaf: boolean
  isRootChild: boolean
  component?: string
  parent?: SchemaEditorItemMeta
}

export interface SchemaEditorMenuOptionItem {
  id: string
  index: number
  title?: string
  icon?: string
  color?: string
}

export function genOptionsMenu (
  h: CreateElement,
  activator: ScopedSlot,
  items: Array<SchemaEditorMenuOptionItem>,
  itemProps: (item: SchemaEditorMenuOptionItem) => any,
  itemIconProps: (item: SchemaEditorMenuOptionItem) => any,
  itemSelected: (item: SchemaEditorMenuOptionItem) => any,
  menuProps: any,
  listProps: any,
) {
  return h(
    VMenu,
    {
      props: menuProps,
      scopedSlots: {
        activator,
      },
    },
    [
      h(
        VList,
        {
          staticClass: 'py-0',
          props: listProps,
        },
        items.map(item =>
          item.id === 'divider' ? h(VDivider, {})
            : h(
              VListItem,
              {
                props: itemProps(item),
                on: {
                  click: (e: MouseEvent) => {
                    itemSelected(item)
                  },
                },
              },
              [
                h(VListItemIcon, {}, [
                  h(VIcon, {
                    props: itemIconProps(item),
                  }, item.icon),
                ]),
                h(VListItemContent, {}, [
                  h(VListItemTitle, {}, item.title),
                ]),
              ]
            ))
      ),
    ]
  )
}

export function genAddSchemaDialog (
  h: CreateElement,
  activator: ScopedSlot,
  message: string,
  ok: string,
  schemasDictionary: { [key: string]: SchemaItemMaker },
  dialogProps: any,
  cardProps: any,
  okProps: any,
  autocompleteProps: any,
  onAddItems: AddSchemaDialogCallback
): VNode {
  let itemsToAdd: Array<SchemaItemMaker> = []
  return h(
    VDialog,
    {
      props: {
        ...dialogProps,
      },
      ref: 'genAddSchemaDialog',
      scopedSlots: {
        activator,
      },
    },
    [
      h(VCard, { props: cardProps }, [
        h(VCardTitle, {}, [message]),
        h(VDivider, {}),
        h(VCardText, {}, [
          h(VAutocomplete, {
            props: {
              items: Object.entries(schemasDictionary ?? {}).map(e => (e[1])),
              returnObject: true,
              itemText: 'title',
              itemValue: 'id',
              ...(autocompleteProps ?? {}),
            },
            on: {
              change: (e: any) => {
                if (Array.isArray(e)) {
                  itemsToAdd = e
                } else {
                  itemsToAdd = [e]
                }
              },
            },
          }),
        ]),
        h(VDivider, {}),
        h(VCardActions, { staticClass: 'd-flex flex-row align-center justify-center' }, [
          h(VBtn, {
            props: okProps,
            on: {
              click: (e: any) => {
                onAddItems(itemsToAdd)
              },
            },
          }, [ok]),
        ]),
      ]),
    ]
  )
}

export function genConfirmDialog (
  h: CreateElement,
  activator: ScopedSlot,
  message: string,
  accept: string,
  reject: string,
  dialogProps: any,
  cardProps: any,
  acceptProps: any,
  rejectProps: any,
  onAccept: Function,
  onReject: Function,
): VNode {
  return h(
    VDialog,
    {
      props: dialogProps,
      scopedSlots: {
        activator,
      },
    },
    [
      h(VCard, { props: cardProps }, [
        h(VCardTitle, {}, [message]),
        h(VCardActions, { staticClass: 'd-flex flex-row align-center justify-center' }, [
          h(VBtn, { props: acceptProps, on: { click: onAccept } }, [accept]),
          h(VBtn, { props: rejectProps, on: { click: onReject } }, [reject]),
        ]),
      ]),
    ]
  )
}

export function genTooltipIcon (
  h: CreateElement,
  tooltip: string,
  icon: string,
  iconProps: any,
  onClick: Function,
) {
  return h(
    VTooltip,
    {
      props: {
        top: true,
      },
      scopedSlots: {
        activator: ({ on }) => (h(
          VIcon,
          {
            props: iconProps,
            on: {
              click: onClick,
              ...on,
            },
          },
          [
            icon,
          ]
        )),
      },
    },
    [
      tooltip,
    ]
  )
}

export function genTooltipButton (
  h: CreateElement,
  tooltip: string,
  icon: string,
  btnProps: any,
  iconProps: any,
  onClick: Function,
): VNode {
  return h(
    VTooltip,
    {
      props: {
        top: true,
      },
      scopedSlots: {
        activator: ({ on }) => (h(
          VBtn,
          {
            props: btnProps,
            on: {
              click: onClick,
              ...on,
            },
          },
          [
            h(
              VIcon,
              { props: iconProps },
              [icon]
            ),
          ]
        )),
      },
    },
    [
      tooltip,
    ]
  )
}
