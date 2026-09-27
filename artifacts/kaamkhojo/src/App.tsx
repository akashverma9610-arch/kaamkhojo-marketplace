import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  CategoryTechniciansPage, CustomerDashboardPage, LandingPage, LoginPage, ProfilePage,
  RoleSelectionPage, TechnicianDashboardPage, TechnicianProfilePage,
  WorkRequestFormPage,
} from '@/pages/KaamPages';
import { EditWorkRequestPage, ManagedWorkRequestDetailsPage, MyWorkRequestsPage } from '@/pages/WorkRequestManagementPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={() => <LoginPage />} />
        <Route path="/register" component={() => <LoginPage register />} />
        <Route path="/role-selection" component={RoleSelectionPage} />
        <Route path="/customer-dashboard" component={CustomerDashboardPage} />
        <Route path="/work-requests" component={MyWorkRequestsPage} />
        <Route path="/work-requests/new" component={WorkRequestFormPage} />
        <Route path="/work-requests/:id/edit" component={EditWorkRequestPage} />
        <Route path="/work-requests/:id" component={ManagedWorkRequestDetailsPage} />
        <Route path="/category/:slug" component={CategoryTechniciansPage} />
        <Route path="/technician/:id" component={TechnicianProfilePage} />
        <Route path="/technician-dashboard" component={TechnicianDashboardPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
