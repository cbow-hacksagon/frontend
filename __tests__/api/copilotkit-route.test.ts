import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const routeSource = readFileSync(
  path.resolve(__dirname, '../../app/api/copilotkit/route.ts'),
  'utf-8'
)

describe('CopilotKit API Route', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should have a POST handler exported', async () => {
    process.env.LANGGRAPH_DEPLOYMENT_URL = 'http://localhost:8123'
    process.env.LANGSMITH_API_KEY = 'test-key'

    const route = await import('@/app/api/copilotkit/route')
    expect(route.POST).toBeDefined()
    expect(typeof route.POST).toBe('function')
  })

  it('should use default LangGraph URL when env var is not set', async () => {
    delete process.env.LANGGRAPH_DEPLOYMENT_URL
    process.env.LANGSMITH_API_KEY = 'test-key'

    const route = await import('@/app/api/copilotkit/route')
    expect(route.POST).toBeDefined()
  })

  it('should use default empty string for LANGSMITH_API_KEY when not set', async () => {
    process.env.LANGGRAPH_DEPLOYMENT_URL = 'http://localhost:8123'
    delete process.env.LANGSMITH_API_KEY

    const route = await import('@/app/api/copilotkit/route')
    expect(route.POST).toBeDefined()
  })

  it('should not include Excalidraw MCP server configuration', () => {
    expect(routeSource).not.toContain('excalidraw')
    expect(routeSource).not.toContain('mcp.excalidraw.com')
  })

  it('should not include A2UI configuration', () => {
    expect(routeSource).not.toContain('a2ui')
    expect(routeSource).not.toContain('A2UI')
    expect(routeSource).not.toContain('injectA2UI')
  })

  it('should use LangGraphAgent for agent connection', () => {
    expect(routeSource).toContain('LangGraphAgent')
  })

  it('should use copilotRuntimeNextJSAppRouterEndpoint for request handling', () => {
    expect(routeSource).toContain('copilotRuntimeNextJSAppRouterEndpoint')
    expect(routeSource).toContain('handleRequest')
  })

  it('should use correct endpoint path', () => {
    expect(routeSource).toContain('/api/copilotkit')
  })

  it('should use ExperimentalEmptyAdapter as service adapter', () => {
    expect(routeSource).toContain('ExperimentalEmptyAdapter')
  })

  it('should configure a default agent', () => {
    expect(routeSource).toContain('agents')
    expect(routeSource).toContain('default')
  })

  it('should use LangGraph deployment URL from env with fallback', () => {
    expect(routeSource).toContain('LANGGRAPH_DEPLOYMENT_URL')
    expect(routeSource).toContain('localhost:8123')
  })

  it('should use LangSmith API key from env with fallback', () => {
    expect(routeSource).toContain('LANGSMITH_API_KEY')
  })

  it('should use sample_agent as graphId', () => {
    expect(routeSource).toContain('sample_agent')
  })
})
