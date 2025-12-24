import { Link } from "react-router-dom";

function Footer() {
  return (
    <div className="footer fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 py-4 px-4 z-10">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-2">
        <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
          <FooterLink to="/" emoji="🏊" text="Swimming" />
          <span className="text-gray-300">·</span>
          <FooterLink to="/skating" emoji="⛸️" text="Skating" />
          <span className="text-gray-300">·</span>
          <FooterLink to="/libraries" emoji="📚" text="Libraries" />
        </div>
        <p className="text-xs text-gray-500">
          <a
            href="https://bastiangruber.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            Made with ❤️ by Bastian
          </a>
        </p>
      </div>
    </div>
  );
}

function FooterLink({ to, emoji, text }) {
  const isCurrentPage = window.location.pathname === to;

  if (isCurrentPage) {
    return (
      <span className="text-blue-600 font-semibold">
        {emoji} {text}
      </span>
    );
  }

  return (
    <Link
      to={to}
      className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
    >
      {emoji} {text}
    </Link>
  );
}

export default Footer;
