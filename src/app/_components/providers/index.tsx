import type { ReactNode } from "react";
import AuthProvider from "./AuthProvider";

type Props = {
  children: ReactNode;
};
export default function Providers({ children }: Props) {
  return <AuthProvider>{children}</AuthProvider>;
}
