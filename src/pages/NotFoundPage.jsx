import { ArrowLeft, SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-5 text-ink dark:bg-slate-950 dark:text-white">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-lg bg-slate-100 text-library-cyan dark:bg-white/10">
          <SearchX className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-4xl font-black">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">The requested library workspace route does not exist.</p>
        <Link to="/dashboard" className="mt-6 inline-flex">
          <Button variant="accent">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

