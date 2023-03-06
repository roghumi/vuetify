import Vue from 'vue'
import { VNodeChildren, VNode, ScopedSlot } from 'vue/types'
import { VNodeData } from 'vue/types/umd'
import { AsyncComponentFactory, PropType, AsyncComponent, Component } from 'vue/types/options'
import { RendererableSchema, RendererDynamicProperty, RendererDynamicUpdate } from 'types/services/renderer'
// Utilities
import { mergeDeep } from '../../util/helpers'

export type SchemaPostProcessor = (data: VNodeData) => VNodeData

export default Vue.extend({
  props: {
    tag: String,
    componentsDictionary: {
      type: Object as PropType<{ [key: string]: AsyncComponentFactory }>,
      default: () => ({}),
    },
    postProcess: {
      type: Function as PropType<SchemaPostProcessor>,
      default: null,
    },
    dynamicProperyNameTest: {
      type: Function,
      default: null,
    },
    dynamicPropertyNameResolve: {
      type: Function,
      default: null,
    },
    defaultModelProperyName: {
      type: String,
      default: 'value',
    },
    defaultModelEventName: {
      type: String,
      default: 'input',
    },
  },

  data () {
    return {
      asyncComponents: {} as { [key: string]: any },
      defaultPropertyNamesResolver: (prop: string): string => { return prop.substring('$('.length, prop.length - 1) },
      defaultPropertyNameTester: (prop: string): boolean => { return prop.startsWith('$(') && prop.endsWith(')') },
    }
  },

  methods: {
    onContextValueChanged (): void {
      // emit update event in component if you wish
    },
    evaluateDynamicValue (context: Component, callback: RendererDynamicProperty): any {
      return callback(context)
    },
    updateDynamicModel (context: Component, callback: RendererDynamicUpdate, value: any) {
      callback(context, value)
      this.onContextValueChanged()
    },
    isChildInScoppedSlots (child: RendererableSchema): boolean {
      return typeof child === 'object' &&
        child.slot !== 'default' &&
        child.slot !== undefined &&
        child.slot !== null
    },
    shouldRenderComponent (desc: RendererableSchema): boolean {
      return desc.show !== false
    },
    createSchemaTag (schema: RendererableSchema): string|AsyncComponent|Component {
      if (!schema || !schema.tag || schema.tag === 'VSchemaRenderer') {
        return schema?.parent === null ? this.tag : 'div'
      } else {
        // component has factory on its description
        if (schema.factory) {
          if (!this.asyncComponents[schema.tag]) {
            this.asyncComponents[schema.tag] = schema.factory
          }
          return this.asyncComponents[schema.tag]
        }
        // component has factory in components dictionary
        if (this.componentsDictionary[schema.tag]) {
          if (!this.asyncComponents[schema.tag]) {
            this.asyncComponents[schema.tag] = this.componentsDictionary[schema.tag]
          }
          return this.asyncComponents[schema.tag]
        }
        // component is global
        return schema.tag
      }
    },
    isPropertyDynamic (property: string, value: any) {
      if (this.dynamicProperyNameTest && typeof this.dynamicProperyNameTest === 'function') {
        return this.dynamicProperyNameTest(property) && typeof value === 'function'
      } else {
        return this.defaultPropertyNameTester(property) && typeof value === 'function'
      }
    },
    getDynamicPropertyPlainName (property: string): string {
      if (this.dynamicPropertyNameResolve && typeof this.dynamicPropertyNameResolve === 'function') {
        return this.dynamicPropertyNameResolve(property)
      } else {
        return this.defaultPropertyNamesResolver(property)
      }
    },
    evaluateComponentProps (context: Component, props: any): any {
      return Object.keys(props ?? {}).reduce((obj: {[key: string]: any}, property: string) => {
        if (this.isPropertyDynamic(property, props?.[property])) {
          obj[this.getDynamicPropertyPlainName(property)] = this.evaluateDynamicValue(context, props?.[property])
        } else {
          obj[property] = props[property]
        }
        return obj
      }, {})
    },
    createSchemaAttributes (context: Component, schema: RendererableSchema): {[key: string]: any} {
      const scoppedSlots: { [key: string]: ScopedSlot | undefined } = {}
      if (schema && schema.scopedSlots) {
        Object.entries(schema.scopedSlots).forEach((e: any) => {
          if (typeof e[1] === 'object') {
            scoppedSlots[e[0]] = (props: any) => (this.genComponentFromSchema(context, e[1]))
          }
        })
        // .filter(child => this.isChildInScoppedSlots(child))
        // .filter(child => this.shouldRenderComponent(child)
        // .map(child => this.$createElement('template', { slot: child.slot }, [this.genComponentFromSchema(context, child)])))
      }
      const props = this.evaluateComponentProps(context, schema?.props ?? {})
      const on = this.evaluateComponentProps(context, schema?.on ?? {})
      const attrs = this.evaluateComponentProps(context, schema?.attrs ?? {})

      if (schema?.['v-model']) {
        props[schema['v-model-property-name'] ?? this.defaultModelProperyName] = this.evaluateDynamicValue(context, schema['v-model'].get)
        on[schema['v-model-event-name'] ?? this.defaultModelEventName] = (value: any) => {
          if (schema?.['v-model']) {
            this.updateDynamicModel(context, schema['v-model'].set, value)
          }
        }
      }

      const preProcessed = {
        class: schema?.class,
        style: schema?.style,
        staticStyle: mergeDeep({}, schema?.staticStyle ?? {}),
        staticClass: schema?.staticClass,
        props,
        on,
        attrs,
        scoppedSlots,
      } as VNodeData
      if (this.postProcess) {
        return this.postProcess(preProcessed)
      }

      return preProcessed
    },
    genComponentsChildrenFrom (context: Component, parent: RendererableSchema): VNodeChildren {
      if (!parent) return null
      if (typeof parent.children === 'string') return parent.children
      if (typeof parent.children === 'function') {
        return parent.children(context)
      }

      return (parent.children ?? [])
        .filter(child => !this.isChildInScoppedSlots(child))
        .filter(child => this.shouldRenderComponent(child))
        .map(child => this.genComponentFromSchema(context, child))
        .concat(
          (parent.children ?? []).filter(child => this.isChildInScoppedSlots(child))
            .filter(child => this.shouldRenderComponent(child))
            .map(child => this.$createElement('template', { slot: child.slot }, [this.genComponentFromSchema(context, child)]))
        )
    },
    genComponentFromSchema (context: Component, schema: RendererableSchema): VNode {
      return this.$createElement(
        this.createSchemaTag(schema),
        this.createSchemaAttributes(context, schema),
        this.genComponentsChildrenFrom(context, schema),
      )
    },
  },
})
