import { CheckForm } from "@/components/CheckForm";
import { SitesTable } from "@/components/SitesTable";
import Title from "antd/es/typography/Title";
import { getSitesWithLastCheck } from "./actions";

export default async function Home() {
  const sitesWithChecks = await getSitesWithLastCheck();

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Анализатор страниц</Title>      
      <CheckForm />
      <div style={{marginTop: 24}}>
        <SitesTable data={sitesWithChecks} />
      </div>
    </div>
  );
}
