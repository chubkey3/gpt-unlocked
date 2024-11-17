'use client'

import styles from "./page.module.css";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import React from 'react';
import 'katex/dist/katex.min.css';
import MarkdownLaTeXRenderer from "./MarkdownLaTeXRenderer";
            

export default function Home() {
  const [data, setData] = useState("");
  const [file, setFile] = useState<File>();
  const [copiedImageURL, setCopiedImageURL] = useState('');
  const [prompt, setPrompt] = useState("");


  const handleUpload = useCallback(() => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', prompt);

    axios.post('/api/prompt', formData).then((res) => {
      setData(res.data.data);
    })
  }, [file, prompt])


  const handleTransformDataTransferIntoURL = (
    dataTransfer: DataTransfer,
  ): string => {
    const [firstItem] = dataTransfer.items
    const blob = firstItem.getAsFile()

    if (blob) {
      setFile(blob);
      return URL.createObjectURL(blob)
    }
    
    return ''
    
  }  
  
  useEffect(() => {
    const handlePasteOnDocument = (e: ClipboardEvent) => {
      if (e.clipboardData) {
        const url = handleTransformDataTransferIntoURL(e.clipboardData)
        setCopiedImageURL(url)
      }
    }

    document.addEventListener('paste', handlePasteOnDocument)

    return () => {
      document.removeEventListener('paste', handlePasteOnDocument)
    }
  })  
             
  
  return (
    <div className={styles.page}>
      <main className={styles.main}>      
      <div className={styles.image}>
        {copiedImageURL ? (
          <img src={copiedImageURL}/>
        ) : (
          <p>{'No image uploaded yet!'}</p>
        )}
      </div>      
      <p>Prompt (optional)</p>
      <input placeholder="Can you solve this problem for me?" type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)}/>
      <button onClick={handleUpload}>Submit</button>            
      <MarkdownLaTeXRenderer content={data}/>
      </main>      
    </div>
  );
}
