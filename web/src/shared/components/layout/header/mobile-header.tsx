"use client"
import LinkButton from "../../link-button-client-cmp"
import { storeConfig } from "@/conf/config.store"
const MobileMenu = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Account Links */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <LinkButton href="/login" className="flex-1 py-2.5 text-center bg-primary text-white rounded-lg font-medium text-sm">
            Sign In
          </LinkButton>
          <LinkButton href="/register" className="flex-1 py-2.5 text-center border border-gray-200 text-gray-700 rounded-lg font-medium text-sm">
            Register
          </LinkButton>
        </div>

        {/* Categories */}
        <div className="py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</p>
          <div className="grid grid-cols-2 gap-2">
            {storeConfig.categories.map((cat) => (
              <LinkButton
                key={cat.slug}
                href={`/category/${cat.slug}`}
                onClick={onClose}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
              </LinkButton>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="py-4 border-t border-gray-100">
          {storeConfig.navLinks.map((link) => (
            <LinkButton
              key={link.name}
              href={link.href}
              onClick={onClose}
              className="block py-2.5 text-gray-700 font-medium"
            >
              {link.name}
            </LinkButton>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MobileMenu