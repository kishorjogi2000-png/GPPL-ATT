export default function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-10 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
          Smart Workforce Attendance &amp; Management System
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
          Application source is being restored
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          The repository currently contains only the project scaffolding — the
          original <code className="rounded bg-slate-800 px-1.5 py-0.5 text-sky-300">src/</code> folder
          (App, components, services, kiosk and admin console) was never
          committed to GitHub, so the production build had nothing to compile.
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          This placeholder keeps the deploy pipeline green. It will be replaced
          automatically as soon as the real source is pushed to the repository:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-300 ring-1 ring-slate-800">
          <code>{'git add src/\ngit commit -m "Add application source"\ngit push origin main'}</code>
        </pre>
        <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">React 19</span>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">Vite 8</span>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">Tailwind CSS 4</span>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">TypeScript</span>
        </div>
      </div>
    </main>
  );
}
