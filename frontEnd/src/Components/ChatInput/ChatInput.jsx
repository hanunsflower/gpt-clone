import styles from "./ChatInput.module.css";
import {Plus, ArrowUp, Mic } from 'lucide-react'
import { useState } from "react";

function ChatInput({isLoading, handleSubmit}) {

  const [input, setInput]= useState('');

  function submitHandler(e){
    e.preventDefault();
    handleSubmit(input);
    setInput('');
  }
   
  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={submitHandler}>
        <div className={styles.icon}>
          <Plus size={20}/>
        </div>
        <input
          type="text"
          className={styles.input}
          placeholder="Ask anything"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />

        {input?.trim() ? (
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
          >
            <ArrowUp size={18} />
          </button>
        ) : (
          <>
            <div className={styles.icon}>
              <Mic size={20} />
            </div>
          </>
        )}
      </form> 
    </div>
  );
}

export default ChatInput;
