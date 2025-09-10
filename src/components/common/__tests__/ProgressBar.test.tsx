import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ProgressBar from '../ProgressBar'

describe('ProgressBar', () => {
  it('renders with basic props', () => {
    render(<ProgressBar current={7} total={10} />)
    
    expect(screen.getByText('70%')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<ProgressBar current={3} total={5} label="Test Progress" />)
    
    expect(screen.getByText('Test Progress')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
  })

  it('handles 100% completion correctly', () => {
    render(<ProgressBar current={10} total={10} />)
    
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('handles overflow correctly', () => {
    render(<ProgressBar current={15} total={10} />)
    
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('applies correct color classes', () => {
    const { container } = render(
      <ProgressBar current={5} total={10} color="green" />
    )
    
    const progressBar = container.querySelector('.bg-green-500')
    expect(progressBar).toBeInTheDocument()
  })

  it('handles click events when label is provided', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    render(<ProgressBar current={3} total={5} label="Test Progress" />)
    
    const progressContainer = screen.getByText('Test Progress').closest('div')?.nextElementSibling
    fireEvent.click(progressContainer!)
    
    expect(alertSpy).toHaveBeenCalledWith('Test Progress: 3/5 (60%)')
    
    alertSpy.mockRestore()
  })
})