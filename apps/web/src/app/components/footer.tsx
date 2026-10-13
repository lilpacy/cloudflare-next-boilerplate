export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-gray-500">
        <p>
          Built with{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Next.js
          </a>
          ,{" "}
          <a
            href="https://www.cloudflare.com/developer-platform/workers/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Cloudflare Workers
          </a>
          ,{" "}
          <a
            href="https://developers.cloudflare.com/d1/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            D1
          </a>
          , and{" "}
          <a
            href="https://developers.cloudflare.com/r2/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            R2
          </a>
        </p>
        <p className="mt-2">© {currentYear} CF Next Boilerplate</p>
      </div>
    </footer>
  );
}
