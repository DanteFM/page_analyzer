import { Button } from "antd";
  import Title from "antd/es/typography/Title";
export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Анализатор страниц</Title>      
      <Button type="primary">Проверить</Button>
    </div>
  );
}
