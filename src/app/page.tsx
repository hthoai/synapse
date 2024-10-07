"use client";

import MarkdownToTypography from "@/components/MarkdownToTypography";
import { LLM_CONFIG } from "@/config/llm-config";
import {
  FileTextOutlined,
  LinkOutlined,
  MenuOutlined,
  TranslationOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import {
  Avatar,
  Button,
  Card,
  Dropdown,
  Input,
  Layout,
  message,
  Radio,
  RadioChangeEvent,
  Space,
  Spin,
  Tag,
  theme,
  Typography,
} from "antd";

import React, { useState } from "react";

const { Header, Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;

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
  const [selectedModel, setSelectedModel] = useState(LLM_CONFIG.defaultModel);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("English");
  const [translatedSummary, setTranslatedSummary] = useState("");
  const [translating, setTranslating] = useState(false);
  const [targetTranslateLanguage, setTargetTranslateLanguage] =
    useState("Vietnamese");
  const [menuOpen, setMenuOpen] = useState(false);

  const styles = useStyles();

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
  };

  const handleInputTypeChange = (e: RadioChangeEvent) => {
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
        body: JSON.stringify({
          inputType,
          inputValue,
          language,
          model: selectedModel,
        }),
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

  const menuItems: MenuProps["items"] = [
    {
      key: "model",
      label: "Select Model",
      children: LLM_CONFIG.models.map((model) => ({
        key: model.name,
        label: model.label,
        onClick: () => handleModelChange(model.name),
      })),
    },
    {
      key: "language",
      label: "Select Language",
      children: ["English", "Vietnamese", "Japanese", "Chinese"].map(
        (lang) => ({
          key: lang,
          label: lang,
          onClick: () => handleLanguageChange(lang),
        })
      ),
    },
  ];

  const getModelLabel = (modelName: string) => {
    const model = LLM_CONFIG.models.find((m) => m.name === modelName);
    return model ? model.label : modelName;
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
          <Card
            extra={
              <Dropdown
                menu={{ items: menuItems }}
                trigger={["click"]}
                placement="topLeft"
              >
                <Button icon={<MenuOutlined />}>Settings</Button>
              </Dropdown>
            }
          >
            <div style={{ marginBottom: "16px", textAlign: "center" }}>
              <Tag color="blue">Model: {getModelLabel(selectedModel)}</Tag>
              <Tag color="green">Language: {language}</Tag>
            </div>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Radio.Group
                onChange={handleInputTypeChange}
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
              </div>
            </Space>
          </Card>

          {summary && (
            <>
              <Card title="Summary" style={{ marginTop: "24px" }}>
                <Spin spinning={loading}>
                  <MarkdownToTypography markdown={summary} />
                </Spin>
              </Card>
              <Card title="Translation" style={{ marginTop: "24px" }}>
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
                >
                  <Space>
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
                      <MarkdownToTypography markdown={translatedSummary} />
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
