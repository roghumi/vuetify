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

export type AddSchemaDialogCallback = (schemas: Array<SchemaItemMaker>) => void
export type SchemaSearchDialogCallback = (search: string) => void

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
  activator: ScopedSlot|undefined,
  message: string,
  ok: string,
  schemasDictionary: { [key: string]: SchemaItemMaker },
  dialogProps: any,
  cardProps: any,
  okProps: any,
  autocompleteProps: any,
  onAddItems: AddSchemaDialogCallback,
  onFilterItemsCallback: SchemaSearchDialogCallback
): VNode {
  return h(
    VDialog,
    {
      props: {
        ...dialogProps,
      },
      ref: 'addChildDialog',
      scopedSlots: {
        activator,
      },
    },
    [
      h(VCard, { props: cardProps }, [
        h(VCardTitle, {}, [message]),
        h(VDivider, {}),
        h(VCardText, {}, [
          h(VTextField, {
            props: {
              dense: true,
              fullWidth: true,
              label: 'Search',
              hideDetails: 'auto',
            },
            on: {
              change: (s: string) => {
                onFilterItemsCallback(s)
              },
            },
          }),
          h(VVirtualScroll, {
            props: {
              items: Object.entries(schemasDictionary ?? {}).map(e => (e[1])),
              itemHeight: '32px',
              height: '140px',
              ...(autocompleteProps ?? {}),
            },
            scopedSlots: {
              default: (item: any) => h(
                VListItem,
                {
                  props: {
                    dense: true,
                  },
                  on: {
                    click: () => {
                      onAddItems([item.item])
                    },
                  },
                },
                [
                  h(VListItemContent, {}, [
                    h(VListItemTitle, {}, item?.item?.title),
                  ]),
                ]
              ),
            },
          }),
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

export function getStringFromSchema (schema: any): string {
  const FN_DELIMETER_START = '/$fnstrt('
  const FN_DELIMETER_END = ')$fnnd/'
  return JSON.stringify(schema, (key, value) => {
    if (typeof value === 'function') {
      return `${FN_DELIMETER_START}${value
        .toString()
        .replaceAll('\n', ' ')
        .replaceAll('  ', '')}${FN_DELIMETER_END}`
    }
    return value
  }, 2)
}

export function getSchemaFromString (serialized: string): RendererableSchema|null {
  const FN_DELIMETER_START = '/$fnstrt('
  const FN_DELIMETER_END = ')$fnnd/'
  return JSON.parse(serialized, (key, value) => {
    if (
      typeof value === 'string' &&
      value.startsWith(FN_DELIMETER_START) &&
      value.endsWith(FN_DELIMETER_END)
    ) {
      // eslint-disable-next-line no-new-func
      return new Function(
        'return ' +
          value.substring(
            FN_DELIMETER_START.length,
            value.length - FN_DELIMETER_END.length
          )
      )()
    }
    return value
  })
}

export function isStringParsableFunction (str: string): boolean {
  const FN_DELIMETER_START = '/$fnstrt('
  const FN_DELIMETER_END = ')$fnnd/'
  return str.startsWith(FN_DELIMETER_START) && str.endsWith(FN_DELIMETER_END)
}
