export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function AppointmentDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
