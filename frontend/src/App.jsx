import { Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './components/home-page';
import { AppLayout } from './components/site';
import { ServicePage } from './components/service-page';
import { AboutPage } from './components/about-page';
import { AuthPage } from './components/auth-page';
import { GoogleAuthSuccessPage } from './components/google-auth-success-page';
import { WhyChooseUsPage } from './components/why-choose-us-page';
import { CheckoutPage } from './components/checkout-page';
import { PaymentSuccessPage } from './components/payment-success-page';
import { UserDashboardPage } from './components/user-dashboard-page';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about-instructor" element={<AboutPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/why-choose-us" element={<WhyChooseUsPage />} />
        <Route path="/services/:slug" element={<ServicePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/dashboard" element={<UserDashboardPage />} />
        <Route path="/profile" element={<UserDashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/google/success" element={<GoogleAuthSuccessPage />} />
    </Routes>
  );
}

export default App;
