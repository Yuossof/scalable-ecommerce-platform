import AccountNav from "@/features/account/components/account-nav";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 lg:py-10">
      <AccountNav />
      <div className="mt-8">{children}</div>
    </div>
  );
}
