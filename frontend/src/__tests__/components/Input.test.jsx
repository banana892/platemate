import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Input from '../../components/ui/Input.jsx'

describe('Input Component', () => {
  it('renders label and input correctly', () => {
    render(<Input label="Email Address" placeholder="enter email" />)
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument()
  })

  it('displays error message and sets aria-invalid', () => {
    render(<Input label="Password" error="Password is required" />)
    const input = screen.getByLabelText(/password/i)

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('fires onChange when value changes', () => {
    const handleChange = vi.fn()
    render(<Input label="Name" onChange={handleChange} />)

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('renders clear button when onClear is provided and fires callback', () => {
    const handleClear = vi.fn()
    render(<Input label="Search" value="test" onClear={handleClear} />)

    const clearButton = screen.getByRole('button', { name: /clear input/i })
    fireEvent.click(clearButton)
    expect(handleClear).toHaveBeenCalledTimes(1)
  })
})
