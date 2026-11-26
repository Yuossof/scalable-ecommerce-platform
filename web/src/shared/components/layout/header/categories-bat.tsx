import Link from "next/link"
import { ArrowRight, ChevronDown, LayoutGrid } from "lucide-react"
import { storeConfig } from "@/conf/config.store"

const CategoriesBar = () => (
  <div className="hidden border-b border-slate-200 bg-slate-50 lg:block">
    <div className="mx-auto flex h-12 max-w-7xl items-center gap-2 px-4">
      <details className="group relative shrink-0">
        <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          <LayoutGrid aria-hidden="true" className="size-4" />
          All Categories
          <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <nav
          aria-label="Shop by category"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
        >
          <ul className="grid grid-cols-2 gap-1">
            {storeConfig.categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/shop?category=${category.slug}`}
                  onClick={(event) => {
                    event.currentTarget.closest("details")?.removeAttribute("open")
                  }}
                  className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span aria-hidden="true" className="text-base">{category.icon}</span>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </details>

      <nav aria-label="Main navigation" className="flex min-w-0 items-center gap-1">
        {storeConfig.navLinks.filter((link) => link.name !== "Favorites").map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${link.highlight ? "text-accent-strong hover:bg-orange-50" : "text-slate-700 hover:bg-white hover:text-primary"}`}
          >
            {link.name}
            {link.highlight && <span className="rounded bg-accent-strong px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white">HOT</span>}
          </Link>
        ))}
      </nav>

      <Link
        href="/shop?sort=price-asc"
        className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-accent-strong transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Special offers <span className="text-slate-500">up to 50% off</span>
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </div>
  </div>
)

export default CategoriesBar
