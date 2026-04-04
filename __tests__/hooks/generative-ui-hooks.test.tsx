import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import '@/__tests__/mocks/copilotkit'
import {
  mockUseDefaultRenderTool,
  mockUseFrontendTool,
  mockUseComponent,
  mockUseHumanInTheLoop,
  mockAgentState,
  mockAgentIsRunning,
  mockAgentMessages,
} from '@/__tests__/mocks/copilotkit'
import { useGenerativeUIHooks } from '@/lib/copilotkit/generative-ui-hooks'

describe('Generative UI Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAgentState.mockReturnValue({})
    mockAgentIsRunning.mockReturnValue(false)
    mockAgentMessages.mockReturnValue([])
  })

  it('registers default render tool when hook is called', () => {
    renderHook(() => useGenerativeUIHooks())

    expect(mockUseDefaultRenderTool).toHaveBeenCalledTimes(1)
    const callArgs = mockUseDefaultRenderTool.mock.calls[0][0]
    expect(callArgs).toHaveProperty('render')
    expect(typeof callArgs.render).toBe('function')
  })

  it('registers frontend tool for theme toggle', () => {
    renderHook(() => useGenerativeUIHooks())

    expect(mockUseFrontendTool).toHaveBeenCalledTimes(1)
    const callArgs = mockUseFrontendTool.mock.calls[0][0]
    expect(callArgs.name).toBe('toggleTheme')
    expect(callArgs).toHaveProperty('handler')
    expect(typeof callArgs.handler).toBe('function')
  })

  it('frontend tool handler is callable', async () => {
    renderHook(() => useGenerativeUIHooks())

    const callArgs = mockUseFrontendTool.mock.calls[0][0]
    await expect(callArgs.handler()).resolves.not.toThrow()
  })

  it('does not register chart-related components', () => {
    renderHook(() => useGenerativeUIHooks())

    expect(mockUseComponent).not.toHaveBeenCalled()
  })

  it('does not register meeting scheduler', () => {
    renderHook(() => useGenerativeUIHooks())

    expect(mockUseHumanInTheLoop).not.toHaveBeenCalled()
  })
})
