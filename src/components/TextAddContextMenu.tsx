import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface TextSelectionMenuProps {
  targetRef: React.RefObject<HTMLElement>;
  textAreaRef?: React.RefObject<HTMLTextAreaElement>;
  onAddCard?: (text: string) => void;
}

export const TextSelectionMenu: React.FC<TextSelectionMenuProps> = ({ 
  targetRef,
  textAreaRef,
  onAddCard
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [isFormatted, setIsFormatted] = useState(false);
  const [activeElement, setActiveElement] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [selectionStart, setSelectionStart] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const handleAddCard = () => {
    if (onAddCard) {
      onAddCard(selectedText);
    }
    setMenuVisible(false);
  };

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!targetRef.current?.contains(target)) return;

      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        const element = target;
        const start = element.selectionStart || 0;
        const end = element.selectionEnd || 0;
        const text = element.value.substring(start, end);

        if (text) {
          e.preventDefault();
          setActiveElement(element);
          setSelectionStart(start);
          setSelectedText(text);
          setMenuPosition({ x: e.clientX, y: e.clientY });
          setMenuVisible(true);
        }
      } else {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim() || '';
  
        if (selectedText) {
          e.preventDefault();
          setSelectedText(selectedText);
          setMenuPosition({ x: e.clientX, y: e.clientY });
          setMenuVisible(true);
        }
      }
      
    };

    const handleClickOutside = () => {
      setMenuVisible(false);
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [targetRef]);

  if (!menuVisible) return null;

  return (
    <div 
      ref={menuRef}
      style={{
        position: 'fixed',
        left: `${menuPosition.x}px`,
        top: `${menuPosition.y}px`,
        backgroundColor: 'white',
        border: '1px solid #ddd',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: 9999,
        padding: '5px 0',
        minWidth: '150px'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      
      <div 
        style={{ 
          padding: '8px 15px', 
          cursor: 'pointer',
          borderTop: '1px solid #eee'
        }}
        onClick={handleAddCard}
      >
        {t.common.write}
      </div>
    </div>
  );
};