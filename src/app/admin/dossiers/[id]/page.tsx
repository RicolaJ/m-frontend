export async function generateStaticParams() {
  return []
}
import AdminDossierDetailPage from './client'

// IDs are only known at request time (fetched client-side from the external API).
// `output: 'export'` requires at least one statically generated path for a dynamic
// segment, so a single placeholder shell is emitted; real IDs are resolved at runtime
// via useParams() and served through the SPA fallback redirect (/* -> /index.html).
export function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default function Page() {
  return <AdminDossierDetailPage />
}
