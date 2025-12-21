export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function OrgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
