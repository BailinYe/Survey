import {Link} from "react-router-dom";

export default function PageNotFound() {

    return (
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-6 py-10 text-foreground">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
                <p className="text-sm font-medium tracking-wide text-muted-foreground">
                    404 Error
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight">
                    Page not found
                </h1>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    The page you are trying to access does not exist or may have been moved.
                </p>

                <div className="mt-6 flex justify-center gap-3">
                    <Link
                        to="/"
                        className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                        Go to home
                    </Link>

                    <Link
                        to="/admin-dashboard"
                        className="inline-flex items-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                    >
                        Admin dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}