import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Badge from '../Badge'

describe('Badge', () => {
  it('renders with default props', () => {
    render(<Badge>Test Badge</Badge>)
    
    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('applies correct variant classes', () => {
    const { container } = render(<Badge variant="success">Success</Badge>)
    
    const badge = container.querySelector('.bg-green-100')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('text-green-800')
  })

  it('applies correct size classes', () => {
    const { container } = render(<Badge size="lg">Large Badge</Badge>)
    
    const badge = container.querySelector('.px-4')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('py-2', 'text-base')
  })

  it('combines variant and size classes correctly', () => {
    const { container } = render(
      <Badge variant="error" size="sm">Error Badge</Badge>
    )
    
    const badge = container.querySelector('.bg-red-100')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('text-red-800', 'px-2', 'py-1', 'text-xs')
  })
})