import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export function ButtonLink({
  href,
  children,
  secondary = false,
  testId,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
  testId: string;
}) {
  return (
    <Link
      href={href}
      className={`${secondary ? "button-secondary" : "button-primary"} focus-ring`}
      data-testid={testId}
    >
      {children}
      <ArrowRight size={16} />
    </Link>
  );
}
