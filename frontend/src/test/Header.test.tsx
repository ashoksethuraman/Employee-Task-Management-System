import { fireEvent, render, screen } from '@testing-library/react';
import Header from '../components/Header';

const logoutMock = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Admin User', role: 'ADMIN' },
    logout: logoutMock
  })
}));

vi.mock('../components/NotificationBell', () => ({
  NotificationBell: () => <div data-testid="notif-bell" />
}));

describe('Header', () => {
  beforeEach(() => {
    logoutMock.mockClear();
  });

  it('shows signed-in user details and calls logout', () => {
    render(<Header />);

    expect(screen.getByText('Signed in as')).toBeInTheDocument();
    expect(screen.getByText(/Admin User/)).toBeInTheDocument();
    expect(screen.getByTestId('notif-bell')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
