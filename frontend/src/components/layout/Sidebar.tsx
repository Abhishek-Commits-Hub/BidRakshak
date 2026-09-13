import {
    BarChart3,
    ClipboardCheck,
    FileCheck2,
    FileText,
    Gauge,
    LayoutDashboard,
    LogOut,
    SearchCheck,
    ShieldCheck,
    UserRoundCheck
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const navigation = [
    {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard
    },
    {
        label: "Tenders",
        path: "/tenders/GEM-DEMO-001",
        icon: FileText
    }
];

const analysisNavigation = [
    {
        label: "Requirements",
        path: "/tenders/GEM-DEMO-001/requirements",
        icon: ClipboardCheck
    },
    {
        label: "Evidence",
        path: "/tenders/GEM-DEMO-001/evidence",
        icon: FileCheck2
    },
    {
        label: "Verification",
        path: "/tenders/GEM-DEMO-001/verification",
        icon: SearchCheck
    },
    {
        label: "Risk",
        path: "/tenders/GEM-DEMO-001/risk",
        icon: Gauge
    }
];

export default function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("bidrakshak_token");
        localStorage.removeItem("bidrakshak_user");
        navigate("/login");
    };

    return (
        <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-[#091524]">
            <div className="border-b border-slate-800 px-5 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/30">
                        <ShieldCheck size={22} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-white">
                            BidRakshak
                        </h1>
                        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                            Procurement Intelligence
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-5">
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Workspace
                </p>

                <div className="space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                                        isActive
                                            ? "bg-blue-600/15 text-blue-400"
                                            : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                                    }`
                                }
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </div>

                <p className="mb-2 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Analysis
                </p>

                <div className="space-y-1">
                    {analysisNavigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                                        isActive
                                            ? "bg-blue-600/15 text-blue-400"
                                            : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                                    }`
                                }
                            >
                                <Icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </div>

                <p className="mb-2 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Decisions
                </p>

                <NavLink
                    to="/review"
                    className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                            isActive
                                ? "bg-blue-600/15 text-blue-400"
                                : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                        }`
                    }
                >
                    <UserRoundCheck size={18} />
                    <span>Human Review</span>
                </NavLink>

                <NavLink
                    to="/report"
                    className={({ isActive }) =>
                        `mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                            isActive
                                ? "bg-blue-600/15 text-blue-400"
                                : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                        }`
                    }
                >
                    <BarChart3 size={18} />
                    <span>Final Report</span>
                </NavLink>
            </nav>

            <div className="border-t border-slate-800 p-3">
                <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700">
                        <span className="text-xs font-semibold text-slate-200">
                            PO
                        </span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-200">
                            Procurement Officer
                        </p>
                        <p className="text-xs text-slate-500">
                            Authorized user
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}