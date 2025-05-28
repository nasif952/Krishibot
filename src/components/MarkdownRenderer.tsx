import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import styles from './MarkdownStyles.module.css';
import { toast } from '@/hooks/use-toast';

interface MarkdownRendererProps {
  content: string;
  isDarkMode: boolean;
  messageId: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isDarkMode, messageId }) => {
  const [copiedSnippets, setCopiedSnippets] = useState<Record<string, boolean>>({});

  // Function to handle copying code
  const handleCopyCode = (code: string, snippetId: string) => {
    navigator.clipboard.writeText(code);
    
    // Set the copied state for this specific snippet
    setCopiedSnippets(prev => ({ ...prev, [snippetId]: true }));
    
    // Reset after 2 seconds
    setTimeout(() => {
      setCopiedSnippets(prev => ({ ...prev, [snippetId]: false }));
    }, 2000);
    
    toast({
      title: "কপি হয়েছে",
      description: "কোড ক্লিপবোর্ডে কপি করা হয়েছে",
    });
  };

  // Custom renderers for different markdown elements
  const components = {
    p: (props: any) => <p className="my-2" {...props} />,
    h1: (props: any) => <h1 className="text-xl font-bold my-3" {...props} />,
    h2: (props: any) => <h2 className="text-lg font-bold my-2" {...props} />,
    h3: (props: any) => <h3 className="text-md font-bold my-2" {...props} />,
    ul: (props: any) => <ul className="list-disc pl-5 my-2" {...props} />,
    ol: (props: any) => <ol className="list-decimal pl-5 my-2" {...props} />,
    li: (props: any) => <li className="my-1" {...props} />,
    table: (props: any) => (
      <div className="overflow-x-auto my-2">
        <table className="border-collapse border border-gray-400 w-full" {...props} />
      </div>
    ),
    thead: (props: any) => <thead className={isDarkMode ? "bg-gray-600" : "bg-green-100"} {...props} />,
    tr: (props: any) => <tr className="border-b border-gray-400" {...props} />,
    th: (props: any) => <th className="border border-gray-400 px-2 py-1 text-left" {...props} />,
    td: (props: any) => <td className="border border-gray-400 px-2 py-1" {...props} />,
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const snippetId = `${messageId}-${Math.random().toString(36).substring(2, 9)}`;
      
      return !inline && match ? (
        <div className="relative">
          <div className="absolute right-1 top-1 z-10">
            <button
              onClick={() => handleCopyCode(String(children).replace(/\n$/, ''), snippetId)}
              className={`p-1 rounded-md bg-opacity-50 hover:bg-opacity-100 transition-all ${
                isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {copiedSnippets[snippetId] ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
          <SyntaxHighlighter
            language={match[1]}
            style={tomorrow}
            customStyle={{
              borderRadius: '0.5rem',
              padding: '1rem',
              fontSize: '0.875rem',
              marginTop: '0.5rem',
              marginBottom: '0.5rem'
            }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className={`px-1 py-0.5 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} {...props}>
          {children}
        </code>
      );
    },
    blockquote: (props: any) => (
      <blockquote 
        className={`border-l-4 pl-4 italic my-2 ${
          isDarkMode ? 'border-gray-500 text-gray-300' : 'border-green-500 text-green-700'
        }`} 
        {...props} 
      />
    ),
    hr: (props: any) => (
      <hr className={`my-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`} {...props} />
    ),
  };

  return (
    <div className={styles.markdownContent}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer; 