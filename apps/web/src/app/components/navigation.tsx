"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn } = useUser();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navLinks = [
    { href: "/", label: "Home", exact: true },
    { href: "/todos", label: "Todos", exact: false },
    { href: "/profile", label: "Profile", exact: false },
    { href: "/admin", label: "Dashboard", exact: false },
  ];

  const isLinkActive = (link: (typeof navLinks)[number]) => {
    if (link.exact) {
      return isActive(link.href);
    }

    return isActive(link.href) || pathname?.startsWith(`${link.href}/`);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-xl font-bold !text-gray-900 hover:!border-b-0 hover:!text-gray-700"
          >
            CF Next Boilerplate
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const active = isLinkActive(link);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${
                    active
                      ? "!text-blue-600 font-semibold border-b-2 border-blue-600"
                      : "!text-gray-700 hover:!text-blue-600"
                  } transition-colors pb-1 hover:!border-b-2 hover:!border-blue-300`}
                >
                  {link.label}
                </Link>
              );
            })}
            {isSignedIn ? (
              <UserButton />
            ) : (
              <Link
                href="/sign-in"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const active = isLinkActive(link);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`${
                      active
                        ? "!text-blue-600 font-semibold bg-blue-50"
                        : "!text-gray-700 hover:!text-blue-600 hover:bg-gray-50"
                    } px-3 py-2 rounded-md transition-colors hover:!border-b-0`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="px-3 py-2">
                {isSignedIn ? (
                  <UserButton />
                ) : (
                  <Link
                    href="/sign-in"
                    className="block text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
