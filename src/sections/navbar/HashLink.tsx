"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface HashLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

function scrollToHash(hash: string, fullHref: string) {
  const el = document.getElementById(hash);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
    window.history.replaceState(null, "", fullHref);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return true;
  }
  return false;
}

function waitForElementAndScroll(hash: string, fullHref: string) {
  if (scrollToHash(hash, fullHref)) return;

  // Element not in DOM yet (Suspense) — watch for it
  const mo = new MutationObserver(() => {
    if (scrollToHash(hash, fullHref)) mo.disconnect();
  });
  mo.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => mo.disconnect(), 5000);
}

export function HashLink({ href, children, onClick, ...props }: HashLinkProps) {
  const pathname = usePathname();
  const router = useRouter();

  const hashIdx = href.indexOf("#");
  const hash = hashIdx !== -1 ? href.slice(hashIdx + 1) : "";
  const beforeHash = hashIdx !== -1 ? href.slice(0, hashIdx) : href;
  const targetPath = beforeHash.split("?")[0] || "/";
  const isCurrentPage = pathname === targetPath;

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented || !hash) return;

    e.preventDefault();

    if (isCurrentPage) {
      router.push(beforeHash, { scroll: false });
      requestAnimationFrame(() => scrollToHash(hash, href));
    } else {
      router.push(beforeHash, { scroll: false });
      waitForElementAndScroll(hash, href);
    }
  }

  return (
    <Link href={href} scroll={false} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
