import { ChevronDown, Menu } from "lucide-react"
import LinkButton from "../../link-button-client-cmp"
import { storeConfig } from "@/conf/config.store"

const CategoriesBar = () => {
  return (
    <div className="bg-gray-50 border-b border-gray-100 hidden lg:block">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 h-12">
          {/* All Categories Dropdown */}
          <LinkButton
            href="/shop"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-hover transition-colors"
          >
            <Menu className="w-4 h-4" />
            <span>All Categories</span>
            <ChevronDown className="w-4 h-4" />
          </LinkButton>

          {/* Main Links */}
          <nav className="flex items-center ml-4">
            {storeConfig.navLinks.map((link) => (
              <LinkButton
                key={link.name}
                href={link.href}
                className={`
                  px-4 py-2 text-sm font-medium transition-colors rounded-lg
                  ${link.highlight 
                    ? 'text-secondary hover:bg-secondary-light' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                  }
                `}
              >
                {link.name}
                {link.highlight && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-secondary text-white text-[10px] font-bold rounded">
                    HOT
                  </span>
                )}
              </LinkButton>
            ))}
          </nav>

          {/* Right Side - Special Offer */}
          <div className="ml-auto">
            <LinkButton 
              href="/shop?sort=price-asc" 
              className="flex items-center gap-2 text-sm text-secondary font-semibold hover:underline"
            >
              <span>🎉</span>
              <span>Special Offers - Up to 50% OFF</span>
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoriesBar