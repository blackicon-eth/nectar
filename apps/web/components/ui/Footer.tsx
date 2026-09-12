import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="relative z-50 bg-wood py-4 text-cream">
      <div className="flex w-full flex-wrap items-center justify-between gap-4 px-8 md:px-12">
        <div className="rounded-md bg-paper px-3 py-1">
          <Logo height={22} />
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <span className="text-[14px] text-muted">
            © Nectar Publishing Protocol
          </span>
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
    </footer>
  );
}
