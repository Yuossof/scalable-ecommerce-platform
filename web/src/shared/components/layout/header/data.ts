type TLinks = {
    title: string,
    to: string,
    CSRLink?:boolean
}

export const links: TLinks[] = [
    { title: "Home", to: "/" , CSRLink: false},
    { title: "Shop", to: "/shop", CSRLink: true  },
    { title: "Check", to: "/checkout" },
    { title: "New Arrivals", to: "/new-arrivals" },
    { title: "Bestsellers", to: "/bestsellers" },
    { title: "Contact", to: "/contact" },
]