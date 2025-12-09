import { createBrowserRouter, Outlet } from "react-router-dom";
import React from "react";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import HomePage from "../pages/HomePage.jsx";
import EventPage from "../pages/EventPage.jsx";
import AdminDashboard from "../pages/AdminDashboard.jsx";
import OrganizerDashboard from "../pages/OrganizerDashboard.jsx";
import AttendeeDashboard from "../pages/AttendeeDashboard.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";


const router = createBrowserRouter([
  { path: "/", element: 
    <>
      <Navbar />
        <div style={{ width: "100%", minHeight: "90vh", padding: "2rem" }}>
          <Outlet />
        </div>
      <Footer />
    </>, 
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      // Event route
      { path: "events/:id", element: <EventPage /> },
      { path: "admin/dashboard", element: 
        <ProtectedRoute allowed='admin'>
          <AdminDashboard /> 
        </ProtectedRoute>
      },
      { path: "organizer/dashboard", element:
        <ProtectedRoute allowed='organizer'>
          <OrganizerDashboard /> 
        </ProtectedRoute>
      },
      { path: "attendee/dashboard", element: 
        <ProtectedRoute allowed='attendee'>
          <AttendeeDashboard /> 
        </ProtectedRoute>
      },
    ]
  }, 
]);

export default router;