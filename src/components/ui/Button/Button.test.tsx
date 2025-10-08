import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Test Button');
  });

  test('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies variant styles correctly', () => {
    render(<Button variant="default">Default Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('bg-primary-600');
  });

  test('handles loading state correctly', () => {
    render(<Button loading>Loading Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
  });

  test('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Keyboard Button</Button>);
    const button = screen.getByRole('button');
    
    button.focus();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalled();
  });
});