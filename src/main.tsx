import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { installMockBridge } from './lib/openaiBridge'
import { sampleMaterials } from './lib/sampleMaterials'

// Outside ChatGPT (e.g. plain `vite dev`), stand in for the host bridge so
// widget-state get/set calls succeed instead of silently no-op-ing.
if (import.meta.env.DEV) {
  installMockBridge(sampleMaterials)
}

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
