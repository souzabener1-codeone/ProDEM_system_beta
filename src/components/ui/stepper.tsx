import type { HTMLAttributes } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import * as Stepperize from '@stepperize/react'

import { cn } from '@/lib/utils'

type StepperOrientation = 'horizontal' | 'vertical'
type StepState = 'active' | 'completed' | 'inactive' | 'loading'
type StepIndicators = {
  active?: React.ReactNode
  completed?: React.ReactNode
  inactive?: React.ReactNode
  loading?: React.ReactNode
}

type StepDefinition = {
  id: string
  title?: string
  description?: string
  icon?: React.ReactElement
}

interface StepperContextValue {
  stepper: ReturnType<ReturnType<typeof Stepperize.defineStepper>['useStepper']>
  steps: StepDefinition[]
  orientation: StepperOrientation
  configOrientation: StepperOrientation
  responsive?: boolean
  registerTrigger: (node: HTMLButtonElement | null, remove?: boolean) => void
  triggerNodes: HTMLButtonElement[]
  focusNext: (currentIdx: number) => void
  focusPrev: (currentIdx: number) => void
  focusFirst: () => void
  focusLast: () => void
  indicators: StepIndicators
}

interface StepItemContextValue {
  step: StepDefinition
  index: number
  state: StepState
  isDisabled: boolean
  isLoading: boolean
}

const StepperContext = createContext<StepperContextValue | undefined>(undefined)
const StepItemContext = createContext<StepItemContextValue | undefined>(undefined)

function useStepper() {
  const ctx = useContext(StepperContext)
  if (!ctx) throw new Error('useStepper must be used within a Stepper')
  return ctx
}

function useStepItem() {
  const ctx = useContext(StepItemContext)
  if (!ctx) throw new Error('useStepItem must be used within a StepperItem')
  return ctx
}

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  steps: StepDefinition[]
  defaultValue?: string
  orientation?: StepperOrientation
  responsive?: boolean
  indicators?: StepIndicators
  value?: string
  onValueChange?: (value: string) => void
}

