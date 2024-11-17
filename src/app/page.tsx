'use client'

import styles from "./page.module.css";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import React from 'react';
import 'katex/dist/katex.min.css';
import MarkdownLaTeXRenderer from "../components/ui/MarkdownLaTeXRenderer";
import { Button, Flex, Heading, Image, Spinner, Text, Textarea } from "@chakra-ui/react";
            

export default function Home() {
  const [data, setData] = useState("");
  const [file, setFile] = useState<File>();
  const [copiedImageURL, setCopiedImageURL] = useState('');
  const [prompt, setPrompt] = useState("");
  const [loading, toggleLoading] = useState(false);


  const handleUpload = useCallback(() => {
    if (!file) {
      alert('Please upload a file first.')
      return;
    }

    if (loading) {
      return;
    }

    toggleLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', prompt);

    axios.post('/api/prompt', formData).then((res) => {
      setData(res.data.data);
      toggleLoading(false);
    })
  }, [file, prompt, loading])


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

  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleUpload();
      }
    }

    document.addEventListener('keydown', handleEnter);

    return () => {
      document.removeEventListener('keydown', handleEnter);
    }
  }, [handleUpload])
             
  
  return (
    <Flex flexDir={'column'} alignItems={'center'} py={'50px'}>      
      <Heading fontSize={'4xl'}>GPT Unlocked 🔓</Heading>
      <Flex className={styles.image} mt={'10vh'} mb={'5vh'}>
        {copiedImageURL ? (
          <Image alt={'user uploaded image'} maxW={'70vw'} maxH={'50vh'} src={copiedImageURL}/>
        ) : (
          <Flex flexDir={'column'} alignItems={'center'}>
            <Heading>{'No image uploaded yet'}</Heading>
            <Text>{'Paste in an image to get started!'}</Text>
          </Flex>
        )}
      </Flex>   
      <Flex flexDir={'column'}>
        <Text>Prompt (optional)</Text>
        <Textarea minW={'250px'} p={2} placeholder="Can you solve this problem for me?" value={prompt} onChange={(e) => setPrompt(e.target.value)}/>
      </Flex>
      <Button my={'20px'} minW={'250px'} size={'lg'} onClick={handleUpload}>Submit</Button>            
      { (loading) ? (
        <Spinner size={'xl'}/>
      ) : (
        <></>
      )}   
      <Flex maxW={'80%'} mt={'5vh'}>
        <MarkdownLaTeXRenderer content={data}/>              
      </Flex>
    </Flex>
  );
}
