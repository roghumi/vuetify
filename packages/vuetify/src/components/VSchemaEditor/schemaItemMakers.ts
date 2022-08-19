import { SchemaItemMaker } from 'types/services/renderer'

export default {
  string: {
    id: 'string',
    title: 'String',
    genNewEmptyItem () {
      return ''
    },
  },
  number: {
    id: 'number',
    title: 'Number',
    genNewEmptyItem () {
      return 0
    },
  },
  bool: {
    id: 'bool',
    title: 'Boolean',
    genNewEmptyItem () {
      return false
    },
  },
  array: {
    id: 'array',
    title: 'Array',
    genNewEmptyItem () {
      return []
    },
  },
  object: {
    id: 'object',
    title: 'Object',
    genNewEmptyItem () {
      return {}
    },
  },
} as { [key: string]: SchemaItemMaker }
