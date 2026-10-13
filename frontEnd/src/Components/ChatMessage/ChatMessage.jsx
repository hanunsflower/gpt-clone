import { User, Bot } from "lucide-react";
import './ChatMessage.module.css'
import ReactMarkDown from "react-markdown";
import styles from "./ChatMessage.module.css";

function ChatMessage({ role, content }) {
  return (
    <div className={`${styles.message} ${styles[role]}`}>
      <div className={`${styles.avatar} ${styles[role]}`}>
        {role === "user" ? <User size={18} color="white" /> : <Bot size={24} />}
      </div>

      <div className={styles.content}>
        {role === "user" ? (
          content
        ) : (
          <div className={styles.markdownBody}>
            <ReactMarkDown>{content}</ReactMarkDown>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
