import { vi } from 'vitest'

export const mockAgentState = vi.fn().mockReturnValue({})
export const mockAgentIsRunning = vi.fn().mockReturnValue(false)
export const mockAgentMessages = vi.fn().mockReturnValue([])
export const mockAgentSetState = vi.fn()
export const mockAgentAddMessage = vi.fn()
export const mockAgentRunAgent = vi.fn()

export const mockUseAgent = vi.fn().mockReturnValue({
  agent: {
    get state() { return mockAgentState() },
    get isRunning() { return mockAgentIsRunning() },
    get messages() { return mockAgentMessages() },
    setState: mockAgentSetState,
    addMessage: mockAgentAddMessage,
    runAgent: mockAgentRunAgent,
  },
})

export const mockUseCoAgent = vi.fn().mockReturnValue({
  state: {},
  setState: vi.fn(),
})

export const mockUseDefaultRenderTool = vi.fn()
export const mockUseFrontendTool = vi.fn()
export const mockUseComponent = vi.fn()
export const mockUseHumanInTheLoop = vi.fn()
export const mockUseConfigureSuggestions = vi.fn()

export const mockUseCopilotKit = vi.fn().mockReturnValue({
  runtimeUrl: '/api/copilotkit',
})

vi.mock('@copilotkit/react-core/v2', () => ({
  useAgent: (...args: unknown[]) => mockUseAgent(...args),
  useCoAgent: (...args: unknown[]) => mockUseCoAgent(...args),
  useDefaultRenderTool: (...args: unknown[]) => mockUseDefaultRenderTool(...args),
  useFrontendTool: (...args: unknown[]) => mockUseFrontendTool(...args),
  useComponent: (...args: unknown[]) => mockUseComponent(...args),
  useHumanInTheLoop: (...args: unknown[]) => mockUseHumanInTheLoop(...args),
  useConfigureSuggestions: (...args: unknown[]) => mockUseConfigureSuggestions(...args),
  useCopilotKit: () => mockUseCopilotKit(),
}))

vi.mock('@copilotkit/react-core', () => ({
  CopilotKit: ({ children }: { children: React.ReactNode }) => children,
  useAgent: (...args: unknown[]) => mockUseAgent(...args),
  useCoAgent: (...args: unknown[]) => mockUseCoAgent(...args),
}))

vi.mock('@copilotkit/react-ui', () => ({
  CopilotChat: () => <div data-testid="copilot-chat">CopilotChat</div>,
}))
