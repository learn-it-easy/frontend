import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import AddCardModal from '../components/AddCardModal';
import { HomeProps } from '../types/auth';
import { TextSelectionMenu } from '../components/TextAddContextMenu';
import leftArrow from '../assets/left-arrow.png';
import rightArrow from '../assets/right-arrow.png';
import backBtn from '../assets/back-button.png';

const TextPage = ({ isAuthenticated }: HomeProps) => {
  const { t } = useTranslation();
  const [text, setText] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('savedText') || '';
    }
    return '';
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'read'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('textViewMode') as 'edit' | 'read') || 'edit';
    }
    return 'edit';
  });
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('currentTextPage') || '0', 10);
    }
    return 0;
  });
  const [pages, setPages] = useState<string[][]>([]);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentReady, setContentReady] = useState(false);
  const [sentencesPerPage, setSentencesPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('sentencesPerPage') || "5");
    }
    return 5;
  });
  
  useEffect(() => {
    localStorage.setItem('sentencesPerPage', sentencesPerPage.toString());
  }, [sentencesPerPage]);

  const MAX_SENTENCES = 15; // Максимальное количество предложений

  const calculateSentencesPerPage = () => {
    if (!contentRef.current) return MAX_SENTENCES;
    
    const sentences = contentRef.current.querySelectorAll('.text-sentence');
    if (sentences.length === 0) return MAX_SENTENCES;
    
    const firstSentence = sentences[0];
    const sentenceHeight = firstSentence.clientHeight;
    const containerHeight = contentRef.current.clientHeight;
    
    return Math.min(
      MAX_SENTENCES,
      Math.max(1, Math.floor(containerHeight / sentenceHeight))
    );
  };

  useEffect(() => {
    if (viewMode === 'read' && contentReady) {
      calculateSentencesPerPage();
    }
  }, [viewMode, contentReady, calculateSentencesPerPage]);

  useEffect(() => {
    localStorage.setItem('savedText', text);
    preparePages();
  }, [text, sentencesPerPage]);
  

  useEffect(() => {
    localStorage.setItem('currentTextPage', currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('textViewMode', viewMode);
  }, [viewMode]);

  const splitTextIntoPages = () => {
    setViewMode('read');
  };

  useEffect(() => {
    setContentReady(true);
    return () => setContentReady(false);
  }, []);


  // Handle paste event
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData('text/plain') || '';
      setText(prev => prev + pastedText);
    };

    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.addEventListener('paste', handlePaste);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener('paste', handlePaste);
      }
    };
  }, []);





  
  
  useEffect(() => {  
    calculateSentencesPerPage();
    const handleResize = () => calculateSentencesPerPage();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateSentencesPerPage, viewMode]);

  const splitIntoSentences = (text: string) => {
    return text.split(/(?<=[.!?])\s+/).filter(s => s.trim() !== '');
  };

  const preparePages = useCallback(() => {
    if (!text.trim()) {
      setPages([]);
      return;
    }

    const sentences = splitIntoSentences(text);
    const newPages: string[][] = [];
    
    for (let i = 0; i < sentences.length; i += sentencesPerPage) {
      newPages.push(sentences.slice(i, i + sentencesPerPage));
    }
    
    setPages(newPages);
  }, [text, sentencesPerPage]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const items = e.dataTransfer.items;
    if (items.length > 0 && items[0].kind === 'file') {
      const file = items[0].getAsFile();
      if (file && file.type.match('text.*')) {
        const fileContent = await file.text();
        setText(prev => prev + fileContent);
      }
    } else {
      const droppedText = e.dataTransfer.getData('text/plain');
      if (droppedText) {
        setText(prev => prev + droppedText);
      }
    }
  };

  const handleAddCard = () => {
    setIsAddModalOpen(false);
  };

  const handleTextSelection = (text: string) => {
    setSelectedText(text);
    setIsAddModalOpen(true);
  };

  const handleClearText = () => {
    setText('');
    localStorage.removeItem('savedText');
    setCurrentPage(0);
  };

  const returnToEditMode = () => {
    setViewMode('edit');
  };

  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
      contentRef.current?.scrollTo(0, 0);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      contentRef.current?.scrollTo(0, 0);
    }
  };

  const renderTextAsPages = () => {
    if (pages.length === 0) {
      return <div className="empty-text-message">{t.textPage.emptyText}</div>;
    }

    return (
      
      <div className="reading-view">
      <div className="controls">
        <label className="sentences-per-page-label">
          {t.textPage.sentencesOnPage}
          <select 
            value={sentencesPerPage}
            onChange={(e) => setSentencesPerPage(Number(e.target.value))}
            className="sentences-per-page-select"
          >
            {[1, 3, 5, 10, 15, 20].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="text-content" ref={contentRef}>
        {pages[currentPage]?.map((sentence, index) => (
          <p key={index} className="text-sentence">
            {sentence}
          </p>
        ))}
      </div>

      <div className="page-navigation">
        <button 
          onClick={goToPrevPage} 
          disabled={currentPage === 0}
          className="nav-button prev-button"
        >
          <img src={leftArrow} alt={t.folders.previous} className="mobile-arrow" />
          <span className="desktop-nav-text">{t.folders.previous}</span>
        </button>
        <span className="page-counter">
          {currentPage + 1} / {pages.length}
        </span>
        <button 
          onClick={goToNextPage} 
          disabled={currentPage === pages.length - 1}
          className="nav-button next-button"
        >
          <span className="desktop-nav-text">{t.folders.next}</span>
          <img src={rightArrow} alt={t.folders.next} className="mobile-arrow" />
        </button>
      </div>

    </div>
      
    );
  };

  return (
    <>
      <div className="textarea-page-container">
        <div className='text-area-module'>
          <h1>{t.textPage.title}</h1>
          <div className='text-area-submodule'>
            {viewMode === 'edit' ? (
              <>
                <button 
                  onClick={handleClearText}
                  className="clear-button"
                >
                  {t.textPage.clearText}
                </button>
                <button 
                  onClick={splitTextIntoPages}
                  className="read-mode-button"
                >
                  {t.textPage.readMode}
                </button>
              </>
            ) : (
              <button 
                onClick={returnToEditMode}
                className="edit-mode-button mobile-back-button"
              >
                 <img src={backBtn} alt={t.textPage.editMode}  className="action-icon" />
                <span>{t.textPage.editMode}</span>
              </button>

              
            )}
          </div>
        </div>
        
        <div 
          ref={containerRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="text-container"
        >
          {viewMode === 'edit' ? (
            <textarea
              ref={textAreaRef}
              spellCheck={false}
              value={text}
              className="text-for-read"
              onChange={(e) => setText(e.target.value)}
              placeholder={t.textPage.placeholder}
            />
          ) : (
            renderTextAsPages()
          )}
        </div>

        <div className='usage-hint'>
          {t.textPage.usageHint}
        </div>

        {isAddModalOpen && (
          <AddCardModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onCardAdded={handleAddCard}
            initialText={selectedText}
          />
        )}

        <TextSelectionMenu 
          targetRef={containerRef}
          textAreaRef={textAreaRef}
          onAddCard={handleTextSelection}
        />
      </div>
    </>
  );
};

export default TextPage;