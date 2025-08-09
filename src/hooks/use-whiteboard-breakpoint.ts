import * as React from "react";

const WHITEBOARD_BREAKPOINT = 500;

export function useWhiteboardBreakpoint() {
  const [isUnsupported, setIsUnsupported] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(
      `(max-width: ${WHITEBOARD_BREAKPOINT - 1}px)`,
    );
    const onChange = () => {
      setIsUnsupported(window.innerWidth < WHITEBOARD_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsUnsupported(window.innerWidth < WHITEBOARD_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isUnsupported;
}
