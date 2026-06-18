import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingOverlay from '../components/LoadingOverlay';

describe('LoadingOverlay Component', () => {
  it('does not render when open is false', () => {
    const { container } = render(<LoadingOverlay open={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders title and message when open is true', () => {
    render(
      <LoadingOverlay 
        open={true} 
        title="Custom Title" 
        message="Custom Message" 
      />
    );
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Message')).toBeInTheDocument();
  });

  it('renders the fallback shimmer dots when no steps are provided', () => {
    const { container } = render(<LoadingOverlay open={true} />);
    const dots = container.querySelectorAll('.animate-pulse.rounded-full');
    expect(dots.length).toBe(3);
  });

  it('renders the checklist when steps are provided', () => {
    const steps = ['Step 1', 'Step 2', 'Step 3'];
    render(
      <LoadingOverlay 
        open={true} 
        steps={steps} 
        currentStep={1} 
      />
    );
    
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });
});