import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import StatePage from "./pages/StatePage";
import DistrictPage from "./pages/DistrictPage";
import CityProfile from "./pages/CityProfile";
import VillageProfile from "./pages/VillageProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from './pages/AdminDashboard';
import ComparePage from "./pages/ComparePage";
import DevelopmentScorePredictor from './pages/DevelopmentScorePredictor';
import ImportData from "./pages/ImportData";
import RankingsPage from "./pages/RankingsPage";
import MapPage from "./pages/MapPage";

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/states/:id" element={<StatePage />} />
        <Route path="/districts/:id" element={<DistrictPage />} />
        <Route path="/cities/:id" element={<CityProfile />} />
        <Route path="/villages/:id" element={<VillageProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/predict-development-score" element={<DevelopmentScorePredictor />} />
        <Route path="/admin/import" element={<ImportData />} />
        <Route path="/rankings" element={<RankingsPage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </AuthProvider>
  );
}
