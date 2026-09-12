import Logo from "./Logo";

const PROTOCOLS = ["Swarm", "Arkiv", "Avalanche", "ENSv2"];

export default function Footer() {
  return (
    <footer className="bg-wood py-10 text-cream">
      <div className="container-page flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Logo height={24} />
            <p className="mt-2 text-[14px] text-muted">
              Content lives on Swarm. Metadata is queryable on Arkiv.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PROTOCOLS.map((p) => (
              <span
                key={p}
                className="inline-flex items-center rounded-sm bg-cream/10 px-2.5 py-0.5 font-mono text-[12px] text-cream"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="h-px w-full bg-cream/15" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="m-0 text-[14px] text-muted">
            © Nectar Publishing Protocol. Harvested for independent thought.
          </p>
          <div className="flex gap-6">
            <a href="#manifesto" className="text-[13px] text-muted hover:text-cream">
              Manifesto
            </a>
            <a href="#privacy" className="text-[13px] text-muted hover:text-cream">
              Privacy
            </a>
            <a href="#docs" className="text-[13px] text-muted hover:text-cream">
              Docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
