import Vue from 'vue'
// Utilities
import { getNestedValue, setNestedValue } from '../../util/helpers'

export default Vue.extend({
  data (): any {
    return {
      m__virtValue: {},
    }
  },
  methods: {
    $vSet (path: string, val: any): void {
      const pathParts = path.split('.')
      const last = pathParts.length - 1
      if (last >= 1) {
        const parentRef = getNestedValue(this.m__virtValue, pathParts.slice(0, last), null)
        if (parentRef) {
          this.$set(parentRef, pathParts.slice(-1).join('.'), val)
        } else {
          setNestedValue(this, this.m__virtValue, pathParts, val)
        }
      } else {
        this.$set(this.m__virtValue, path, val)
      }
    },
    $vGet (path: string, def: any): any {
      return getNestedValue(this.m__virtValue, path.split('.'), def)
    },
  },
})
