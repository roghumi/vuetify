import Vue from 'vue'
import { AsyncComponentFactory } from 'vue/types/options'
import { VNodeData } from 'vue/types/umd'

export type RendererDynamicProperty = (context: any) => any
export type RendererDynamicUpdate = (context: any, value: any) => any

export interface RendererableSchema extends VNodeData {
  parent?: RendererableSchema|null
  children?: RendererDynamicProperty | RendererableSchema[] | string
  'v-for'?: RendererDynamicProperty | number
  'v-model'?: {
    set: RendererDynamicUpdate
    get: RendererDynamicProperty
  }
  'v-model-property-name'?: string
  'v-model-event-name'?: string
  'v-hide'?: boolean | string | string[] | RendererDynamicProperty
  factory?: AsyncComponentFactory
}

export interface SchemaItemMaker {
  id: string
  title: string
  form?: RendererableSchema
  genNewEmptyItem(): any
}
