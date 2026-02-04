import Link from "next/link";

interface ShopPageProps {
  params: Promise<{ id: string }>;
}

export default async function ShopPage({ params }: ShopPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Zurück zur Suche
        </Link>

        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Werkstatt-Profil
          </h1>
          <p className="text-gray-600 mb-4">Shop ID: {id}</p>
          <p className="text-gray-500">
            Diese Seite wird in F2 (Shop Profile Page) implementiert.
          </p>
        </div>
      </div>
    </main>
  );
}
