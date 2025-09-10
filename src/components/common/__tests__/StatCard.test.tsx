import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StatCard from '../StatCard'
import { Award } from 'lucide-react'

describe('StatCard', () => {
  it('renders with basic props', () => {
    render(
      <StatCard
        title="Test Title"
        value="42"
        icon={Award}
        color="blue"
      />
    )
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('shows change indicator when provided', () => {
    render(
      <StatCard
        title="Test Title"
        value="42"
        icon={Award}
        color="blue"
        change={{ value: 10, type: 'increase' }}
      />
    )
    
    expect(screen.getByText('+10%')).toBeInTheDocument()
    expect(screen.getByText('vs. mês anterior')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    render(
      <StatCard
        title="Test Title"
        value="42"
        icon={Award}
        color="blue"
      />
    )
    
    fireEvent.click(screen.getByRole('button'))
    expect(alertSpy).toHaveBeenCalledWith('Test Title: 42\nClique para ver detalhes')
    
    alertSpy.mockRestore()
  })

  it('applies correct color classes', () => {
    const { container } = render(
      <StatCard
        title="Test Title"
        value="42"
        icon={Award}
        color="green"
      />
    )
    
    const iconContainer = container.querySelector('.bg-green-50')
    expect(iconContainer).toBeInTheDocument()
  })
})