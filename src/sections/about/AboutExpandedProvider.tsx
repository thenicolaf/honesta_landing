"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface AboutExpandedContextValue {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  expandAndScroll: () => void;
}

const AboutExpandedContext = createContext<AboutExpandedContextValue>({
  expanded: false,
  setExpanded: () => {},
  expandAndScroll: () => {},
});

export function useAboutExpanded() {
  return useContext(AboutExpandedContext);
}

export function AboutExpandedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  const expandAndScroll = useCallback(() => {
    setExpanded(true);
    // setTimeout(0) ensures React has committed the state update and DOM is ready
    setTimeout(() => {
      document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
      window.history.replaceState(null, "", "/#about");
    }, 0);
  }, []);

  return (
    <AboutExpandedContext.Provider value={{ expanded, setExpanded, expandAndScroll }}>
      {children}
    </AboutExpandedContext.Provider>
  );
}
