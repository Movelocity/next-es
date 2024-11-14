'use client'

import React, { useState } from 'react';
import cn from 'classnames'
const HtmlPasteViewer = () => {
  const [htmlContent, setHtmlContent] = useState('');
  const [shouldWrapPlainText, setShouldWrapPlainText] = useState(true);
  // const [plainTextContent, setPlainTextContent] = useState('');
  const handlePaste = (event: React.ClipboardEvent) => {
    // event.preventDefault();  // Prevent default paste behavior
    const paste = (event.clipboardData).getData('text/html');  // Get pasted data via clipboard API
    // const pastedText = (event.clipboardData).getData('text/plain');
    setHtmlContent(paste);   // Update state with pasted HTML
    // setPlainTextContent(pastedText);
    // console.log(pastedText)
  };

  return (
    <div style={{ padding: '20px' }}>
      <div className="flex flex-row w-full h-full">
        <div className="w-[32%] h-[85vh]">
          <h3>渲染结果</h3>
          <div className="bg-gray-500 h-full p-2 overflow-x-scroll custom-scroll" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
        <div className="w-[32%] h-[85vh] ml-2">
          <h2>此处粘贴 HTML</h2>
          <textarea
            onPaste={handlePaste}
            placeholder="Paste your HTML content here..."
            className='bg-gray-600 p-2 w-full h-full overflow-x-scroll custom-scroll'
            rows={26}
          />
        </div>
        <div className="w-[32%] h-[85vh] ml-2">
          <div className="flex flex-row">
            <h3>纯文本</h3>
            <button className="ml-2 hover:bg-slate-700 rounded-sm px-2" onClick={()=>setShouldWrapPlainText(!shouldWrapPlainText)}>wrap</button>
          </div>
          <pre className={cn("bg-gray-800 p-3 w-full h-full overflow-scroll custom-scroll", shouldWrapPlainText&&"text-wrap")}>
            {htmlContent || 'No HTML content pasted yet.'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default HtmlPasteViewer;