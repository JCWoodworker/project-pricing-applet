import { useEffect } from 'react'
import { TreePine } from 'lucide-react'
import { Card } from './components'
import { MaterialSelector } from './features/MaterialSelector'
import { DimensionsInput } from './features/DimensionsInput'
import { CostBreakdown } from './features/CostBreakdown'
import { useWoodPrices } from './api/useWoodPrices'
import { useEstimatorStore } from './store/useEstimatorStore'

function App() {
  const { data: materials, isLoading, isError } = useWoodPrices()
  const hydrateFromWidgetState = useEstimatorStore((state) => state.hydrateFromWidgetState)

  useEffect(() => {
    hydrateFromWidgetState()
  }, [hydrateFromWidgetState])

  return (
    <div className="flex min-h-full w-full items-center justify-center p-6">
      <Card className="w-full max-w-sm rounded-2xl p-6">
        <header className="flex flex-col items-center gap-1.5 text-center">
          <TreePine className="h-6 w-6 text-primary" aria-hidden="true" />
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            Wood Pricing Estimator
          </h1>
          <p className="text-xs text-muted-foreground">
            Estimate the cost of your next build
          </p>
        </header>

        <div className="mt-6">
          {isLoading && (
            <p className="text-center text-sm text-muted-foreground" role="status">
              Loading material pricing…
            </p>
          )}
          {isError && (
            <p className="text-center text-sm text-destructive" role="alert">
              Couldn't load material pricing. Please try again.
            </p>
          )}

          {materials && (
            <div className="flex flex-col gap-4">
              <MaterialSelector materials={materials} />
              <DimensionsInput />
            </div>
          )}
        </div>

        {materials && (
          <div className="mt-6 border-t border-border pt-5">
            <CostBreakdown materials={materials} />
          </div>
        )}
      </Card>
    </div>
  )
}

export default App
