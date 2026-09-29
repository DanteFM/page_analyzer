import Title from "antd/es/typography/Title";
import Link from "next/link";
import { getSiteWithChecks } from "@/app/actions";
import { ChecksTable } from "@/components/ChecksTable";

export  default async function SitePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const { checks, site } = await getSiteWithChecks(id);

  return (
    <div style={{ padding: 24 }}>
      <Link href="/">← ко всем сайтам</Link>
      <Title level={2}>{site.url}</Title>
      <ChecksTable checks={checks} />
    </div>
  )
}