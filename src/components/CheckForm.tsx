"use client";

import { useState } from "react";
import { Button, Form, Input, App } from 'antd';
import { checkUrl } from '@/app/actions';

export function CheckForm() {
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  async function handleSubmit(values: { url: string }) {
    setLoading(true);

    try {
      const result = await checkUrl(values.url);

      if (!result.success) {
        message.error(result.message);
        return;
      }

      message.success("Проверка выполнена");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form onFinish={handleSubmit} layout="inline">
      <Form.Item
        name="url"
        rules={[{ required: true, message: "Введите URL"}]}
        style={{ minWidth: 320 }}
      >
        <Input placeholder="https://example.com" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>Проверить</Button>
      </Form.Item>
    </Form>
  )
}