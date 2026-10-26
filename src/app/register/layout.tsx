import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ro'yxatdan o'tish",
  alternates: { canonical: "/register" },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
