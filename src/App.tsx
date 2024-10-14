import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import "./App.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import { useState } from "react";

type ChatMessage = {
  message: string;
  sender: string;
  direction?: "incoming" | "outgoing";
};
const API_KEY =""; //add your openai api key here

function App() {
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      message: "Hello, I'm chat gpt. How can I help you?",
      sender: "ChatGPT",
      direction: "incoming",
    },
  ]);
  const handleSend = async (message: string) => {
    const newMessage: ChatMessage = {
      message,
      sender: "User",
      direction: "outgoing",
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setIsTyping(true);
    await processMessage(newMessages);
  };
  async function processMessage(chatMessages: ChatMessage[]) {
    const apiMesage = chatMessages.map((mess: ChatMessage) => {
      let role = "";
      if (mess.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: mess.message };
    });
    // role: 'user' | 'assistant';
    //system => generally one initial message from the assistant
    const systemMessage = {
      role: "system",
      content: "Welcome to the chat",
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMesage],
    };
    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        console.log(data.choices[0].message.content);
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
            direction: "incoming",
          },
        ]);
        setIsTyping(false);
      });
  }

  return (
    <div className="App">
      <div
        style={{
          position: "relative",
          height: "800px",
          width: "700px",
        }}
      >
        <MainContainer>
          <ChatContainer>
            <MessageList
              typingIndicator={
                isTyping ? (
                  <TypingIndicator content="ChatGpt is typing" />
                ) : (
                  "null"
                )
              }
            >
              {messages.map((message, index) => (
                <Message
                  key={index}
                  model={{
                    message: message.message,
                    direction: message.direction || "outgoing",
                    position: "single", // or another appropriate value
                  }}
                />
              ))}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
