import { Bell, ChevronDown, ShieldCheck } from "lucide-react";

interface TopbarProps {
    title: string;
    subtitle?: string;
}

export default function Topbar({
    title,
    subtitle
}: TopbarProps) {
    return (
        <header className="flex h-20 items-center justify-between border-b border-slate-800 bg-[#081321]/90 px-7 backdrop-blur-xl">
            <div>
                <div className="flex items-center gap-2">
                    <ShieldCheck
                        size={16}
                        className="text-blue-500"
                    />
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                        BidRakshak
                    </span>
                </div>
                <h2 className="mt-1 text-xl font-semibold text-white">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-0.5 text-xs text-slate-500">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    className="relative rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-slate-400 transition hover:border-slate-700 hover:text-white"
                >
                    <Bell size={18} />
                    <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
                </button>

                <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-700"
                >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 text-xs font-semibold text-blue-400">
                        PO
                    </div>
                    <span className="hidden sm:inline">
                        Procurement Officer
                    </span>
                    <ChevronDown size={15} />
                </button>
            </div>
        </header>
    );
}