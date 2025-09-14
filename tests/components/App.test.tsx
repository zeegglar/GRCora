import { render, screen } from '@testing-library/react';
import App from '../../App';

// Mock the EnvironmentNotice component
jest.mock('../../components/setup/EnvironmentNotice', () => {
  return function MockEnvironmentNotice() {
    return <div data-testid="environment-notice">Environment Notice</div>;
  };
});

describe('App', () => {
  it('renders environment notice when Supabase is not configured', () => {
    // Mock isSupabaseConfigured to false for this test
    jest.doMock('../../services/supabaseClient', () => ({
      isSupabaseConfigured: false,
      supabase: {}
    }));

    render(<App />);
    expect(screen.getByTestId('environment-notice')).toBeInTheDocument();
  });

  it('renders loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});