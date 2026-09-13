import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock, Search, XCircle } from "lucide-react";
import { getRequirements } from "../../lib/tenders";
import type { Requirement } from "../../types/index";

const STATUS_CONFIG: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string }> = {
    PASS: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    FAIL: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
    MISSING: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
    REVIEW_REQUIRED: { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10" },
};

const CATEGORIES = ["All", "ELIGIBILITY", "FINANCIAL", "TECHNICAL", "STATUTORY", "DOCUMENT", "COMMERCIAL", "EXPERIENCE", "GENERAL"];
const STATUSES = ["All", "PASS", "FAIL", "MISSING", "REVIEW_REQUIRED"];

export default function Requirements() {
    const { tenderId } = useParams<{ tenderId: string }>();
    const navigate = useNavigate();
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        if (!tenderId) return;
        setLoading(true);

        const params: Record<string, string> = {};
        if (category !== "All") params.category = category;
        if (statusFilter !== "All") params.status = statusFilter;
        if (search) params.search = search;

        getRequirements(tenderId, params)
            .then(setRequirements)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [tenderId, category, statusFilter, search]);

    const counts = {
        total: requirements.length,
        pass: requirements.filter(r => r.compliance_status === "PASS").length,
        fail: requirements.filter(r => r.compliance_status === "FAIL").length,
        missing: requirements.filter(r => r.compliance_status === "MISSING").length,
        review: requirements.filter(r => r.compliance_status === "REVIEW_REQUIRED").length,
    };

    return (
        <div className="mx-auto max-w-[1500px] space-y-5 p-7">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <MiniStat label="Total" value={counts.total} />
                <MiniStat label="Pass" value={counts.pass} color="emerald" />
                <MiniStat label="Fail" value={counts.fail} color="red" />
                <MiniStat label="Missing" value={counts.missing} color="amber" />
                <MiniStat label="Review" value={counts.review} color="blue" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 sm:max-w-xs">
                    <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search requirements..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-[#0b1728] py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/50"
                    />
                </div>

                <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="rounded-lg border border-slate-800 bg-[#0b1728] px-3 py-2 text-xs text-slate-300 outline-none"
                >
                    {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-slate-800 bg-[#0b1728] px-3 py-2 text-xs text-slate-300 outline-none"
                >
                    {STATUSES.map(s => (
                        <option key={s} value={s}>{s === "All" ? "All Statuses" : s.replace("_", " ")}</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0b1728]">
                {loading ? (
                    <div className="flex h-48 items-center justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    </div>
                ) : requirements.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">No requirements found.</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-800 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Requirement</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3 text-center">Mandatory</th>
                                <th className="px-4 py-3">Evidence</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Confidence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requirements.map(req => {
                                const cfg = STATUS_CONFIG[req.compliance_status] || STATUS_CONFIG.REVIEW_REQUIRED;
                                const Icon = cfg.icon;

                                return (
                                    <tr
                                        key={req.id}
                                        onClick={() => navigate(`/tenders/${tenderId}/requirements/${req.id}`)}
                                        className="cursor-pointer border-b border-slate-800/60 transition hover:bg-slate-800/30"
                                    >
                                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-blue-400">
                                            {req.requirement_code}
                                        </td>
                                        <td className="max-w-xs truncate px-4 py-3 text-slate-200">
                                            {req.title}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                                                {req.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-xs text-slate-400">
                                            {req.mandatory ? "Yes" : "No"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs ${
                                                req.evidence_status === "FOUND" ? "text-emerald-400" :
                                                req.evidence_status === "PARTIAL" ? "text-amber-400" :
                                                "text-red-400"
                                            }`}>
                                                {req.evidence_status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full ${cfg.bg} px-2.5 py-1 text-[11px] font-medium ${cfg.color}`}>
                                                <Icon size={12} />
                                                {req.compliance_status.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-xs text-slate-400">
                                            {req.confidence > 0 ? `${req.confidence}%` : "—"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function MiniStat({ label, value, color }: { label: string; value: number; color?: string }) {
    const colors: Record<string, string> = {
        emerald: "text-emerald-400 border-emerald-500/20",
        red: "text-red-400 border-red-500/20",
        amber: "text-amber-400 border-amber-500/20",
        blue: "text-blue-400 border-blue-500/20",
    };

    return (
        <div className={`rounded-lg border ${color ? colors[color] : "border-slate-800"} bg-[#0b1728] px-4 py-3 text-center`}>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-1 text-xl font-bold ${color ? colors[color]?.split(" ")[0] : "text-white"}`}>
                {value}
            </p>
        </div>
    );
}
