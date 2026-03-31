import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import AddArtists from "./pages/Artists/AddArtists";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./pages/AuthPages/ProtectedRoute";
import CategoriesList from "./pages/ArtForms/Categories/CategoriesList";
import AddCategories from "./pages/ArtForms/Categories/AddCategory";
import ArtDetailLists from "./pages/ArtForms/ArtDetails/ArtDetailsLists";
import AddArtDetails from "./pages/ArtForms/ArtDetails/AddArtDetails";
import EventsLists from "./pages/Events/EventsLists";
import AddEvents from "./pages/Events/AddEvents";
import ContibutionLists from "./pages/Contibutions/ContributionLists";
import { useEffect } from "react";
import { autoLogout } from "./pages/AuthPages/Auth";
import ApplicationsList from "./pages/Applications/ApplicationsList";
import EventApplicationsList from "./pages/Applications/EventApplicationsList";
import ArtistsLists from "./pages/Artists/ArtistsList";
import ArtistSubmissions from "./pages/Artists/ArtistSubmissions";
import ArtistRejections from "./pages/Artists/ArtistRejections";
import DeletedArtists from "./pages/Artists/DeletedArtists";
import ContactRequestsList from "./pages/ContactRequests/UserContact";
import ArtistRequestsList from "./components/ArtistRequest/ArtistRequestList";
import DeletedEventsPage from "./pages/Events/DeletedEvents";
import EventRejections from "./pages/Events/EventRejections";
import EventSubmissions from "./pages/Events/EventSubmissions";

export default function App() {
  useEffect(() => {
    autoLogout();
    // startIdleLogout(10);
  }, []);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
            <Route index path="/" element={<Home />} />

            <Route path="/artist-requests" element={<ArtistRequestsList />} />

            {/* Others Page */}
            {/* <Route path="/profile" element={<UserProfiles />} /> */}
            <Route path="/artists" element={<ArtistsLists />} />
            <Route path="/artists/add" element={<AddArtists />} />
            <Route path="/artists/artist-submissions" element={<ArtistSubmissions />} />
            <Route path="/artists/artist-rejections" element={<ArtistRejections />} />
            <Route path="/artists/deleted" element={<DeletedArtists />} />

            {/* Art Forms */}
            <Route path="/categories" element={<CategoriesList />} />
            <Route path="/categories/add" element={<AddCategories />} />
            <Route path="/art-details" element={<ArtDetailLists />} />
            <Route path="/art-details/add" element={<AddArtDetails />} />

            {/* Events */}
            <Route path="/events" element={<EventsLists />} />
            <Route path="/events/add" element={<AddEvents />} />
            <Route path="/events/pending" element={<EventSubmissions />} />
            <Route path="/events/rejected" element={<EventRejections />} />
            <Route path="/events/deleted" element={<DeletedEventsPage />} />


            {/* Contributes */}
            <Route path="/contributions" element={<ContibutionLists />} />

            {/* Art Form Applications */}
            <Route path="/applications" element={<ApplicationsList />} />

            {/* Event Applications */}
            <Route
              path="/eventApplications"
              element={<EventApplicationsList />}
            />
              {/* Contact Requests */}
              <Route
              path="/contact-requests"
              element={<ContactRequestsList />}
             />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
