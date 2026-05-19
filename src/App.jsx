import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home';
import JobBoard from './pages/JobBoard';
import Login from './pages/Login';
import Register from './pages/Register';
import PostJob from './pages/PostJob';
import Dashboard from './pages/Dashboard';
import Footer from './components/Footer';
import Navbar from './components/Navbar'; 
import VerifyEmail from './pages/VerifyEmail';
import ProfileSetup from './pages/ProfileSetup';
import MyProfile from './pages/MyProfile'; 
import EditJob from "./pages/EditJob"; 
import SavedJobs from './pages/SavedJobs';
import CompanyProfile from './pages/CompanyProfile';
import AdminDashboard from './pages/AdminDashboard'; 
import LiveChat from './components/LiveChat';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CandidateProfile from './pages/CandidateProfile';
import GlobalChatListener from './components/GlobalChatListener';
import Message from './pages/Message';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import EmployerDashboard from './pages/EmployerDashboard';
import ManageApplicants from './pages/ManageApplicants';
import Settings from './pages/Settings';
import About from './pages/About';
import ChangePassword from './pages/ChangePassword';
import EmployerProfile from './pages/EmployerProfile';
import EmployerSetup from './pages/EmployerSetup';

function App() {
  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen flex flex-col">
      <Router>
        <Navbar />
        
        <LiveChat />
        {/* 🚨 PREMIUM COLORED GLASSMORPHISM TOASTER */}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            // Base styles for the glass shape, blur, and shadow
            style: {
              backdropFilter: 'blur(12px)', 
              WebkitBackdropFilter: 'blur(12px)', 
              boxShadow: '0 8px 32px 0 rgba(15, 23, 42, 0.08)', 
              padding: '16px 20px',
              borderRadius: '1rem', 
              fontFamily: "'Poppins', sans-serif",
              fontWeight: '700',
              fontSize: '14px',
            },
            // SUCCESS: Light Premium Emerald Glass
            success: {
              style: {
                background: 'rgba(236, 253, 245, 0.85)', // Light translucent green
                border: '1px solid rgba(16, 185, 129, 0.3)', // Soft green outline
                color: '#065f46', // Deep emerald text
              },
              iconTheme: { primary: '#10b981', secondary: '#ffffff' }, 
            },
            // ERROR: Light Premium Rose Glass
            error: {
              style: {
                background: 'rgba(255, 241, 242, 0.85)', // Light translucent red
                border: '1px solid rgba(225, 29, 72, 0.3)', // Soft red outline
                color: '#9f1239', // Deep rose text
              },
              iconTheme: { primary: '#e11d48', secondary: '#ffffff' }, 
            }
          }}
        />

        <GlobalChatListener />
      
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<JobBoard />} /> 
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/employer/:id" element={<CompanyProfile />} />
            
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/edit-job/:id" element={<EditJob />} />
            
            <Route path="/candidate/:id" element={<CandidateProfile />} />
            <Route path="/messages" element={<Message />} />
            
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employer-dashboard" element={<EmployerDashboard />} />
            <Route path="/manage-applicants" element={<ManageApplicants />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/user-profile/:id" element={<EmployerProfile />} />
            <Route path="/employer-setup" element={<EmployerSetup />} />
          </Routes>
        </div>
        
        <Footer /> 
      </Router>
    </div>
  );
}

export default App;