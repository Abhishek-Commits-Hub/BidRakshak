import { useState } from "react";
import type { FormEvent } from "react";
import {
    ArrowRight,
    LockKeyhole,
    Mail,
    ShieldCheck
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { demoUser } from "../../lib/demoData";
import type { LoginResponse } from "../../types/auth";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState(
        "demo@bidrakshak.gov.in"
    );
    const [password, setPassword] = useState(
        "BidRakshak@123"
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response: LoginResponse = {
                access_token: "demo-token",
                token_type: "bearer",
                user: { ...demoUser, email },
            };

            localStorage.setItem(
                "bidrakshak_token",
                response.access_token
            );

            localStorage.setItem(
                "bidrakshak_user",
                JSON.stringify(response.user)
            );

            const from =
                (
                    location.state as {
                        from?: string;
                    } | null
                )?.from ?? "/dashboard";

            navigate(from, {
                replace: true
            });
        } catch {
            setError(
                "Unable to sign in. Check your credentials and ensure the BidRakshak API is running."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#07111f]">
            <div className="hidden flex-1 flex-col justify-between border-r border-slate-800 bg-[#091524] p-10 lg:flex">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white">
                                BidRakshak
                            </p>
                            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                Procurement Intelligence
                            </p>
                        </div>
                    </div>

                    <div className="mt-24 max-w-xl">
                        <p className="text-sm font-medium text-blue-400">
                            AI-ASSISTED BID VERIFICATION
                        </p>
                        <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-tight text-white">
                            Verify every requirement.
                            <br />
                            Trace every decision.
                        </h1>
                        <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                            BidRakshak connects tender requirements
                            with bidder evidence and gives procurement
                            officers a transparent compliance trail.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Prototype environment · SIH 2026
                </div>
            </div>

            <div className="flex w-full items-center justify-center px-6 py-12 lg:w-[520px] lg:px-12">
                <div className="w-full max-w-sm">
                    <div className="mb-10 lg:hidden">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                                <ShieldCheck size={21} />
                            </div>
                            <p className="text-xl font-bold text-white">
                                BidRakshak
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-blue-400">
                            SECURE ACCESS
                        </p>
                        <h2 className="mt-2 text-3xl font-semibold text-white">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Sign in to your procurement workspace.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-8 space-y-5"
                    >
                        <div>
                            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
                                Official email
                            </label>
                            <div className="relative">
                                <Mail
                                    size={17}
                                    className="absolute left-3 top-3.5 text-slate-500"
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-800 bg-[#0b1728] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
                                    placeholder="officer@example.gov.in"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
                                Password
                            </label>
                            <div className="relative">
                                <LockKeyhole
                                    size={17}
                                    className="absolute left-3 top-3.5 text-slate-500"
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-slate-800 bg-[#0b1728] py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-300">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign in"}
                            {!loading && (
                                <ArrowRight size={17} />
                            )}
                        </button>
                    </form>

                    <div className="mt-8 rounded-xl border border-slate-800 bg-[#0b1728]/60 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                            SIH Demo Account
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                            demo@bidrakshak.gov.in
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Demo account credentials are prefilled.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}