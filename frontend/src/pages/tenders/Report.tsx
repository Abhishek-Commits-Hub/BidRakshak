import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, FileText, Loader2, Shield } from "lucide-react";
import { generatePdfReport, getReport } from "../../lib/tenders";
import type { ReportSummary } from "../../types/index";

export default function Report() {
    const { tenderId } = useParams<{ tenderId: string }>();
    const [report, setReport] = useState<ReportSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (!tenderId) return;
        getReport(tenderId).then(setReport).catch(() => {}).finally(() => setLoading(false));
    }, [tenderId]);

    const handleDownload = async () => {
        if (!tenderId) return;
        setDownloading(true);
        try {
            const blob = await generatePdfReport(tenderId);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `BidRakshak_Report_${tenderId}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert("Failed to generate PDF.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    if (!report) {
        return <div className="p-7 text-center text-red-400">Report not available.</div>;
    }

    return (
        <div className="mx-auto max-w-[1200px] space-y-6 p-7">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-white">Compliance Report</h1>
                    <p className="text-xs text-slate-500">{report.tender_number} — {report.tender_title}</p>
                </div>
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:opacity-50"
                >
                    {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {downloading ? "Generating..." : "Download PDF"}
                </button>
            </div>

            {/* Disclaimer */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-400">
                <Shield size={14} className="mr-1.5 inline-block" />
                DEMONSTRATION — Deterministic demo results for Smart India Hackathon 2026. Not an actual evaluation.
            </div>

            {/* Summary */}
            <div className="rounded-xl border border-slate-800 bg-[#0b1728] p-6">
                <h2 className="text-sm font-semibold text-white">Executive Summary</h2>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard label="Bidder" value={report.bidder_name} type="text" />
                    <StatCard label="Requirements" value={`${report.total_requirements}`} />
                    <StatCard label="Compliance" value={`${report.compliance_percentage}%`} color="blue" />
                    <StatCard label="High Risk" value={`${report.high_priority}`} color="red" />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <MiniStat label="Pass" value={report.pass_count} color="text-emerald-400" bg="bg-emerald-500/10" />
                    <MiniStat label="Fail" value={report.fail_count} color="text-red-400" bg="bg-red-500/10" />
                    <MiniStat label="Missing" value={report.missing_count} color="text-amber-400" bg="bg-amber-500/10" />
                    <MiniStat label="Review" value={report.review_count} color="text-blue-400" bg="bg-blue-500/10" />
                </div>
            </div>

            {/* Full Requirements table */}
            <div className="rounded-xl border border-slate-800 bg-[#0b1728]">
                <div className="border-b border-slate-800 px-6 py-4">
                    <h2 className="text-sm font-semibold text-white">
                        <FileText size={14} className="mr-2 inline-block text-blue-400" />
                        All Requirements ({report.requirements.length})
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-800 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.requirements.map((req, i) => (
                                <tr key={i} className="border-b border-slate-800/60">
                                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-blue-400">
                                        {req.requirement_code}
                                    </td>
                                    <td className="max-w-xs truncate px-4 py-2.5 text-xs text-slate-300">
                                        {req.title}
                                    </td>
                                    <td className="px-4 py-2.5 text-[10px] text-slate-500">
                                        {req.category}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                            req.compliance_status === "PASS" ? "bg-emerald-500/10 text-emerald-400" :
                                            req.compliance_status === "FAIL" ? "bg-red-500/10 text-red-400" :
                                            req.compliance_status === "MISSING" ? "bg-amber-500/10 text-amber-400" :
                                            "bg-blue-500/10 text-blue-400"
                                        }`}>
                                            {req.compliance_status.replace("_", " ")}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Non-pass findings */}
            {report.non_pass_requirements.length > 0 && (
                <div className="rounded-xl border border-slate-800 bg-[#0b1728] p-6">
                    <h2 className="text-sm font-semibold text-white">
                        Findings Requiring Attention ({report.non_pass_requirements.length})
                    </h2>
                    <div className="mt-4 space-y-3">
                        {report.non_pass_requirements.map((req, i) => (
                            <div key={i} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-blue-400">{req.requirement_code}</span>
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                        req.compliance_status === "FAIL" ? "bg-red-500/10 text-red-400" :
                                        req.compliance_status === "MISSING" ? "bg-amber-500/10 text-amber-400" :
                                        "bg-blue-500/10 text-blue-400"
                                    }`}>
                                        {req.compliance_status.replace("_", " ")}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-slate-200">{req.title}</p>
                                {req.assessment && (
                                    <p className="mt-2 text-xs text-slate-400">{req.assessment}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, color, type }: { label: string; value: string; color?: string; type?: string }) {
    const colorMap: Record<string, string> = {
        blue: "text-blue-400",
        red: "text-red-400",
        emerald: "text-emerald-400",
    };

    return (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <p className={`mt-1 ${type === "text" ? "text-sm" : "text-xl font-bold"} ${color ? colorMap[color] : "text-white"}`}>
                {value}
            </p>
        </div>
    );
}

function MiniStat({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
    return (
        <div className={`flex items-center justify-between rounded-lg ${bg} px-3 py-2`}>
            <span className="text-xs text-slate-400">{label}</span>
            <span className={`text-sm font-bold ${color}`}>{value}</span>
        </div>
    );
}
