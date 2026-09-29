"use client";

import { Table, Tag } from "antd";
import type { getSiteWithChecks } from "@/app/actions";

type Props = {
  checks: Awaited<ReturnType<typeof getSiteWithChecks>>["checks"];
};

export function ChecksTable({ checks }: Props) {
  return (
    <Table
        rowKey="id"
        dataSource={checks}
        pagination={{ placement: ['bottomEnd'] }}
        columns={[
          {
            title: "Дата",
            dataIndex: "createdAt",
            render: (value: string) => new Date(value).toLocaleString("ru-RU")
          },
          {
            title: "Статус",
            render: (_, row) =>
              row.status === "done"
                ? (<Tag color="green">{row.httpStatus}</Tag>)
                : (<Tag color="red" title={row.error ?? undefined}>ошибка</Tag>)
          },
          {
            title: "Время ответа",
            dataIndex: "responseMs",
            render: (value: number | null) => (value !== null ? `${value} мс` : "-")
          },
          {
            title: "Title",
            dataIndex: "title",
            render: (value: string | null) => value ?? "-"
          }
        ]}
      />
  )
}