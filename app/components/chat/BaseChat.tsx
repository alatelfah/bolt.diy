/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import type { JSONValue, Message } from 'ai';
import React, { type RefCallback, useEffect, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { Menu } from '~/components/sidebar/Menu.client';
import { Workbench } from '~/components/workbench/Workbench.client';
import { classNames } from '~/utils/classNames';
import { PROVIDER_LIST } from '~/utils/constants';
import { Messages } from './Messages.client';
import { getApiKeysFromCookies } from './APIKeyManager';
import Cookies from 'js-cookie';
import * as Tooltip from '@radix-ui/react-tooltip';
import styles from './BaseChat.module.scss';
import { ImportButtons } from '~/components/chat/chatExportAndImport/ImportButtons';
import { ExamplePrompts } from '~/components/chat/ExamplePrompts';
import GitCloneButton from './GitCloneButton';
import type { ProviderInfo } from '~/types/model';
import StarterTemplates from './StarterTemplates';
import type { ActionAlert, SupabaseAlert, DeployAlert, LlmErrorAlertType } from '~/types/actions';
import DeployChatAlert from '~/components/deploy/DeployAlert';
import ChatAlert from './ChatAlert';
import type { ModelInfo } from '~/lib/modules/llm/types';
import ProgressCompilation from './ProgressCompilation';
import type { ProgressAnnotation } from '~/types/context';
import { SupabaseChatAlert } from '~/components/chat/SupabaseAlert';
import { expoUrlAtom } from '~/lib/stores/qrCodeStore';
import { useStore } from '@nanostores/react';
import { StickToBottom, useStickToBottomContext } from '~/lib/hooks';
import { ChatBox } from './ChatBox';
import type { DesignScheme } from '~/types/design-scheme';
import type { ElementInfo } from '~/components/workbench/Inspector';
import LlmErrorAlert from './LLMApiAlert';

const TEXTAREA_MIN_HEIGHT = 76;

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  onStreamingChange?: (streaming: boolean) => void;
  messages?: Message[];
  description?: string;
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  model?: string;
  setModel?: (model: string) => void;
  provider?: ProviderInfo;
  setProvider?: (provider: ProviderInfo) => void;
  providerList?: ProviderInfo[];
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
  importChat?: (description: string, messages: Message[]) => Promise<void>;
  exportChat?: () => void;
  uploadedFiles?: File[];
  setUploadedFiles?: (files: File[]) => void;
  imageDataList?: string[];
  setImageDataList?: (dataList: string[]) => void;
  actionAlert?: ActionAlert;
  clearAlert?: () => void;
  supabaseAlert?: SupabaseAlert;
  clearSupabaseAlert?: () => void;
  deployAlert?: DeployAlert;
  clearDeployAlert?: () => void;
  llmErrorAlert?: LlmErrorAlertType;
  clearLlmErrorAlert?: () => void;
  data?: JSONValue[] | undefined;
  chatMode?: 'discuss' | 'build';
  setChatMode?: (mode: 'discuss' | 'build') => void;
  append?: (message: Message) => void;
  designScheme?: DesignScheme;
  setDesignScheme?: (scheme: DesignScheme) => void;
  selectedElement?: ElementInfo | null;
  setSelectedElement?: (element: ElementInfo | null) => void;
  addToolResult?: ({ toolCallId, result }: { toolCallId: string; result: any }) => void;
}

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      onStreamingChange,
      model,
      setModel,
      provider,
      setProvider,
      providerList,
      input = '',
      enhancingPrompt,
      handleInputChange,

      // promptEnhanced,
      enhancePrompt,
      sendMessage,
      handleStop,
      importChat,
      exportChat,
      uploadedFiles = [],
      setUploadedFiles,
      imageDataList = [],
      setImageDataList,
      messages,
      actionAlert,
      clearAlert,
      deployAlert,
      clearDeployAlert,
      supabaseAlert,
      clearSupabaseAlert,
      llmErrorAlert,
      clearLlmErrorAlert,
      data,
      chatMode,
      setChatMode,
      append,
      designScheme,
      setDesignScheme,
      selectedElement,
      setSelectedElement,
      addToolResult = () => {
        throw new Error('addToolResult not implemented');
      },
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    const [apiKeys, setApiKeys] = useState<Record<string, string>>(getApiKeysFromCookies());
    const [modelList, setModelList] = useState<ModelInfo[]>([]);
    const [isModelSettingsCollapsed, setIsModelSettingsCollapsed] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
    const [transcript, setTranscript] = useState('');
    const [isModelLoading, setIsModelLoading] = useState<string | undefined>('all');
    const [progressAnnotations, setProgressAnnotations] = useState<ProgressAnnotation[]>([]);
    const expoUrl = useStore(expoUrlAtom);
    const [qrModalOpen, setQrModalOpen] = useState(false);

    useEffect(() => {
      if (expoUrl) {
        setQrModalOpen(true);
      }
    }, [expoUrl]);

    useEffect(() => {
      if (data) {
        const progressList = data.filter(
          (x) => typeof x === 'object' && (x as any).type === 'progress',
        ) as ProgressAnnotation[];
        setProgressAnnotations(progressList);
      }
    }, [data]);
    useEffect(() => {
      console.log(transcript);
    }, [transcript]);

    useEffect(() => {
      onStreamingChange?.(isStreaming);
    }, [isStreaming, onStreamingChange]);

    useEffect(() => {
      if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join('');

          setTranscript(transcript);

          if (handleInputChange) {
            const syntheticEvent = {
              target: { value: transcript },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(syntheticEvent);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        setRecognition(recognition);
      }
    }, []);

    useEffect(() => {
      if (typeof window !== 'undefined') {
        let parsedApiKeys: Record<string, string> | undefined = {};

        try {
          parsedApiKeys = getApiKeysFromCookies();
          setApiKeys(parsedApiKeys);
        } catch (error) {
          console.error('Error loading API keys from cookies:', error);
          Cookies.remove('apiKeys');
        }

        setIsModelLoading('all');
        fetch('/api/models')
          .then((response) => response.json())
          .then((data) => {
            const typedData = data as { modelList: ModelInfo[] };
            setModelList(typedData.modelList);
          })
          .catch((error) => {
            console.error('Error fetching model list:', error);
          })
          .finally(() => {
            setIsModelLoading(undefined);
          });
      }
    }, [providerList, provider]);

    const onApiKeysChange = async (providerName: string, apiKey: string) => {
      const newApiKeys = { ...apiKeys, [providerName]: apiKey };
      setApiKeys(newApiKeys);
      Cookies.set('apiKeys', JSON.stringify(newApiKeys));

      setIsModelLoading(providerName);

      let providerModels: ModelInfo[] = [];

      try {
        const response = await fetch(`/api/models/${encodeURIComponent(providerName)}`);
        const data = await response.json();
        providerModels = (data as { modelList: ModelInfo[] }).modelList;
      } catch (error) {
        console.error('Error loading dynamic models for:', providerName, error);
      }

      // Only update models for the specific provider
      setModelList((prevModels) => {
        const otherModels = prevModels.filter((model) => model.provider !== providerName);
        return [...otherModels, ...providerModels];
      });
      setIsModelLoading(undefined);
    };

    const startListening = () => {
      if (recognition) {
        recognition.start();
        setIsListening(true);
      }
    };

    const stopListening = () => {
      if (recognition) {
        recognition.stop();
        setIsListening(false);
      }
    };

    const handleSendMessage = (event: React.UIEvent, messageInput?: string) => {
      if (sendMessage) {
        sendMessage(event, messageInput);
        setSelectedElement?.(null);

        if (recognition) {
          recognition.abort(); // Stop current recognition
          setTranscript(''); // Clear transcript
          setIsListening(false);

          // Clear the input by triggering handleInputChange with empty value
          if (handleInputChange) {
            const syntheticEvent = {
              target: { value: '' },
            } as React.ChangeEvent<HTMLTextAreaElement>;
            handleInputChange(syntheticEvent);
          }
        }
      }
    };

    const handleFileUpload = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];

        if (file) {
          const reader = new FileReader();

          reader.onload = (e) => {
            const base64Image = e.target?.result as string;
            setUploadedFiles?.([...uploadedFiles, file]);
            setImageDataList?.([...imageDataList, base64Image]);
          };
          reader.readAsDataURL(file);
        }
      };

      input.click();
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;

      if (!items) {
        return;
      }

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();

          const file = item.getAsFile();

          if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
              const base64Image = e.target?.result as string;
              setUploadedFiles?.([...uploadedFiles, file]);
              setImageDataList?.([...imageDataList, base64Image]);
            };
            reader.readAsDataURL(file);
          }

          break;
        }
      }
    };

    const baseChat = (
      <div className="flex h-full w-full bg-bolt-elements-background-depth-1">
        <Menu />
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <StickToBottom>
                <div className="flex-1 overflow-auto px-6 py-8">
                  {/* Enhanced Welcome Section */}
                  {!chatStarted && (
                    <div className="text-center mb-12 animate-fade-in-up">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center shadow-bolt-elements-shadow-large">
                        <span className="i-ph:bolt h-12 w-12 text-white" />
                      </div>
                      <h1 className="text-4xl font-bold text-bolt-elements-textPrimary mb-4 bg-gradient-to-r from-accent-600 to-accent-800 bg-clip-text text-transparent">
                        Welcome to Bolt
                      </h1>
                      <p className="text-xl text-bolt-elements-textSecondary max-w-2xl mx-auto leading-relaxed">
                        Your AI-powered development companion. Start building, coding, and creating with intelligent assistance.
                      </p>
                    </div>
                  )}
                  
                  {/* Enhanced Messages Section */}
                  <div className="space-y-6">
                    {messages?.map((message, index) => (
                      <div key={message.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                        <Messages
                          message={message}
                          messageRef={messageRef}
                          scrollRef={scrollRef}
                          isLastMessage={index === messages.length - 1}
                          addToolResult={addToolResult}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Enhanced Alerts */}
                  <div className="space-y-4 mt-6">
                    {deployAlert && (
                      <DeployChatAlert
                        alert={deployAlert}
                        clearAlert={() => clearDeployAlert?.()}
                        postMessage={(message) => {
                          sendMessage?.({} as any, message);
                          clearDeployAlert?.();
                        }}
                      />
                    )}
                    {supabaseAlert && (
                      <SupabaseChatAlert
                        alert={supabaseAlert}
                        clearAlert={() => clearSupabaseAlert?.()}
                        postMessage={(message) => {
                          sendMessage?.({} as any, message);
                          clearSupabaseAlert?.();
                        }}
                      />
                    )}
                    {actionAlert && (
                      <ChatAlert
                        alert={actionAlert}
                        clearAlert={() => clearAlert?.()}
                        postMessage={(message) => {
                          sendMessage?.({} as any, message);
                          clearAlert?.();
                        }}
                      />
                    )}
                    {llmErrorAlert && <LlmErrorAlert alert={llmErrorAlert} clearAlert={() => clearLlmErrorAlert?.()} />}
                  </div>
                  
                  {/* Enhanced Progress Section */}
                  {progressAnnotations && (
                    <div className="mt-6 animate-fade-in-up">
                      <ProgressCompilation data={progressAnnotations} />
                    </div>
                  )}
                  
                  {/* Enhanced Chat Input */}
                  <div className="mt-8 animate-fade-in-up stagger-1">
                    <ChatBox
                      isModelSettingsCollapsed={isModelSettingsCollapsed}
                      setIsModelSettingsCollapsed={setIsModelSettingsCollapsed}
                      provider={provider}
                      setProvider={setProvider}
                      providerList={providerList || (PROVIDER_LIST as ProviderInfo[])}
                      model={model}
                      setModel={setModel}
                      modelList={modelList}
                      apiKeys={apiKeys}
                      isModelLoading={isModelLoading}
                      onApiKeysChange={onApiKeysChange}
                      uploadedFiles={uploadedFiles}
                      setUploadedFiles={setUploadedFiles}
                      imageDataList={imageDataList}
                      setImageDataList={setImageDataList}
                      textareaRef={textareaRef}
                      input={input}
                      handleInputChange={handleInputChange}
                      handlePaste={handlePaste}
                      TEXTAREA_MIN_HEIGHT={TEXTAREA_MIN_HEIGHT}
                      TEXTAREA_MAX_HEIGHT={TEXTAREA_MAX_HEIGHT}
                      isStreaming={isStreaming}
                      handleStop={handleStop}
                      handleSendMessage={handleSendMessage}
                      enhancingPrompt={enhancingPrompt}
                      enhancePrompt={enhancePrompt}
                      isListening={isListening}
                      startListening={startListening}
                      stopListening={stopListening}
                      chatStarted={chatStarted}
                      exportChat={exportChat}
                      qrModalOpen={qrModalOpen}
                      setQrModalOpen={setQrModalOpen}
                      handleFileUpload={handleFileUpload}
                      chatMode={chatMode}
                      setChatMode={setChatMode}
                      designScheme={designScheme}
                      setDesignScheme={setDesignScheme}
                      selectedElement={selectedElement}
                      setSelectedElement={setSelectedElement}
                    />
                  </div>
                </div>
                
                {/* Enhanced Action Buttons */}
                <div className="flex flex-col justify-center px-6 pb-8">
                  {!chatStarted && (
                    <div className="flex justify-center gap-4 mb-8 animate-fade-in-up stagger-2">
                      {ImportButtons(importChat)}
                      <GitCloneButton importChat={importChat} />
                    </div>
                  )}
                  
                  {/* Enhanced Example Prompts */}
                  <div className="flex flex-col gap-6">
                    {!chatStarted && (
                      <div className="animate-fade-in-up stagger-3">
                        <ExamplePrompts((event, messageInput) => {
                          if (isStreaming) {
                            handleStop?.();
                            return;
                          }
                          handleSendMessage?.(event, messageInput);
                        })}
                      </div>
                    )}
                    
                    {/* Enhanced Starter Templates */}
                    {!chatStarted && (
                      <div className="animate-fade-in-up stagger-4">
                        <StarterTemplates />
                      </div>
                    )}
                  </div>
                </div>
              </StickToBottom>
              
              {/* Enhanced Scroll to Bottom */}
              <ScrollToBottom />
            </div>
            
            {/* Enhanced Workbench */}
            <ClientOnly>
              {() => (
                <div className="animate-fade-in-up stagger-5">
                  <Workbench chatStarted={chatStarted} isStreaming={isStreaming} setSelectedElement={setSelectedElement} />
                </div>
              )}
            </ClientOnly>
          </div>
        </div>
      </div>
    );

    return <Tooltip.Provider delayDuration={200}>{baseChat}</Tooltip.Provider>;
  },
);

function ScrollToBottom() {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  return (
    !isAtBottom && (
      <>
        <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-bolt-elements-background-depth-1 via-bolt-elements-background-depth-1/80 to-transparent h-24 z-10" />
        <button
          className="sticky z-50 bottom-4 left-1/2 transform -translate-x-1/2 text-sm rounded-full px-6 py-3 flex items-center justify-center gap-3 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-medium shadow-bolt-elements-shadow-medium hover:shadow-bolt-elements-shadow-large transition-all duration-300 hover:scale-105 backdrop-blur-sm"
          onClick={() => scrollToBottom()}
        >
          <span className="i-ph:arrow-down h-4 w-4 animate-bounce" />
          Go to latest message
        </button>
      </>
    )
  );
}
