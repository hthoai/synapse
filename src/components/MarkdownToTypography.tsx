import { List, Typography } from "antd";
import React from "react";
import ReactMarkdown, { Components } from "react-markdown";

const components: Components = {
  h1: ({ children }) => (
    <Typography.Title level={1}>{children}</Typography.Title>
  ),
  h2: ({ children }) => (
    <Typography.Title level={2}>{children}</Typography.Title>
  ),
  h3: ({ children }) => (
    <Typography.Title level={3}>{children}</Typography.Title>
  ),
  h4: ({ children }) => (
    <Typography.Title level={4}>{children}</Typography.Title>
  ),
  h5: ({ children }) => (
    <Typography.Title level={5}>{children}</Typography.Title>
  ),
  p: ({ children }) => <Typography.Paragraph>{children}</Typography.Paragraph>,
  strong: ({ children }) => (
    <Typography.Text strong>{children}</Typography.Text>
  ),
  em: ({ children }) => <Typography.Text italic>{children}</Typography.Text>,
  code: ({ children }) => <Typography.Text code>{children}</Typography.Text>,
  a: ({ children, href }) => (
    <Typography.Link href={href}>{children}</Typography.Link>
  ),
  ul: ({ children }) => <List itemLayout="vertical">{children}</List>,
  ol: ({ children }) => (
    <List itemLayout="vertical" bordered>
      {children}
    </List>
  ),
  li: ({ children }) => (
    <List.Item>
      <Typography.Text>{children}</Typography.Text>
    </List.Item>
  ),
};

interface MarkdownToTypographyProps {
  markdown: string;
}

const MarkdownToTypography: React.FC<MarkdownToTypographyProps> = ({
  markdown,
}) => {
  return (
    <Typography>
      <ReactMarkdown components={components}>{markdown}</ReactMarkdown>
    </Typography>
  );
};

export default MarkdownToTypography;
