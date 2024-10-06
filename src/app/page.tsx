"use client";

import {
  FileTextOutlined,
  LinkOutlined,
  TranslationOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Input,
  Layout,
  message,
  Radio,
  RadioChangeEvent,
  Select,
  Space,
  Spin,
  theme,
  Typography,
} from "antd";
import { marked } from "marked";
import React, { useState } from "react";

const { Header, Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const useStyles = () => {
  const { useToken } = theme;
  const { token } = useToken();

  return {
    layout: {
      minHeight: "100vh",
      width: "100vw",
      overflowX: "hidden" as const,
    },
    headerContent: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: `${token.padding}px ${token.padding * 2}px`,
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
    },
    logo: {
      fontSize: 48,
      color: "white",
      marginBottom: token.marginXS,
    },
    header: {
      background: `radial-gradient(circle, #88B6BF, #4A7A85)`,
      padding: `${token.padding}px 0`,
      height: "auto",
    },
    headerTitle: {
      color: "transparent",
      background: "linear-gradient(45deg, #FFD700, #FFA500)",
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      margin: `${token.marginXS}px 0`,
      fontSize: token.fontSizeHeading1,
      textAlign: "center" as const,
      fontWeight: "bold",
    },
    headerSubtitle: {
      color: "transparent",
      background: "linear-gradient(to right, #E0F2F7, #FFFFFF)",
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      margin: `${token.marginXS}px 0`,
      fontSize: token.fontSizeHeading3,
      textAlign: "center" as const,
      fontStyle: "italic",
      letterSpacing: "1px",
      textShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
    },
    mainContent: {
      flex: 1,
      padding: `${token.padding * 4}px 0`,
      backgroundColor: "#fff",
      overflowY: "auto" as const,
    },
    contentWrapper: {
      margin: "0 auto",
      padding: `0 ${token.padding * 1.5}px`,
      maxWidth: 1200,
      width: "100%",
    },
  };
};

const ContentSummarizer = () => {
  const [inputType, setInputType] = useState("youtube");
  const [inputValue, setInputValue] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("English");
  const [translatedSummary, setTranslatedSummary] = useState("");
  const [translating, setTranslating] = useState(false);
  const [targetTranslateLanguage, setTargetTranslateLanguage] =
    useState("Vietnamese");

  const styles = useStyles();

  const handleInputTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputType(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const handleTargetTranslateLanguageChange = (value: string) => {
    setTargetTranslateLanguage(value);
  };

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputType, inputValue, language }),
      });

      if (!response.ok) {
        throw new Error("Failed to summarize content");
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Error summarizing content:", error);
      message.error("Failed to summarize content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    setTranslating(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: summary, targetTranslateLanguage }),
      });

      if (!response.ok) {
        throw new Error("Failed to translate content");
      }

      const data = await response.json();
      setTranslatedSummary(data.translatedText);
    } catch (error) {
      console.error("Error translating content:", error);
      message.error("Failed to translate content. Please try again.");
    } finally {
      setTranslating(false);
    }
  };

  return (
    <Layout style={styles.layout}>
      <Header style={styles.header}>
        <div style={styles.headerContent}>
          <Avatar
            src="/synapse.png"
            shape="square"
            size={64}
            style={styles.logo}
          />
          <Title level={1} style={styles.headerTitle}>
            Synapse
          </Title>
          <Title level={3} style={styles.headerSubtitle}>
            See through the noise
          </Title>
        </div>
      </Header>
      <Content style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Radio.Group
                onChange={(e: RadioChangeEvent) =>
                  handleInputTypeChange(e.target.value)
                }
                value={inputType}
                buttonStyle="solid"
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Radio.Button value="youtube">
                  <YoutubeOutlined /> YouTube
                </Radio.Button>
                <Radio.Button value="article">
                  <LinkOutlined /> Article
                </Radio.Button>
                <Radio.Button value="text">
                  <FileTextOutlined /> Text
                </Radio.Button>
              </Radio.Group>
              <TextArea
                placeholder={
                  inputType === "youtube"
                    ? "Enter YouTube URL"
                    : inputType === "article"
                    ? "Enter article URL"
                    : "Paste your text here"
                }
                value={inputValue}
                onChange={handleInputChange}
                autoSize={{ minRows: 1, maxRows: 5 }}
                style={{
                  fontSize: "16px",
                  maxWidth: "70%",
                  margin: "0 auto",
                  display: "block",
                }}
              />
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Space>
                  <Select
                    defaultValue="English"
                    style={{ width: 120 }}
                    onChange={handleLanguageChange}
                  >
                    <Option value="English">English</Option>
                    <Option value="Vietnamese">Vietnamese</Option>
                    <Option value="Japanese">Japanese</Option>
                    <Option value="Chinese">Chinese</Option>
                  </Select>
                  <Button
                    type="primary"
                    onClick={handleSummarize}
                    loading={loading}
                    size="large"
                    icon={<TranslationOutlined />}
                    style={{ height: "32px" }}
                  >
                    Summarize
                  </Button>
                </Space>
              </div>
            </Space>
          </Card>

          {summary && (
            <>
              <Card title="Summary" style={{ marginTop: "24px" }}>
                <Spin spinning={loading}>
                  <div
                    dangerouslySetInnerHTML={{ __html: marked(summary) }}
                    style={{ fontSize: "18px", lineHeight: "1.6" }}
                  />
                </Spin>
              </Card>
              <Card title="Translation" style={{ marginTop: "24px" }}>
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
                >
                  <Space>
                    <Select
                      value={targetTranslateLanguage}
                      style={{ width: 120 }}
                      onChange={handleTargetTranslateLanguageChange}
                    >
                      <Option value="English">English</Option>
                      <Option value="Vietnamese">Vietnamese</Option>
                      <Option value="Japanese">Japanese</Option>
                      <Option value="Chinese">Chinese</Option>
                    </Select>
                    <Button
                      type="primary"
                      onClick={handleTranslate}
                      loading={translating}
                      icon={<TranslationOutlined />}
                    >
                      Translate
                    </Button>
                  </Space>
                  {translatedSummary && (
                    <Spin spinning={translating}>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: marked(translatedSummary),
                        }}
                        style={{ fontSize: "18px", lineHeight: "1.6" }}
                      />
                    </Spin>
                  )}
                </Space>
              </Card>
            </>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default ContentSummarizer;
