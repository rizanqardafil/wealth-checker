export const metadata = {
  title: "Wealth Checker API",
  description: "Personal financial tracking API",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
