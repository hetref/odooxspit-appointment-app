export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function AppointmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
