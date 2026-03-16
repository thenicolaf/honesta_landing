"use client";

import { usePathname, useRouter } from "next/navigation";

interface HashLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export function HashLink({ href, children, onClick, ...props }: HashLinkProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    const [path, hash] = href.split("#");
    if (!hash) return; // no hash — let browser handle normally

    // Already on the target page — just scroll
    if (pathname === (path || "/")) {
      e.preventDefault();
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", href);
      return;
    }

    // Different page — navigate, then scroll after load
    e.preventDefault();
    router.push(path || "/");

    // Wait for page to render, then scroll to hash
    const observer = new MutationObserver(() => {
      const el = document.getElementById(hash);
      if (el) {
        observer.disconnect();
        el.scrollIntoView({ behavior: "smooth" });
        window.history.replaceState(null, "", href);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Safety timeout — disconnect observer after 5s
    setTimeout(() => observer.disconnect(), 5000);
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
