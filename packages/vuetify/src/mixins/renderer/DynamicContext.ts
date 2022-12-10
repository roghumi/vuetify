import Vue from 'vue'
// Utilities
import { getNestedValue } from '../../util/helpers'

export function setNestedValue (context: any, obj: {[key: string]: any}, path: (string | number)[], def: any): any {
  const last = path.length - 1

  if (path.length === 1) return obj[path[0]] = def

  for (let i = 0; i < last; i++) {
    if (obj[path[i]] === undefined || obj[path[i]] === null) {
      context.$set(obj, path[i], {})
    }
    obj = obj[path[i]]
  }

  context.$set(obj, path[last], def)
}

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
