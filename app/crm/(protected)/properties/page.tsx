import { PropertyList } from "@/components/crm/property/PropertyList";

export default async function PropertiesPage({ searchParams }: {
  searchParams: Promise<{ id?: string; ownerId?: string }>;
}) {
  const params = await searchParams;
  return <PropertyList propertyId={params.id ?? null} ownerId={params.ownerId ?? ""} />;
}
