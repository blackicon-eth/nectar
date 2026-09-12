import Logo from "./Logo";

const PROTOCOLS = ["Swarm", "Arkiv", "Avalanche", "ENSv2"];

export default function Footer() {
  return (
    <footer className="bg-wood py-10 text-cream">
      <div className="flex w-full flex-col gap-6 px-8 md:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center rounded-lg bg-paper px-4 py-2">
              <Logo height={30} />
            </div>
            <p className="mt-3 text-[15px] text-muted">
              Content lives on Swarm. Metadata is queryable on Arkiv.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PROTOCOLS.map((p) => (
              <span
                key={p}
                className="inline-flex items-center rounded-sm bg-cream/10 px-2.5 py-0.5 font-mono text-[13px] text-cream"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="h-px w-full bg-cream/15" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="m-0 text-[15px] text-muted">
            © Nectar Publishing Protocol. Harvested for independent thought.
          </p>
          <div className="flex gap-6">
            <a href="#manifesto" className="text-[14px] text-muted hover:text-cream">
              Manifesto
            </a>
            <a href="#privacy" className="text-[14px] text-muted hover:text-cream">
              Privacy
            </a>
            <a href="#docs" className="text-[14px] text-muted hover:text-cream">
              Docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
