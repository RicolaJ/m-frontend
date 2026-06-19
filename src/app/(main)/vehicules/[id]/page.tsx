export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/vehicles/?page_size=100`
    )
    const data = await res.json()
    return (data.results || []).map((v: { id: number }) => ({
      id: String(v.id),
    }))
  } catch {
    return []
  }
}
import VehicleDetailPage from './client'

// IDs are only known at request time (fetched client-side from the external API).
// `output: 'export'` requires at least one statically generated path for a dynamic
// segment, so a single placeholder shell is emitted; real IDs are resolved at runtime
// via useParams() and served through the SPA fallback redirect (/* -> /index.html).
export function generateStaticParams() {
  return [{ id: 'placeholder' }]
}

export default function Page() {
  return <VehicleDetailPage />
}
