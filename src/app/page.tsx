'use client'

import styles from "./page.module.css";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import React from 'react';
import 'katex/dist/katex.min.css';
import MarkdownLaTeXRenderer from "../components/ui/MarkdownLaTeXRenderer";
import { Button, Flex, Heading, HStack, Image, Spinner, Text, Textarea } from "@chakra-ui/react";
            

export default function Home() {
  const [data, setData] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [copiedImageURLs, setCopiedImageURLs] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, toggleLoading] = useState(false);


  const handleUpload = useCallback(() => {
    if (files.length === 0) {
      alert('Please upload a file first.')
      return;
    }

    if (loading) {
      return;
    }

    toggleLoading(true);

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append('file[]', files[i]);
    }
    
    formData.append('prompt', prompt);

    axios.post('/api/prompt', formData).then((res) => {
      setData(res.data.data);      
    }).catch((error) => {
      console.log(`${error}`);
      alert('Error fetching results!');
    }).finally(() => toggleLoading(false));

  }, [files, prompt, loading])


  const handleTransformDataTransferIntoURL = (
    dataTransfer: DataTransfer,
  ): string | null => {
    const [firstItem] = dataTransfer.items
    const blob = firstItem.getAsFile()

    if (blob) {
      setFiles([...files, blob]);
      return URL.createObjectURL(blob)
    }

    return null;
    
  }  

  const clearPrompt = useCallback(() => {
    setFiles([]);
    setCopiedImageURLs([]);
    setPrompt('');
    setData('');
  }, [])
  
  useEffect(() => {
    const handlePasteOnDocument = (e: ClipboardEvent) => {
      if (e.clipboardData) {
        const url = handleTransformDataTransferIntoURL(e.clipboardData)

        if (url) {
          setCopiedImageURLs([...copiedImageURLs, url]);
        }        
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

      if (e.key === "Escape") {
        clearPrompt();
      }
    }

    document.addEventListener('keydown', handleEnter);

    return () => {
      document.removeEventListener('keydown', handleEnter);
    }
  }, [handleUpload, clearPrompt])
             
  
  return (
    <Flex flexDir={'column'} alignItems={'center'} py={'50px'}>      
      <Heading fontSize={'4xl'}>GPT Unlocked 🔓</Heading>
      <Flex className={styles.image} mt={'10vh'} mb={'5vh'}>
        {(copiedImageURLs.length !== 0) ? (
          <Flex pos={'relative'} flexDir={'column'} pb={'35px'}>
            <HStack className={'customScrollbar'} maxW={'80vw'} overflow={'auto'}>
            {copiedImageURLs.map((url) => (            
              <Image key={url} alt={'user uploaded image'} maxW={'70vw'} h={'40vh'} src={url}/>            
            ))}
            </HStack>            
            <Button onClick={clearPrompt} pos={'absolute'} bottom={0}  w={'100px'} h={'30px'} mt={'5px'} bgColor={'red.400'}  alignSelf={'flex-end'}>Clear</Button>
          </Flex>
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
