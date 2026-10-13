"use client";

export default function AdminListSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
