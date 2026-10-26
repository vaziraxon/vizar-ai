import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parolni tiklash",
  robots: { index: false },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
