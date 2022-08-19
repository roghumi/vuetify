
import Renderer from './../../mixins/renderer'
import DynamicContext from './../../mixins/renderer/DynamicContext'

// Utilities
import mixins from '../../util/mixins'
import { mergeDeep } from '../../util/helpers'

// Types
import { VNode, PropType } from 'vue'

import { RendererableSchema } from 'types/services/renderer'
import { Component } from 'vue/types/umd'

/* @vue/component */
export default mixins(
  Renderer,
  DynamicContext,
).extend({
  name: 'v-schema-renderer',

  props: {
    schema: {
      type: Object as PropType<RendererableSchema>,
      default: null,
    },
    value: Object,
    context: Object as PropType<Component>,
  },

  data () {
    return {
      internalValue: mergeDeep({}, this.value ?? {}),
    }
  },

  watch: {
    value () {
      this.internalValue = mergeDeep({}, this.value ?? {})
    },
  },

  methods: {
    onContextValueChanged () {
      // emit update event in component if you wish
    },
  },

  render (h): VNode {
    return this.genComponentFromSchema(this.context ?? this, this.schema)
  },
})
