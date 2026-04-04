import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from '@/lib/copilotkit/theme-provider'

function ThemeTestComponent() {
  const { theme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('light', 'dark')
  })

  it('renders children', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">child content</div>
      </ThemeProvider>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('defaults to system theme', () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    )
    expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
  })

  it('applies dark class when theme is set to dark', async () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    )
    const darkBtn = screen.getByText('Set Dark')
    fireEvent.click(darkBtn)
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(document.documentElement.classList.contains('light')).toBe(false)
    })
  })

  it('applies light class when theme is set to light', async () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    )
    const lightBtn = screen.getByText('Set Light')
    fireEvent.click(lightBtn)
    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  it('switches between light and dark correctly', async () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    )
    fireEvent.click(screen.getByText('Set Dark'))
    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
    })

    fireEvent.click(screen.getByText('Set Light'))
    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
    })
  })

  it('useTheme returns default value when used outside ThemeProvider', () => {
    render(<ThemeTestComponent />)
    expect(screen.getByTestId('current-theme')).toHaveTextContent('system')
  })
})