function Stepper({
  steps,
  defaultValue,
  orientation = 'horizontal',
  responsive = false,
  className,
  children,
  indicators = {},
  value,
  onValueChange,
  ...props
}: StepperProps) {
  const stepperDefRef = useRef<ReturnType<typeof Stepperize.defineStepper> | null>(null)
  if (stepperDefRef.current === null) {
    stepperDefRef.current = Stepperize.defineStepper(...steps)
  }
  const stepper = stepperDefRef.current.useStepper({ initialStep: defaultValue || steps[0]?.id })

  const [triggerNodes, setTriggerNodes] = useState<HTMLButtonElement[]>([])

  const [isMdUp, setIsMdUp] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : true,
  )

  useEffect(() => {
    if (!responsive) return
    const mql = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMdUp('matches' in e ? e.matches : mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [responsive])

  const registerTrigger = useCallback((node: HTMLButtonElement | null, remove = false) => {
    setTriggerNodes((prev) => {
      if (!node) return prev
      if (remove) return prev.filter((n) => n !== node)
      return prev.includes(node) ? prev : [...prev, node]
    })
  }, [])

  const focusNext = useCallback(
    (currentIdx: number) => triggerNodes[(currentIdx + 1) % triggerNodes.length]?.focus(),
    [triggerNodes],
  )
  const focusPrev = useCallback(
    (currentIdx: number) =>
      triggerNodes[(currentIdx - 1 + triggerNodes.length) % triggerNodes.length]?.focus(),
    [triggerNodes],
  )
  const focusFirst = useCallback(() => triggerNodes[0]?.focus(), [triggerNodes])
  const focusLast = useCallback(
    () => triggerNodes[triggerNodes.length - 1]?.focus(),
    [triggerNodes],
  )

  const effectiveOrientation: StepperOrientation = useMemo(() => {
    if (responsive && orientation === 'horizontal') {
      return isMdUp ? 'horizontal' : 'vertical'
    }
    return orientation
  }, [responsive, orientation, isMdUp])

  const contextValue = useMemo(
    () => ({
      stepper,
      steps,
      orientation: effectiveOrientation,
      configOrientation: orientation,
      responsive,
      registerTrigger,
      focusNext,
      focusPrev,
      focusFirst,
      focusLast,
      triggerNodes,
      indicators,
    }),
    [
      stepper,
      steps,
      effectiveOrientation,
      orientation,
      responsive,
      registerTrigger,
      focusNext,
      focusPrev,
      focusFirst,
      focusLast,
      triggerNodes,
      indicators,
    ],
  )

  useEffect(() => {
    if (typeof value === 'string' && value !== stepper.state.current.data.id) {
      stepper.navigation.goTo(value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => {
    onValueChange?.(stepper.state.current.data.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepper.state.current.data.id])

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        data-slot="stepper"
        data-orientation={effectiveOrientation}
        className={cn('w-full', className)}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  )
}

interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  stepId: string
  completed?: boolean
  disabled?: boolean
  loading?: boolean
}

function StepperItem({
  stepId,
  completed = false,
  disabled = false,
  loading = false,
  className,
  children,
  ...props
}: StepperItemProps) {
  const { stepper, steps, orientation } = useStepper()
  const stepIndex = stepper.lookup.getIndex(stepId)
  const currentIndex = stepper.lookup.getIndex(stepper.state.current.data.id)
  const step = steps.find((s) => s.id === stepId)!

  const state: StepState =
    completed || stepIndex < currentIndex
      ? 'completed'
      : currentIndex === stepIndex
        ? 'active'
        : 'inactive'

  const isLoading = loading && currentIndex === stepIndex

  const ctxValue = useMemo(
    () => ({ step, index: stepIndex, state, isDisabled: disabled, isLoading }),
    [step, stepIndex, state, disabled, isLoading],
  )

  return (
    <StepItemContext.Provider value={ctxValue}>
      <div
        data-slot="stepper-item"
        data-state={state}
        data-orientation={orientation}
        className={cn(
          'group/step flex items-start',
          orientation === 'vertical' ? 'flex-col' : 'flex-row',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </StepItemContext.Provider>
  )
}

interface StepperTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

function StepperTrigger({
  asChild = false,
  className,
  children,
  tabIndex,
  ...props
}: StepperTriggerProps) {
  const { stepper, registerTrigger, triggerNodes, focusNext, focusPrev, focusFirst, focusLast } =
    useStepper()
  const { step, isDisabled } = useStepItem()
  const isSelected = stepper.state.current.data.id === step.id
  const id = `stepper-tab-${step.id}`
  const panelId = `stepper-panel-${step.id}`

  const btnRef = useRef<HTMLButtonElement | null>(null)
  const triggerRef = useCallback(
    (node: HTMLButtonElement | null) => {
      if (node) {
        btnRef.current = node
        registerTrigger(node)
      } else if (btnRef.current) {
        registerTrigger(btnRef.current, true)
        btnRef.current = null
      }
    },
    [registerTrigger],
  )

  const myIdx = useMemo(
    () => triggerNodes.findIndex((n) => n === btnRef.current),
    [triggerNodes],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        if (myIdx !== -1) focusNext(myIdx)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        if (myIdx !== -1) focusPrev(myIdx)
        break
      case 'Home':
        e.preventDefault()
        focusFirst()
        break
      case 'End':
        e.preventDefault()
        focusLast()
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        stepper.navigation.goTo(step.id)
        break
    }
  }

  if (asChild) {
    return (
      <div
        data-slot="stepper-trigger"
        className={cn('inline-flex items-center gap-3', className)}
      >
        {children}
      </div>
    )
  }

  return (
    <button
      ref={triggerRef}
      id={id}
      role="tab"
      type="button"
      aria-selected={isSelected}
      aria-controls={panelId}
      tabIndex={isSelected ? 0 : -1}
      data-slot="stepper-trigger"
      className={cn(
        'inline-flex items-center gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      onClick={() => stepper.navigation.goTo(step.id)}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      {...props}
    >
      {children}
    </button>
  )
}

interface StepperIndicatorProps extends React.ComponentProps<'div'> {
  variant?: 'default' | 'outline'
}

function StepperIndicator({ children, className, variant = 'default' }: StepperIndicatorProps) {
  const { state, isLoading, step } = useStepItem()
  const { indicators } = useStepper()

  const base =
    'relative flex size-8 shrink-0 items-center justify-center overflow-hidden transition-all duration-300 rounded-md text-sm font-medium'

  const defaultClasses = cn(
    'border-background bg-muted data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground ring-offset-background group-data-[state=active]/step:ring-primary/30 group-data-[state=active]/step:ring-2 group-data-[state=active]/step:ring-offset-2',
    base,
  )

  const outlineClasses = cn(
    'bg-transparent border border-primary/20 text-muted-foreground data-[state=completed]:border-foreground data-[state=completed]:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground',
    base,
  )

  const classes = variant === 'outline' ? outlineClasses : defaultClasses

  return (
    <div data-slot="stepper-indicator" data-state={state} className={cn(classes, className)}>
      {(isLoading ? indicators?.loading : indicators?.[state]) ??
        (step?.icon ? step.icon : children)}
    </div>
  )
}

function StepperSeparator({ className }: React.ComponentProps<'div'>) {
  const { state } = useStepItem()
  const { orientation } = useStepper()

  return (
    <div
      data-slot="stepper-separator"
      data-state={state}
      className={cn(
        'bg-muted data-[state=completed]:bg-primary transition-colors',
        orientation === 'vertical' ? 'ms-4 my-1 w-px flex-1 min-h-6' : 'mx-2 h-px flex-1',
        className,
      )}
    />
  )
}

function StepperTitle({ children, className }: React.ComponentProps<'h3'>) {
  const { state } = useStepItem()
  return (
    <h3
      data-slot="stepper-title"
      data-state={state}
      className={cn('text-sm font-semibold text-foreground', className)}
    >
      {children}
    </h3>
  )
}

function StepperDescription({ children, className }: React.ComponentProps<'div'>) {
  const { state } = useStepItem()
  return (
    <div
      data-slot="stepper-description"
      data-state={state}
      className={cn('text-sm text-muted-foreground', className)}
    >
      {children}
    </div>
  )
}

function StepperNav({ children, className }: React.ComponentProps<'nav'>) {
  const { orientation, configOrientation, responsive } = useStepper()

  const responsiveNavClasses =
    responsive && configOrientation === 'horizontal' ? 'flex-col md:flex-row md:w-full' : ''

  return (
    <nav
      data-slot="stepper-nav"
      data-orientation={orientation}
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col' : 'flex-row items-center w-full',
        responsiveNavClasses,
        className,
      )}
      role="tablist"
      aria-orientation={orientation}
    >
      {children}
    </nav>
  )
}

function StepperPanel({ children, className }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="stepper-panel" className={cn('w-full', className)}>
      {children}
    </div>
  )
}

interface StepperContentProps extends React.ComponentProps<'div'> {
  value: string
  forceMount?: boolean
}

function StepperContent({ value, forceMount, children, className }: StepperContentProps) {
  const { stepper } = useStepper()
  const isActive = value === stepper.state.current.data.id
  if (!forceMount && !isActive) return null
  return (
    <div
      data-slot="stepper-content"
      role="tabpanel"
      id={`stepper-panel-${value}`}
      className={cn('w-full', className)}
      hidden={!isActive}
    >
      {children}
    </div>
  )
}

export {
  useStepper,
  useStepItem,
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
  StepperPanel,
  StepperContent,
  StepperNav,
  type StepperProps,
  type StepperItemProps,
  type StepperTriggerProps,
  type StepperContentProps,
}
