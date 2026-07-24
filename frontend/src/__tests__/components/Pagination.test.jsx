import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Pagination from '../../components/ui/Pagination.jsx'

describe('Pagination Component', () => {
  it('returns null when totalPages is 1 or less', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders pagination buttons correctly for multiple pages', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />)

    expect(screen.getByRole('navigation', { name: /pagination navigation/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /go to page 1/i })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: /go to page 5/i })).toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
  })

  it('fires onPageChange when clicking next button', () => {
    const handleChange = vi.fn()
    render(<Pagination currentPage={1} totalPages={5} onPageChange={handleChange} />)

    fireEvent.click(screen.getByRole('button', { name: /next page/i }))
    expect(handleChange).toHaveBeenCalledWith(2)
  })
})
