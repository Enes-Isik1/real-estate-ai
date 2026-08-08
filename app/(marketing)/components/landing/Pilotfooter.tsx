export function PilotFooter() {
  return (
    <footer className="border-t border-gray-200/70 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-center md:flex-row md:px-8 md:text-left">
        <p className="text-[13px] text-gray-400">
          © {new Date().getFullYear()} DealPilot. Gebaut für professionelle
          Immobilienmakler.
        </p>
        <div className="flex gap-6 text-[13px] text-gray-400">
          <a href="/impressum" className="hover:text-gray-700">
            Impressum
          </a>
          <a href="/datenschutz" className="hover:text-gray-700">
            Datenschutz
          </a>
          <a href="mailto:pilot@dealpilot.app" className="hover:text-gray-700">
            pilot@dealpilot.app
          </a>
        </div>
      </div>
    </footer>
  );
}
