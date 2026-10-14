"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full px-6 py-8 bg-white shadow-lg rounded-lg text-center">
            <div className="mb-4">
              <h1 className="text-6xl font-bold text-red-600">Error</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mt-2">
                A critical error occurred
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              A critical error occurred in the application. Please try again.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
