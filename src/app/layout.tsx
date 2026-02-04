import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bikestube - Finde Fahrradwerkstätten in deiner Nähe',
  description: 'Finde und buche Fahrradreparaturen bei lokalen Werkstätten. Schnell, einfach und ohne Anruf.',
  keywords: 'Fahrrad, Reparatur, Werkstatt, Berlin, E-Bike, Service, Buchung',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center space-x-2">
                <svg
                  className="w-8 h-8 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="5.5" cy="17.5" r="3.5" strokeWidth="2" />
                  <circle cx="18.5" cy="17.5" r="3.5" strokeWidth="2" />
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    d="M5.5 17.5L9 7h6l3.5 10.5M9 7l3 5m3-5l-3 5m0 0l-3 5.5m3-5.5l3 5.5"
                  />
                </svg>
                <span className="text-xl font-bold text-gray-900">Bikestube</span>
              </a>
              <nav className="hidden sm:flex items-center space-x-4">
                <a
                  href="/search"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Werkstatt finden
                </a>
                <a
                  href="/partner"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Für Werkstätten
                </a>
              </nav>
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-500 text-sm">
              © 2024 Bikestube. Alle Rechte vorbehalten.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
