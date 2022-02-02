import { z } from 'zod'
import { ioSchema } from './ioSchema'

type IoSchema = typeof ioSchema
export interface ComponentInstance<MN extends keyof IoSchema> {
  methodName: MN
  label: string
  props?: z.infer<IoSchema[MN]['props']>
  state: z.infer<IoSchema[MN]['state']>
}

export interface ComponentType<MN extends keyof IoSchema> {
  onStateChange: (fn: () => void) => void
  schema: IoSchema[MN]
  label: string
  getInstance: () => ComponentInstance<MN>
  getRenderInfo: () => ComponentRenderInfo<MN>
  returnValue: Promise<ComponentReturnValue<MN>>
  setState: (
    newState: z.infer<IoSchema[MN]['state']>
  ) => Promise<ComponentInstance<MN>>
  setProps: (newProps: z.infer<IoSchema[MN]['props']>) => void
  setReturnValue: (value: z.infer<IoSchema[MN]['returns']>) => void
}

export type ComponentRenderInfo<MN extends keyof IoSchema> = Pick<
  ComponentInstance<MN>,
  'methodName' | 'label' | 'props'
>

export type ComponentReturnValue<MN extends keyof IoSchema> = z.infer<
  IoSchema[MN]['returns']
>

export type ComponentTypeMap = {
  [MethodName in keyof IoSchema]: ComponentType<MethodName>
}

export type AnyComponentType = ComponentTypeMap[keyof IoSchema]

const component = <MN extends keyof IoSchema>(
  methodName: MN,
  label: string,
  initialProps?: z.infer<IoSchema[MN]['props']>,
  handleStateChange?: (
    incomingState: z.infer<IoSchema[MN]['state']>
  ) => Promise<z.infer<IoSchema[MN]['props']>>
): ComponentType<MN> => {
  const instance: ComponentInstance<MN> = {
    methodName,
    label,
    props: initialProps,
    state: null,
  }

  let onStateChangeHandler: (() => void) | null = null

  let resolver: ((v: ComponentReturnValue<MN>) => void) | null = null
  const returnValue = new Promise<ComponentReturnValue<MN>>(resolve => {
    resolver = resolve
  })

  const schema = ioSchema[methodName]

  function setReturnValue(value: z.infer<IoSchema[MN]['returns']>) {
    const parsed = schema.returns.parse(value)
    if (resolver) {
      resolver(parsed)
    }
  }

  async function setState(
    newState: z.infer<IoSchema[MN]['state']>
  ): Promise<ComponentInstance<MN>> {
    const parsedState = schema.state.parse(newState)
    if (handleStateChange) {
      instance.props = await handleStateChange(parsedState)
    }
    if (parsedState !== null && !handleStateChange) {
      console.warn(
        'Received non-null state, but no method was defined to handle.'
      )
    }
    console.log('set state!', onStateChangeHandler)
    onStateChangeHandler && onStateChangeHandler()
    return instance
  }

  function setProps(newProps: z.infer<IoSchema[MN]['props']>) {
    instance.props = newProps
    onStateChangeHandler && onStateChangeHandler()
  }

  function getInstance() {
    return instance
  }

  function getRenderInfo(): ComponentRenderInfo<MN> {
    return {
      methodName: instance.methodName,
      label: instance.label,
      props: instance.props,
    }
  }

  return {
    onStateChange: (fn: () => void) => {
      onStateChangeHandler = fn
    },
    schema,
    label,
    getInstance,
    getRenderInfo,
    returnValue,
    setState,
    setProps,
    setReturnValue,
  }
}

export default component