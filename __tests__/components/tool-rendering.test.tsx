import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { ToolReasoning } from '@/components/copilotkit/tool-rendering'

describe('ToolReasoning', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders tool name', () => {
    render(<ToolReasoning name="manage_todos" status="complete" />)
    expect(screen.getByText('manage_todos')).toBeInTheDocument()
  })

  it('shows spinner indicator for executing status', () => {
    render(<ToolReasoning name="query_data" status="executing" />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('shows spinner indicator for inProgress status', () => {
    render(<ToolReasoning name="query_data" status="inProgress" />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('shows checkmark for complete status', () => {
    render(<ToolReasoning name="manage_todos" status="complete" />)
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('auto-expands details when executing', () => {
    render(
      <ToolReasoning
        name="query_data"
        status="executing"
        args={{ query: 'select * from patients' }}
      />
    )
    const details = document.querySelector('details')
    expect(details).toHaveAttribute('open')
  })

  it('auto-collapses details when complete', () => {
    render(
      <ToolReasoning
        name="query_data"
        status="complete"
        args={{ query: 'select * from patients' }}
      />
    )
    const details = document.querySelector('details')
    expect(details).not.toHaveAttribute('open')
  })

  it('formats string arguments with quotes', () => {
    render(
      <ToolReasoning
        name="test_tool"
        status="complete"
        args={{ name: 'test_value' }}
      />
    )
    expect(screen.getByText(/"test_value"/)).toBeInTheDocument()
  })

  it('formats array arguments as [N items]', () => {
    render(
      <ToolReasoning
        name="test_tool"
        status="complete"
        args={{ items: [1, 2, 3] }}
      />
    )
    expect(screen.getByText('[3 items]')).toBeInTheDocument()
  })

  it('formats object arguments as {N keys}', () => {
    render(
      <ToolReasoning
        name="test_tool"
        status="complete"
        args={{ data: { a: 1, b: 2 } }}
      />
    )
    expect(screen.getByText('{2 keys}')).toBeInTheDocument()
  })

  it('handles empty args gracefully', () => {
    render(<ToolReasoning name="empty_tool" status="complete" />)
    expect(screen.getByText('empty_tool')).toBeInTheDocument()
    expect(document.querySelector('details')).not.toBeInTheDocument()
  })

  it('handles null args gracefully', () => {
    render(<ToolReasoning name="null_tool" status="complete" args={null as unknown as object} />)
    expect(screen.getByText('null_tool')).toBeInTheDocument()
    expect(document.querySelector('details')).not.toBeInTheDocument()
  })

  it('displays argument key names', () => {
    render(
      <ToolReasoning
        name="test_tool"
        status="complete"
        args={{ patient_id: 'abc123', action: 'read' }}
      />
    )
    expect(screen.getByText('patient_id:')).toBeInTheDocument()
    expect(screen.getByText('action:')).toBeInTheDocument()
  })
})
