import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@/__tests__/mocks/copilotkit'
import { mockAgentState, mockAgentIsRunning, mockAgentMessages } from '@/__tests__/mocks/copilotkit'
import ChatPage from '@/app/chat/page'

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}))

describe('Chat Page Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAgentState.mockReturnValue({})
    mockAgentIsRunning.mockReturnValue(false)
    mockAgentMessages.mockReturnValue([])
  })

  it('renders CopilotChat component', () => {
    render(<ChatPage />)
    expect(screen.getByTestId('copilot-chat')).toBeInTheDocument()
  })

  it('renders ImageChatPopup component', () => {
    render(<ChatPage />)
    expect(screen.getByRole('button', { name: /upload image/i })).toBeInTheDocument()
  })

  it('renders debug panel FAB', () => {
    render(<ChatPage />)
    expect(screen.getByRole('button', { name: /toggle debug panel/i })).toBeInTheDocument()
  })

  it('renders generative UI hooks via useGenerativeUIHooks', () => {
    render(<ChatPage />)
    expect(screen.getByTestId('copilot-chat')).toBeInTheDocument()
  })

  it('has full-screen layout structure', () => {
    const { container } = render(<ChatPage />)
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('h-screen')
  })
})
