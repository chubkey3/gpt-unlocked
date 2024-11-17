// MarkdownLaTeXRenderer.js
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';


const MarkdownLaTeXRenderer = ({ content }: {content: string}) => {
    // Replace \[ with $$ and \] with $$ to ensure compatibility
    const processedText = content 
      .replace(/\\\[/g, '$$$')  // Replace all occurrences of \[ with $$
      .replace(/\\\]/g, '$$$') // Replace all occurrences of \] with $$
      .replace(/\\\(/g, '$$$')  // Replace all occurrences of \( with $$
      .replace(/\\\)/g, '$$$'); // Replace all occurrences of \) with $$

    const remarkMathOptions = {
        singleDollarTextMath: false,
    };

    return (        
        <ReactMarkdown
            className="markdown-content"
            children={processedText}
            remarkPlugins={[[remarkMath, remarkMathOptions], remarkGfm]} // Pass options as the second element of the array
            rehypePlugins={[rehypeRaw, rehypeKatex]} // Include rehypeRaw for HTML, rehypeKatex for LaTeX
        />
    );
};

export default MarkdownLaTeXRenderer;