import { BrowserRouter, Route, Routes } from "react-router-dom";

// Layout
import FrontendLayout from "./components/layout/FrontendLayout";
import ToolRouteGuard from "./components/ToolRouteGuard";

// Main Pages
import Home from "./pages/Home";
import Tools from "./pages/Tools";
import Categories from "./pages/Categories";
import Category from "./pages/Category";

// Information Pages
import Report from "./pages/Report";
import Contact from "./pages/Contact";

// Admin Pages
import LoginMimin from "./pages/LoginMimin";
import DashboardMimin from "./pages/DashboardMimin";

// CTF Subsystem (Standalone Layout)
import DefacementCTF from "./tools/ctf/DefacementCTF";

// Error Pages
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ======================================================
            ERROR PAGES (STANDALONE FULL SCREEN VIEW)
        ====================================================== */}
        <Route path="/404" element={<NotFound />} />

        {/* ======================================================
            DEFACEMENT CTF SUBSYSTEM (STANDALONE INDEPENDENT LAYOUT)
        ====================================================== */}
        <Route path="/ctf/*" element={<DefacementCTF />} />

        {/* ======================================================
            ADMIN / MIMIN (INDEPENDENT LAYOUT)
        ====================================================== */}
        <Route path="/login/mimin" element={<LoginMimin />} />
        <Route path="/mimin/dashboard" element={<DashboardMimin />} />

        {/* ======================================================
            FRONTEND SIDEBAR LAYOUT (DIRECTORY, TOOLS & INFO PAGES)
        ====================================================== */}
        <Route element={<FrontendLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/:toolParam" element={<ToolRouteGuard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/report" element={<Report />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* ======================================================
            404 - NOT FOUND (FULL SCREEN 100VH INDEPENDENT VIEW)
        ====================================================== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
