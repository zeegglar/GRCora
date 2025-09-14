import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../../App';

// Mock the EnvironmentNotice component
vi.mock('../../components/setup/EnvironmentNotice', () => ({
  default: function MockEnvironmentNotice() {
    return <div data-testid="environment-notice">Environment Notice</div>;
  }
}));

describe('App', () => {
  it('renders loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeTruthy();
  });
});