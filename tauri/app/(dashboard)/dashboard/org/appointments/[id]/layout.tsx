export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function EditAppointmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
