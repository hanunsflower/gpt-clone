import Sidebar from "./Components/Sidebar/Sidebar.jsx";
import ChatHeader from "./Components/ChatHeader/ChatHeader";
import MessageList from "./Components/MessageList/MessageList";
import ChatInput from "./Components/ChatInput/ChatInput.jsx";

import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_URL = "https://gpt.reyhanahamza.com/api";

function App() {
const [conversations, setConversations] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const lastMessageRef = useRef(null);

async function fetchConversations() {
try {
const { data } = await axios.get(
`${API_URL}/chat/conversations`
);


  setConversations(data.data);
} catch (error) {
  console.log(error.message);
}


}

async function handleSubmit(question) {
if (!question.trim()) {
return;
}


const tempQuestion = {
  id: Date.now(),
  content: question.trim(),
  role: "user",
};

setConversations((prev) => [...prev, tempQuestion]);
setIsLoading(true);

try {
  const { data } = await axios.post(
    `${API_URL}/chat/conversations`,
    {
      question: question.trim(),
    }
  );

  if (data?.data?.assistantConversation) {
    setConversations((prev) => [
      ...prev,
      data.data.assistantConversation,
    ]);
  }
} catch (error) {
  console.error(
    "Failed to send message:",
    error.response?.data || error.message
  );
} finally {
  setIsLoading(false);
}


}

useEffect(() => {
fetchConversations();
}, []);

useEffect(() => {
lastMessageRef.current?.scrollIntoView({
behavior: "smooth",
});
}, [conversations, isLoading]);

return ( <div className="app"> <Sidebar />

  <main className="main">
    <ChatHeader />

    <MessageList
      lastMessageRef={lastMessageRef}
      isLoading={isLoading}
      conversations={conversations}
    />

    <ChatInput
      isLoading={isLoading}
      handleSubmit={handleSubmit}
    />
  </main>
</div>


);
}

export default App;
