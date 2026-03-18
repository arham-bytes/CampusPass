import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import StudentDashboard from './pages/StudentDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateEvent from './pages/CreateEvent';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/:id" element={<EventDetails />} />
                    <Route
                        path="/dashboard"
                        element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>}
                    />
                    <Route
                        path="/organizer"
                        element={<ProtectedRoute roles={['organizer']}><OrganizerDashboard /></ProtectedRoute>}
                    />
                    <Route
                        path="/organizer/create"
                        element={<ProtectedRoute roles={['organizer']}><CreateEvent /></ProtectedRoute>}
                    />
                    <Route
                        path="/admin"
                        element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>}
                    />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}
