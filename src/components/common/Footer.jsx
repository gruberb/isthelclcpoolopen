import { Link } from "react-router-dom";

function Footer() {
  return (
    <div className="footer fixed bottom-0 left-0 w-full bg-brutal-white py-4 px-4 z-10">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-2">
        <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
          <FooterLink to="/" icon="/icons/Swimming--Streamline-Flex.png" text="Swimming" />
          <span className="text-brutal-black/30 font-bold">|</span>
          <FooterLink to="/skating" icon="/icons/Ice-Skating--Streamline-Flex.png" text="Skating" />
          <span className="text-brutal-black/30 font-bold">|</span>
          <FooterLink to="/libraries" icon="/icons/Open-Book--Streamline-Flex.png" text="Libraries" />
        </div>
        <p className="text-xs text-brutal-black/50">
          <a
            href="https://bastiangruber.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brutal-black/50 hover:text-brutal-blue transition-colors uppercase tracking-wider font-display font-bold"
          >
            Made by Bastian
          </a>
        </p>
      </div>
    </div>
  );
}

function FooterLink({ to, icon, text }) {
  const isCurrentPage = window.location.pathname === to;

  const classes = isCurrentPage
    ? "text-brutal-blue font-bold"
    : "text-brutal-black/70 hover:text-brutal-blue transition-colors font-bold";

  const content = (
    <span className={`${classes} font-display uppercase tracking-wider text-sm flex items-center gap-1.5`}>
      <img src={icon} alt="" className="w-5 h-5" />
      {text}
    </span>
  );

  if (isCurrentPage) {
    return content;
  }

  return (
    <Link to={to}>
      {content}
    </Link>
  );
}

export default Footer;
