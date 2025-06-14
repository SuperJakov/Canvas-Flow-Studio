"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
}

const Portal = ({ children }: PortalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // We check for `mounted` to avoid SSR issues where `document` is not available.
  // The portal will render nothing on the server and then "portal" on the client.
  return mounted ? createPortal(children, document.body) : null;
};

export default Portal;
