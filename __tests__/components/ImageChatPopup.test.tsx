import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/__tests__/mocks/copilotkit'
import { mockUseCoAgent, mockAgentState } from '@/__tests__/mocks/copilotkit'
import { ImageChatPopup } from '@/components/copilotkit/ImageChatPopup'

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}))

describe('ImageChatPopup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCoAgent.mockReturnValue({
      state: { Imaging: [] },
      setState: vi.fn(),
    })
  })

  it('renders the image upload FAB button', () => {
    render(<ImageChatPopup />)
    const fab = screen.getByRole('button', { name: /upload image/i })
    expect(fab).toBeInTheDocument()
  })

  it('opens popup when FAB is clicked', async () => {
    const user = userEvent.setup()
    render(<ImageChatPopup />)

    const fab = screen.getByRole('button', { name: /upload image/i })
    await user.click(fab)

    expect(screen.getByText(/add image to agent/i)).toBeInTheDocument()
  })

  it('closes popup when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<ImageChatPopup />)

    const fab = screen.getByRole('button', { name: /upload image/i })
    await user.click(fab)
    expect(screen.getByText(/add image to agent/i)).toBeInTheDocument()

    const closeBtn = screen.getByRole('button', { name: /close/i })
    await user.click(closeBtn)

    await waitFor(() => {
      expect(screen.queryByText(/add image to agent/i)).not.toBeInTheDocument()
    })
  })

  it('shows image count badge when images exist in state', () => {
    mockUseCoAgent.mockReturnValue({
      state: { Imaging: [{ id: 1, base64: 'abc', mimeType: 'image/png', description: 'test' }] },
      setState: vi.fn(),
    })

    render(<ImageChatPopup />)

    const badge = screen.getByText('1')
    expect(badge).toBeInTheDocument()
  })

  it('does not show badge when no images in state', () => {
    render(<ImageChatPopup />)

    const fab = screen.getByRole('button', { name: /upload image/i })
    const badge = fab.querySelector('span')
    expect(badge).not.toBeInTheDocument()
  })

  it('has a file input for image selection', async () => {
    const user = userEvent.setup()
    render(<ImageChatPopup />)

    const fab = screen.getByRole('button', { name: /upload image/i })
    await user.click(fab)

    const dropZone = screen.getByText(/drop image or/i)
    expect(dropZone).toBeInTheDocument()

    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveAttribute('accept', 'image/*')
  })

  it('has a description textarea', async () => {
    const user = userEvent.setup()
    render(<ImageChatPopup />)

    const fab = screen.getByRole('button', { name: /upload image/i })
    await user.click(fab)

    const textarea = screen.getByPlaceholderText(/describe this image/i)
    expect(textarea).toBeInTheDocument()
  })

  it('has a submit button that is disabled without image', async () => {
    const user = userEvent.setup()
    render(<ImageChatPopup />)

    const fab = screen.getByRole('button', { name: /upload image/i })
    await user.click(fab)

    const submitBtn = screen.getByRole('button', { name: /add to agent state/i })
    expect(submitBtn).toBeDisabled()
  })

  it('calls setState with new image on successful submit', async () => {
    const setState = vi.fn()
    mockUseCoAgent.mockReturnValue({
      state: { Imaging: [] },
      setState,
    })

    render(<ImageChatPopup />)

    const fab = screen.getByRole('button', { name: /upload image/i })
    await userEvent.setup().click(fab)

    const textarea = screen.getByPlaceholderText(/describe this image/i)
    await userEvent.type(textarea, 'chest X-ray')

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(fileInput, 'files', { value: [file] })
    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(screen.getByAltText('preview')).toBeInTheDocument()
    })

    const submitBtn = screen.getByRole('button', { name: /add to agent state/i })
    expect(submitBtn).not.toBeDisabled()
    await userEvent.setup().click(submitBtn)

    await waitFor(() => {
      expect(setState).toHaveBeenCalledWith({
        Imaging: expect.arrayContaining([
          expect.objectContaining({
            description: 'chest X-ray',
            mimeType: 'image/png',
          }),
        ]),
      })
    })
  })

  it('clears preview when cancel is clicked on preview', async () => {
    render(<ImageChatPopup />)

    const fab = screen.getByRole('button', { name: /upload image/i })
    await userEvent.setup().click(fab)

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(fileInput, 'files', { value: [file] })
    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(screen.getByAltText('preview')).toBeInTheDocument()
    })

    const removeBtn = screen.getByRole('button', { name: /remove/i })
    await userEvent.setup().click(removeBtn)

    await waitFor(() => {
      expect(screen.queryByAltText('preview')).not.toBeInTheDocument()
    })
  })

  it('shows error for non-image file type', async () => {
    render(<ImageChatPopup />)

    const fab = screen.getByRole('button', { name: /upload image/i })
    await userEvent.setup().click(fab)

    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(fileInput, 'files', { value: [file] })
    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument()
    })
  })

  it('shows error for file exceeding 5MB', async () => {
    render(<ImageChatPopup />)

    const fab = screen.getByRole('button', { name: /upload image/i })
    await userEvent.setup().click(fab)

    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.png', { type: 'image/png' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(fileInput, 'files', { value: [largeFile] })
    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(screen.getByText(/file too large/i)).toBeInTheDocument()
    })
  })
})
