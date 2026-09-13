interface PlaceholderProps {
    title: string;
    description: string;
}

export default function Placeholder({
    title,
    description
}: PlaceholderProps) {
    return (
        <div className="mx-auto max-w-[1500px] p-7">
            <div className="rounded-xl border border-slate-800 bg-[#0b1728] p-8">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-blue-400">
                    BidRakshak Workspace
                </p>
                <h1 className="mt-3 text-2xl font-semibold text-white">
                    {title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    {description}
                </p>
                <div className="mt-6 rounded-lg border border-dashed border-slate-800 px-5 py-8 text-center text-xs text-slate-600">
                    Module foundation ready.
                </div>
            </div>
        </div>
    );
}