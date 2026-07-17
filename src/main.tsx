import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { installMockBridge } from './lib/openaiBridge'
import { sampleCatalog } from './lib/sampleCatalog'

// Outside ChatGPT (e.g. plain `vite dev`), stand in for the host bridge so
// callTool()/setWidgetState() calls succeed instead of failing outright.
if (import.meta.env.DEV) {
  installMockBridge(sampleCatalog)
}

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
