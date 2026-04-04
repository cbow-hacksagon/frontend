import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/__tests__/mocks/copilotkit'
import { mockUseAgent, mockAgentState, mockAgentIsRunning, mockAgentMessages } from '@/__tests__/mocks/copilotkit'
import { DebugPanel } from '@/components/copilotkit/debug-panel'

describe('DebugPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAgentState.mockReturnValue({
      Imaging: [],
      todos: [],
    })
    mockAgentIsRunning.mockReturnValue(false)
    mockAgentMessages.mockReturnValue([
      { id: 'msg-1', role: 'user', content: 'Hello', timestamp: Date.now() },
      { id: 'msg-2', role: 'assistant', content: 'Hi there', timestamp: Date.now() },
    ])
  })

  it('renders the debug FAB toggle button', () => {
    render(<DebugPanel />)
    const fab = screen.getByRole('button', { name: /toggle debug panel/i })
    expect(fab).toBeInTheDocument()
  })

  it('panel is hidden by default', () => {
    render(<DebugPanel />)
    expect(screen.queryByRole('complementary', { name: /debug panel/i })).not.toBeInTheDocument()
  })

  it('panel opens when FAB is clicked', async () => {
    const user = userEvent.setup()
    render(<DebugPanel />)

    const fab = screen.getByRole('button', { name: /toggle debug panel/i })
    await user.click(fab)

    expect(screen.getByRole('complementary', { name: /debug panel/i })).toBeInTheDocument()
  })

  it('displays agent running status', async () => {
    const user = userEvent.setup()
    mockAgentIsRunning.mockReturnValue(true)

    render(<DebugPanel />)

    const fab = screen.getByRole('button', { name: /toggle debug panel/i })
    await user.click(fab)

    expect(screen.getByText(/agent running/i)).toBeInTheDocument()
  })

  it('displays agent idle status when not running', async () => {
    const user = userEvent.setup()
    mockAgentIsRunning.mockReturnValue(false)

    render(<DebugPanel />)

    const fab = screen.getByRole('button', { name: /toggle debug panel/i })
    await user.click(fab)

    expect(screen.getByText(/agent idle/i)).toBeInTheDocument()
  })

  it('displays full agent state as JSON', async () => {
    const user = userEvent.setup()
    mockAgentState.mockReturnValue({
      Imaging: [{ id: 1, description: 'test' }],
      todos: [],
    })

    render(<DebugPanel />)

    const fab = screen.getByRole('button', { name: /toggle debug panel/i })
    await user.click(fab)

    expect(screen.getAllByText(/full agent state/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/"Imaging"/)).toBeInTheDocument()
  })

  it('displays state keys summary', async () => {
    const user = userEvent.setup()
    mockAgentState.mockReturnValue({
      Imaging: [],
      todos: [],
      messages: [],
    })

    render(<DebugPanel />)

    const fab = screen.getByRole('button', { name: /toggle debug panel/i })
    await user.click(fab)

    expect(screen.getByText(/state keys/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Imaging/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/todos/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/messages/).length).toBeGreaterThanOrEqual(1)
  })

  it('displays messages list with roles and content', async () => {
    const user = userEvent.setup()
    mockAgentMessages.mockReturnValue([
      { id: 'msg-1', role: 'user', content: 'Hello doctor', timestamp: Date.now() },
      { id: 'msg-2', role: 'assistant', content: 'How can I help?', timestamp: Date.now() },
    ])

    render(<DebugPanel />)

    const fab = screen.getByRole('button', { name: /toggle debug panel/i })
    await user.click(fab)

    expect(screen.getByText(/messages/i)).toBeInTheDocument()
    expect(screen.getByText(/user/i)).toBeInTheDocument()
    expect(screen.getByText(/assistant/i)).toBeInTheDocument()
  })

  it('displays imaging section with count', async () => {
    const user = userEvent.setup()
    mockAgentState.mockReturnValue({
      Imaging: [
        { id: 1, description: 'chest X-ray' },
        { id: 2, description: 'MRI scan' },
      ],
    })

    render(<DebugPanel />)

    const fab = screen.getByRole('button', { name: /toggle debug panel/i })
    await user.click(fab)

    expect(screen.getAllByText(/imaging/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/2 images/i)).toBeInTheDocument()
  })

  it('panel closes when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<DebugPanel />)

    const fab = screen.getByRole('button', { name: /toggle debug panel/i })
    await user.click(fab)
    expect(screen.getByRole('complementary', { name: /debug panel/i })).toBeInTheDocument()

    const closeBtn = screen.getByRole('button', { name: /close debug/i })
    await user.click(closeBtn)

    expect(screen.queryByRole('complementary', { name: /debug panel/i })).not.toBeInTheDocument()
  })

  it('shows connection status', async () => {
    const user = userEvent.setup()
    render(<DebugPanel />)

    const fab = screen.getByRole('button', { name: /toggle debug panel/i })
    await user.click(fab)

    expect(screen.getByText(/connection/i)).toBeInTheDocument()
  })
})
