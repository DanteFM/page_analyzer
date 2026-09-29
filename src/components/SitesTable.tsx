"use client";

import { Table, Tag } from 'antd';
import { getSitesWithLastCheck } from '@/app/actions';
import Link from 'next/link';

type Props = {
  data: Awaited<ReturnType<typeof getSitesWithLastCheck>>;
};

export function SitesTable({ data }: Props) {
  return (
    <Table
      rowKey={(row) => row.site.id}
      dataSource={data}
      pagination={{ placement: ['bottomEnd'] }}
      columns={[
        {
          title: "URL",
          dataIndex: ["site", "url"],
          render: (url: string, row) => (
            <Link href={`/sites/${row.site.id}`}>{url}</Link>
          )
        },
        {
          title: "Статус",
          render: (_, row) => {
            if (!row.lastCheck) return <Tag>нет проверок</Tag>;
            return row.lastCheck.status === "done" ? (
              <Tag color="green">{row.lastCheck.httpStatus}</Tag>
            ) : (
              <Tag color="red">ошибка</Tag>
            );
          },
        },
        {
          title: "Title",
          dataIndex: ["lastCheck", "title"],
          render: (value) => value ?? "-",
        },
        {
          title: "Description",
          dataIndex: ["lastCheck", "description"],
          render: (value) => value ?? "-",
          ellipsis: true,
        }
      ]}
    />
  )
}