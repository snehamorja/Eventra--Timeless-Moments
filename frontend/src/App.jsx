import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// New Simplified Logic Pages
import SimpleAdminDashboard from './pages/SimpleAdminDashboard';

// Restored Original Content Pages
import HomePage from './pages/HomePage';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Careers from './pages/Careers';
import Login from './pages/LoginPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';
import Register from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';

// Wedding Section Restored Pages
import Dashboard from './pages/Dashboard';
import DecorationCatalogue from './pages/DecorationCatalogue';
import BookingForm from './pages/BookingForm';
import EventSelectionPage from './pages/EventSelectionPage';
import LocalWeddingFormPage from './pages/LocalWeddingFormPage';
import EventBasicInfoPage from './pages/EventBasicInfoPage';
import CateringPage from './pages/CateringPage';
import PerformersPage from './pages/PerformersPage';
import ServicesPage from './pages/ServicesPage';
import InvoicePage from './pages/InvoicePage';
import DecorationPage from './pages/DecorationPage';
import MyBookingsPage from './pages/MyBookingsPage';
import EventDetailsExplorer from './pages/EventDetailsExplorer';
import ConcertsPage from './pages/ConcertsPage';
import FestivalsPage from './pages/FestivalsPage';
import SportsEventsPage from './pages/SportsEventsPage';
import ProfilePage from './pages/ProfilePage';


import PrivateRoute from './components/PrivateRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import { FormProvider } from './contexts/FormContext';
import ScrollToTop from './components/ScrollToTop';

const App = () => {
    return (
        <FormProvider>
            <BrowserRouter>
                <ScrollToTop />
                <Routes>
                    {/* Main Site Pages (Accessible to both Users and Admins) */}
                    <Route element={<RoleBasedRoute allowedRoles={['USER', 'ADMIN']} />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/gallery" element={<Gallery />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:id" element={<BlogPost />} />
                        <Route path="/careers" element={<Careers />} />

                        {/* Restored Wedding Routes */}
                        <Route path="/events" element={<Navigate to="/event-selection" replace />} />
                        <Route path="/catering" element={<CateringPage />} />
                        <Route path="/dashboard" element={<EventDetailsExplorer />} />
                        <Route path="/event-selection" element={<EventSelectionPage />} />
                        <Route path="/dashboard-grid" element={<Dashboard />} />
                        <Route path="/wedding-details" element={<LocalWeddingFormPage />} />
                        <Route path="/decoration-catalogue" element={<DecorationCatalogue />} />
                        <Route path="/book-event" element={<BookingForm />} />
                        <Route path="/event-details" element={<EventBasicInfoPage />} />
                        <Route path="/my-bookings" element={<MyBookingsPage />} />
                        <Route path="/performers" element={<PerformersPage />} />
                        <Route path="/decoration" element={<DecorationPage />} />
                        <Route path="/services" element={<ServicesPage />} />
                        <Route path="/invoice" element={<InvoicePage />} />
                        <Route path="/concerts" element={<ConcertsPage />} />
                        <Route path="/festivals" element={<FestivalsPage />} />
                        <Route path="/sports" element={<SportsEventsPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/privacy" element={<PrivacyPage />} />
                        <Route path="/terms" element={<TermsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>

                    {/* Admin-Only Pages (Strictly Restricted from Users) */}
                    <Route element={<RoleBasedRoute allowedRoles={['ADMIN']} />}>
                        <Route path="/admin-dashboard" element={<SimpleAdminDashboard />} />
                    </Route>

                    {/* Public Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin-login" element={<AdminLoginPage />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </FormProvider>
    );
};

export default App;
