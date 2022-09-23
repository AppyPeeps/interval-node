import { z } from 'zod'
import { primitiveValue, Literal, IO_RENDER, menuItem } from '../ioSchema'
import { AnyDisplayIOPromise, MenuItem } from '../types'

type EventualString =
  | string
  | Promise<string>
  | (() => string)
  | (() => Promise<string>)

interface BasicLayoutConfig {
  title?: EventualString
  description?: EventualString
  children?: AnyDisplayIOPromise[]
  menuItems?: MenuItem[]
  metadata?: MetaItem[]
}

export interface Layout {
  title?: EventualString
  description?: EventualString
  children?: AnyDisplayIOPromise[]
  menuItems?: MenuItem[]
}

// Base class
export class Basic implements Layout {
  title?: EventualString
  description?: EventualString
  children?: AnyDisplayIOPromise[]
  menuItems?: MenuItem[]
  metadata?: MetaItem[]

  constructor(config: BasicLayoutConfig) {
    this.title = config.title
    this.description = config.description
    this.children = config.children
    this.menuItems = config.menuItems
    this.metadata = config.metadata
  }
}

export type MetaItemValue = Literal | bigint

export interface MetaItem {
  label: string
  value:
    | MetaItemValue
    | Promise<MetaItemValue>
    | (() => MetaItemValue)
    | (() => Promise<MetaItemValue>)
}

export const META_ITEM_SCHEMA = z.object({
  label: z.string(),
  value: primitiveValue.or(z.bigint()).nullish(),
})

export type MetaItemSchema = z.infer<typeof META_ITEM_SCHEMA>

// For superjson (de)serialization
export const META_ITEMS_SCHEMA = z.object({
  json: z.array(META_ITEM_SCHEMA),
  meta: z.any(),
})

export type MetaItemsSchema = z.infer<typeof META_ITEMS_SCHEMA>

export const BASIC_LAYOUT_SCHEMA = z.object({
  kind: z.literal('BASIC'),
  title: z.string().nullish(),
  description: z.string().nullish(),
  children: IO_RENDER.optional(),
  metadata: META_ITEMS_SCHEMA.optional(),
  menuItems: z.array(menuItem).optional(),
})

// To be extended with z.discriminatedUnion when adding different pages
export const LAYOUT_SCHEMA = BASIC_LAYOUT_SCHEMA

export type LayoutSchema = z.infer<typeof LAYOUT_SCHEMA>
export type LayoutSchemaInput = z.input<typeof LAYOUT_SCHEMA>
export type BasicLayoutSchema = z.infer<typeof BASIC_LAYOUT_SCHEMA>
export type BasicLayoutSchemaInput = z.input<typeof BASIC_LAYOUT_SCHEMA>