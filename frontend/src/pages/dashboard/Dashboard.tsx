import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertTriangle,
    ArrowUpRight,
    CheckCircle2,
    FileSearch,
    ShieldCheck
} from "lucide-react";
import { getAnalysis, getTender } from "../../lib/tenders";
import type { AnalysisStatus, TenderDetail } from "../../types/index";

export default function Dashboard() {
    const navigate = useNavigate();
    const [tender, setTender] = useState<TenderDetail | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [tenderResponse, analysisResponse] = await Promise.all([
                    getTender("GEM-DEMO-001"),
                    getAnalysis("GEM-DEMO-001")
                ]);
                setTender(tenderResponse);
                setAnalysis(analysisResponse);
            } catch {
                setTender(null);
                setAnalysis(null);
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    const stats = useMemo(() => {
        if (!analysis) {
            return [
                { label: "Requirements", value: "—", description: "Tender requirements identified", icon: FileSearch },
                { label: "Pass", value: "—", description: "Requirements verified compliant", icon: CheckCircle2 },
                { label: "Issues", value: "—", description: "Fail or missing evidence", icon: AlertTriangle },
                { label: "Review", value: "—", description: "Officer attention required", icon: ShieldCheck }
            ];
        }

        return [
            {
                label: "Requirements",
                value: String(analysis.total_requirements),
                description: "Tender requirements identified",
                icon: FileSearch
            },
            {
                label: "Pass",
                value: String(analysis.pass_count),
                description: "Requirements verified compliant",
                icon: CheckCircle2
            },
            {
                label: "Issues",
                value: String(analysis.fail_count + analysis.missing_count),
                description: "Fail or missing evidence",
                icon: AlertTriangle
            },
            {
                label: "Review",
                value: String(analysis.review_count),
                description: "Officer attention required",
                icon: ShieldCheck
            }
        ];
    }, [analysis]);

    return (
        <div className="mx-auto max-w-[1500px] space-y-7 p-7">
            <section>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm text-slate-500">
                            Procurement workspace
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold text-white">
                            Good morning, Procurement Officer
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Analysis services operational
                    </div>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.label}
                            className="rounded-xl border border-slate-800 bg-[#0b1728] p-5"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        {stat.label}
                                    </p>
                                    <p className="mt-3 text-3xl font-semibold text-white">
                                        {stat.value}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-400">
                                    <Icon size={19} />
                                </div>
                            </div>

                            <p className="mt-3 text-xs text-slate-500">
                                {stat.description}
                            </p>
                        </div>
                    );
                })}
            </section>

            <section className="rounded-xl border border-slate-800 bg-[#0b1728]">
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                    <div>
                        <p className="text-sm font-semibold text-white">
                            Active Tender
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Current bid compliance investigation
                        </p>
                    </div>

                    <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-medium text-blue-400">
                        {loading ? "LOADING" : "IN ANALYSIS"}
                    </span>
                </div>

                <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto]">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-blue-400">
                                {tender?.tender_number ?? "GEM-DEMO-001"}
                            </span>
                        </div>

                        <h2 className="mt-2 text-xl font-semibold text-white">
                            {tender?.title ?? "Supply of Computer Equipment"}
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            {tender?.organization ?? "Government Procurement Department"}
                        </p>

                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-slate-600">
                                    Bidder
                                </p>
                                <p className="mt-1 text-sm text-slate-300">
                                    {tender?.bidder?.company_name ?? "TechNova Solutions Pvt. Ltd."}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-slate-600">
                                    Requirements
                                </p>
                                <p className="mt-1 text-sm text-slate-300">
                                    {analysis ? `${analysis.total_requirements} identified` : "42 identified"}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] uppercase tracking-wide text-slate-600">
                                    Overall compliance
                                </p>
                                <p className="mt-1 text-sm font-semibold text-amber-400">
                                    {analysis ? `${analysis.compliance_percentage}%` : "78%"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate(`/tenders/${tender?.tender_number ?? "GEM-DEMO-001"}`)}
                        className="flex h-fit items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300"
                    >
                        Open Tender
                        <ArrowUpRight size={16} />
                    </button>
                </div>
            </section>
        </div>
    );
}