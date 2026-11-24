"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MapPin, Package } from "lucide-react";

const links = [
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/favorites", label: "Favorites", icon: Heart },
];

const AccountNav = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account sections"
      className="flex flex-wrap gap-2 border-b border-border-primary pb-3"
    >
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-slate-900 text-white"
                : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
};

export default AccountNav;
