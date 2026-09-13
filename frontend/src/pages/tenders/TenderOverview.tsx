import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Building2, Calendar, ChevronRight, Clock, FileText, IndianRupee,
    Landmark, Play, Shield, Tag, Users
} from "lucide-react";
import { getTender } from "../../lib/tenders";
import type { TenderDetail } from "../../types/index";

export default function TenderOverview() {
    const { tenderId } = useParams<{ tenderId: string }>();
    const navigate = useNavigate();
    const [tender, setTender] = useState<TenderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenderId) return;
        getTender(tenderId).then(setTender).catch(() => {}).finally(() => setLoading(false));
    }, [tenderId]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    if (!tender) {
        return (
            <div className="mx-auto max-w-[1500px] p-7">
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-400">
                    Tender not found.
                </div>
            </div>
        );
    }

    const fmt = (v: number | null) => v ? `₹${(v / 100000).toFixed(2)} lakh` : "—";

    return (
        <div className="mx-auto max-w-[1500px] space-y-6 p-7">
            {/* Disclaimer */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-400">
                <Shield size={14} className="mr-1.5 inline-block" />
                DEMONSTRATION TENDER — This is a fictional specimen tender created for Smart India Hackathon 2026. Not an actual government procurement.
            </div>

            {/* Tender Info */}
            <div className="rounded-xl border border-slate-800 bg-[#0b1728]">
                <div className="border-b border-slate-800 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-blue-400">{tender.tender_number}</span>
                        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                            {tender.status}
                        </span>
                    </div>
                    <h1 className="mt-2 text-xl font-semibold text-white">{tender.title}</h1>
                    <p className="mt-1 text-sm text-slate-500">{tender.organization}</p>
                </div>

                <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
                    <InfoItem icon={Landmark} label="Department" value={tender.department || "—"} />
                    <InfoItem icon={Tag} label="Tender ID" value={tender.tender_id_display || "—"} />
                    <InfoItem icon={Building2} label="Tender Type" value={tender.tender_type || "—"} />
                    <InfoItem icon={FileText} label="Bid Type" value={tender.bid_type || "—"} />
                    <InfoItem icon={IndianRupee} label="Estimated Value" value={fmt(tender.estimated_value)} />
                    <InfoItem icon={IndianRupee} label="EMD" value={fmt(tender.emd_amount)} />
                    <InfoItem icon={Calendar} label="Bid Validity" value={tender.bid_validity_days ? `${tender.bid_validity_days} days` : "—"} />
                    <InfoItem icon={Clock} label="Delivery Period" value={tender.delivery_period_days ? `${tender.delivery_period_days} days` : "—"} />
                    <InfoItem icon={Calendar} label="Contract Period" value={tender.contract_period_months ? `${tender.contract_period_months} months` : "—"} />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Tender Document */}
                <div className="rounded-xl border border-slate-800 bg-[#0b1728] p-6">
                    <h2 className="text-sm font-semibold text-white">Tender Document</h2>
                    <div className="mt-4 space-y-3">
                        {tender.documents.filter(d => d.document_type === "TENDER_DOCUMENT").map(doc => (
                            <div key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">{doc.document_name}</p>
                                        <p className="text-xs text-slate-500">{doc.page_count} pages · {doc.status}</p>
                                    </div>
                                </div>
                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                                    Processed
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bidder */}
                {tender.bidder && (
                    <div className="rounded-xl border border-slate-800 bg-[#0b1728] p-6">
                        <h2 className="text-sm font-semibold text-white">Bidder</h2>
                        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{tender.bidder.company_name}</p>
                                    <p className="text-xs text-slate-500">Reg: {tender.bidder.registration_number}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Bidder Documents</p>
                            <div className="mt-2 space-y-2">
                                {tender.documents.filter(d => d.document_type === "BID_DOCUMENT").map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <FileText size={14} className="text-slate-500" />
                                            <span className="text-xs text-slate-300">{doc.document_name}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-500">{doc.page_count} pg</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Analyze CTA */}
            <div className="rounded-xl border border-slate-800 bg-[#0b1728] p-6">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-white">Bid Compliance Analysis</h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Run deterministic compliance verification against all tender requirements.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => navigate(`/tenders/${tenderId}/upload`)}
                            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-500/60"
                        >
                            Upload document
                        </button>
                        <button
                            onClick={() => navigate(`/tenders/${tenderId}/analysis`)}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
                        >
                            <Play size={16} />
                            Analyze Bid
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-slate-800/60 p-2 text-slate-400">
                <Icon size={16} />
            </div>
            <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-0.5 text-sm text-slate-200">{value}</p>
            </div>
        </div>
    );
}
