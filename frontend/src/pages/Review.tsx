import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock3, Filter, Search } from "lucide-react";
import { getRequirements } from "../lib/tenders";
import type { Requirement } from "../types/index";

export default function Review() {
    const navigate = useNavigate();
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getRequirements("GEM-DEMO-001");
                setRequirements(data.filter((r) => ["FAIL", "MISSING", "REVIEW_REQUIRED"].includes(r.compliance_status) || r.priority === "HIGH"));
            } catch {
                setRequirements([]);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    const filtered = useMemo(() => {
        return requirements.filter((req) => {
            const matchesFilter = filter === "ALL" || req.compliance_status === filter;
            const matchesSearch = !search || `${req.requirement_code} ${req.title}`.toLowerCase().includes(search.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [filter, requirements, search]);

    return (
        <div className="mx-auto max-w-[1500px] space-y-6 p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-white">Review Center</h1>
                    <p className="text-xs text-slate-500">Items requiring officer attention and audit-ready evidence review.</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#0b1728] px-3 py-2 text-xs text-slate-400">
                    <Filter size={14} />
                    {filtered.length} items
                </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search requirement or code"
                        className="w-full rounded-lg border border-slate-800 bg-[#0b1728] py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                    />
                </div>

                <select
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    className="rounded-lg border border-slate-800 bg-[#0b1728] px-3 py-2.5 text-sm text-slate-300 outline-none"
                >
                    <option value="ALL">All items</option>
                    <option value="FAIL">Fail</option>
                    <option value="MISSING">Missing</option>
                    <option value="REVIEW_REQUIRED">Review required</option>
                </select>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex h-48 items-center justify-center rounded-xl border border-slate-800 bg-[#0b1728] text-slate-500">Loading review queue...</div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-xl border border-slate-800 bg-[#0b1728] p-8 text-center text-slate-500">No review items found.</div>
                ) : (
                    filtered.map((req) => {
                        const statusStyles = {
                            FAIL: { bg: "bg-red-500/10", text: "text-red-400", icon: AlertTriangle },
                            MISSING: { bg: "bg-amber-500/10", text: "text-amber-400", icon: AlertTriangle },
                            REVIEW_REQUIRED: { bg: "bg-blue-500/10", text: "text-blue-400", icon: Clock3 },
                        };

                        const config = statusStyles[req.compliance_status as keyof typeof statusStyles] ?? statusStyles.REVIEW_REQUIRED;
                        const Icon = config.icon;

                        return (
                            <div key={req.id} className="rounded-xl border border-slate-800 bg-[#0b1728] p-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs text-blue-400">{req.requirement_code}</span>
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.text}`}>
                                                <Icon size={12} />
                                                {req.compliance_status.replace("_", " ")}
                                            </span>
                                        </div>
                                        <h2 className="mt-2 text-base font-semibold text-white">{req.title}</h2>
                                        <p className="mt-2 text-xs text-slate-500">{req.category} · {req.mandatory ? "Mandatory" : "Optional"} · {req.priority} priority</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/tenders/GEM-DEMO-001/requirements/${req.id}`)}
                                            className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs text-slate-200"
                                        >
                                            Review Requirement
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/tenders/GEM-DEMO-001/evidence`)}
                                            className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs text-slate-200"
                                        >
                                            Open Evidence
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-400">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <CheckCircle2 size={14} className="text-emerald-400" />
                                        Deterministic assessment: {req.assessment ?? "Evidence review required."}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
