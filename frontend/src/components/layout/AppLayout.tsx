import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const pageInfo: Record<
    string,
    {
        title: string;
        subtitle?: string;
    }
> = {
    "/dashboard": {
        title: "Procurement Dashboard",
        subtitle: "Bid compliance monitoring and investigation overview"
    },
    "/tenders/GEM-DEMO-001": {
        title: "Tender Overview",
        subtitle: "GEM-DEMO-001 · Supply of Computer Equipment"
    },
    "/review": {
        title: "Human Review",
        subtitle: "Officer decisions for uncertain compliance results"
    },
    "/report": {
        title: "Final Compliance Report",
        subtitle: "BidRakshak verification summary"
    }
};

export default function AppLayout() {
    const location = useLocation();

    const info =
        pageInfo[location.pathname] ?? {
            title: "Bid Analysis",
            subtitle: "Tender compliance investigation workspace"
        };

    return (
        <div className="flex h-screen overflow-hidden bg-[#07111f] text-slate-200">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar
                    title={info.title}
                    subtitle={info.subtitle}
                />

                <main className="min-h-0 flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}