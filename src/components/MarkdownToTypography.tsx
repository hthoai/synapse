import React from 'react';
import { Typography, List } from 'antd';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const { Title, Paragraph, Text, Link } = Typography;

interface MarkdownToTypographyProps {
  markdown: string;
}

const MarkdownToTypography: React.FC<MarkdownToTypographyProps> = ({ markdown }) => {
  const components = {
    h1: ({ children }) => <Title level={1}>{children}</Title>,
    h2: ({ children }) => <Title level={2}>{children}</Title>,
    h3: ({ children }) => <Title level={3}>{children}</Title>,
    h4: ({ children }) => <Title level={4}>{children}</Title>,
    h5: ({ children }) => <Title level={5}>{children}</Title>,
    p: ({ children }) => <Paragraph>{children}</Paragraph>,
    strong: ({ children }) => <Text strong>{children}</Text>,
    em: ({ children }) => <Text italic>{children}</Text>,
    a: ({ href, children }) => <Link href={href}>{children}</Link>,
    code: ({ inline, className, children }) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter language={match[1]} style={coy}>
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <Text code>{children}</Text>
      );
    },
    ul: ({ children }) => <List itemLayout="vertical">{children}</List>,
    ol: ({ children }) => <List itemLayout="vertical">{children}</List>,
    li: ({ children }) => <List.Item>{children}</List.Item>,
  };

  return (
    <Typography>
      <ReactMarkdown components={components}>{markdown}</ReactMarkdown>
    </Typography>
  );
};

export default MarkdownToTypography;