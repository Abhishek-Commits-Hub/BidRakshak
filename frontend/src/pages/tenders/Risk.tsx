import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowUpRight, Shield, TrendingDown } from "lucide-react";
import { getRisk } from "../../lib/tenders";
import type { RiskSummary } from "../../types/index";

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
    HIGH: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    MEDIUM: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    LOW: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
};

export default function Risk() {
    const { tenderId } = useParams<{ tenderId: string }>();
    const navigate = useNavigate();
    const [risk, setRisk] = useState<RiskSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenderId) return;
        getRisk(tenderId).then(setRisk).catch(() => {}).finally(() => setLoading(false));
    }, [tenderId]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    if (!risk) {
        return <div className="p-7 text-center text-red-400">Risk data not available.</div>;
    }

    return (
        <div className="mx-auto max-w-[1500px] space-y-6 p-7">
            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    label="Overall Compliance"
                    value={`${risk.compliance_percentage}%`}
                    icon={Shield}
                    color={risk.compliance_percentage >= 80 ? "emerald" : risk.compliance_percentage >= 60 ? "amber" : "red"}
                />
                <SummaryCard label="High Priority" value={`${risk.high_priority}`} icon={AlertTriangle} color="red" />
                <SummaryCard label="Medium Priority" value={`${risk.medium_priority}`} icon={TrendingDown} color="amber" />
                <SummaryCard label="Low Priority" value={`${risk.low_priority}`} icon={Shield} color="blue" />
            </div>

            {/* Compliance breakdown */}
            <div className="rounded-xl border border-slate-800 bg-[#0b1728] p-6">
                <h2 className="text-sm font-semibold text-white">Compliance Breakdown</h2>
                <div className="mt-4">
                    <div className="flex h-3 overflow-hidden rounded-full bg-slate-800">
                        <div
                            className="bg-emerald-500 transition-all"
                            style={{ width: `${(risk.pass_count / risk.total_requirements) * 100}%` }}
                        />
                        <div
                            className="bg-red-500 transition-all"
                            style={{ width: `${(risk.fail_count / risk.total_requirements) * 100}%` }}
                        />
                        <div
                            className="bg-amber-500 transition-all"
                            style={{ width: `${(risk.missing_count / risk.total_requirements) * 100}%` }}
                        />
                        <div
                            className="bg-blue-500 transition-all"
                            style={{ width: `${(risk.review_count / risk.total_requirements) * 100}%` }}
                        />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs">
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Pass: {risk.pass_count}</span>
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" />Fail: {risk.fail_count}</span>
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />Missing: {risk.missing_count}</span>
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" />Review: {risk.review_count}</span>
                    </div>
                </div>
            </div>

            {/* Risk items */}
            <div className="space-y-4">
                {(["HIGH", "MEDIUM", "LOW"] as const).map(priority => {
                    const items = risk.items.filter(i => i.priority === priority);
                    if (items.length === 0) return null;
                    const cfg = PRIORITY_CONFIG[priority];

                    return (
                        <div key={priority}>
                            <h3 className={`mb-3 flex items-center gap-2 text-sm font-semibold ${cfg.color}`}>
                                <AlertTriangle size={15} />
                                {priority} Priority ({items.length})
                            </h3>
                            <div className="space-y-3">
                                {items.map(item => (
                                    <div key={item.id} className={`rounded-xl border ${cfg.border} bg-[#0b1728] p-5`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <span className="font-mono text-xs text-blue-400">
                                                    {item.requirement?.requirement_code}
                                                </span>
                                                <h4 className="mt-1 text-sm font-medium text-white">
                                                    {item.requirement?.title}
                                                </h4>
                                                {item.risk_factor && (
                                                    <p className="mt-2 text-xs text-slate-400">
                                                        <span className="font-medium text-slate-300">Risk: </span>
                                                        {item.risk_factor}
                                                    </p>
                                                )}
                                                {item.impact && (
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        <span className="font-medium text-slate-400">Impact: </span>
                                                        {item.impact}
                                                    </p>
                                                )}
                                                {item.recommendation && (
                                                    <p className="mt-2 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-slate-400">
                                                        <span className="font-medium text-blue-400">Recommendation: </span>
                                                        {item.recommendation}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (item.requirement) {
                                                        navigate(`/tenders/${tenderId}/requirements/${item.requirement.id}`);
                                                    }
                                                }}
                                                className="shrink-0 rounded-lg border border-slate-700 bg-slate-800/60 p-2 text-slate-400 transition hover:text-white"
                                            >
                                                <ArrowUpRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function SummaryCard({ label, value, icon: Icon, color }: {
    label: string; value: string;
    icon: React.ComponentType<{ size?: number }>;
    color: string;
}) {
    const colorMap: Record<string, string> = {
        emerald: "text-emerald-400 bg-emerald-500/10",
        red: "text-red-400 bg-red-500/10",
        amber: "text-amber-400 bg-amber-500/10",
        blue: "text-blue-400 bg-blue-500/10",
    };
    const [textColor, bgColor] = (colorMap[color] || colorMap.blue).split(" ");

    return (
        <div className="rounded-xl border border-slate-800 bg-[#0b1728] p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
                    <p className={`mt-2 text-2xl font-bold ${textColor}`}>{value}</p>
                </div>
                <div className={`rounded-lg ${bgColor} p-2.5 ${textColor}`}>
                    <Icon size={18} />
                </div>
            </div>
        </div>
    );
}
