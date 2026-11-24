
"use client";
import { useState, useEffect, forwardRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createPortal } from "react-dom";

type LinkButtonProps = React.ComponentPropsWithoutRef<"a"> & {
  href: string;
  children?: React.ReactNode;
  className?: string;
  prefetch?: boolean;
}

const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ href, children, className = "", prefetch = false, onClick, ...rest }, ref) => {
    const router = useRouter();
    const pathname = usePathname();

    const [loading, setLoading] = useState(false);
    const [overlayEl, setOverlayEl] = useState<HTMLElement | null>(null);

    useEffect(() => {
      setOverlayEl(document.getElementById("main_overlay"));
    }, []);

    useEffect(() => {
      setLoading(false);
    }, [pathname]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      e.preventDefault();
      if (pathname !== href) {
        setLoading(true);
        router.push(href);
      }
    };

    const handlePrefetch = () => {
      if (!prefetch) return;
      router.prefetch(href);
    };

    return (
      <>
        <a
          ref={ref}
          href={href}
          onClick={handleClick}
          onMouseEnter={handlePrefetch}
          {...rest}
          className={`relative z-50 cursor-pointer ${className}`}
        >
          {!children && (<div></div>)}
          {children && children}
        </a>

        {loading &&
          overlayEl &&
          createPortal(
            <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
              <div
                className="w-12 h-12 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"
              />
            </div>,
            overlayEl
          )}
      </>
    );
  }
);

LinkButton.displayName = "LinkButton";
export default LinkButton;
