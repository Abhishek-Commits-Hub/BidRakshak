import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Review from "./pages/Review";
import Analysis from "./pages/tenders/Analysis";
import EvidencePage from "./pages/tenders/Evidence";
import ReportPage from "./pages/tenders/Report";
import RequirementDetail from "./pages/tenders/RequirementDetail";
import Requirements from "./pages/tenders/Requirements";
import RiskPage from "./pages/tenders/Risk";
import TenderOverview from "./pages/tenders/TenderOverview";
import UploadDocument from "./pages/tenders/UploadDocument";
import Verification from "./pages/tenders/Verification";

export default function App() {
    return (
        <Routes>
            <Route
                path="/login"
                element={<Login />}
            />

            <Route element={<AppLayout />}>
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/tenders/:tenderId"
                    element={<TenderOverview />}
                />

                <Route
                    path="/tenders/:tenderId/analysis"
                    element={<Analysis />}
                />

                <Route
                    path="/tenders/:tenderId/requirements"
                    element={<Requirements />}
                />

                <Route
                    path="/tenders/:tenderId/requirements/:requirementId"
                    element={<RequirementDetail />}
                />

                <Route
                    path="/tenders/:tenderId/evidence"
                    element={<EvidencePage />}
                />

                <Route
                    path="/tenders/:tenderId/upload"
                    element={<UploadDocument />}
                />

                <Route
                    path="/tenders/:tenderId/verification"
                    element={<Verification />}
                />

                <Route
                    path="/tenders/:tenderId/risk"
                    element={<RiskPage />}
                />

                <Route
                    path="/review"
                    element={<Review />}
                />

                <Route
                    path="/report"
                    element={<ReportPage />}
                />
            </Route>

            <Route
                path="/"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />

            <Route
                path="*"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />
        </Routes>
    );
}