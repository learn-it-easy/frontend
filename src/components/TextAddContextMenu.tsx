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
      
      // клик был внутри targetRef или textAreaRef
      const isInsideTarget = targetRef.current?.contains(target);
      const isInsideTextarea = textAreaRef?.current?.contains(target);
      
      if (!isInsideTarget && !isInsideTextarea) return;

      let selectedText = '';
      
      // Обработка textarea
      if (target instanceof HTMLTextAreaElement) {
        const start = target.selectionStart || 0;
        const end = target.selectionEnd || 0;
        selectedText = target.value.substring(start, end).trim();
      } 
      // Обработка обычных элементов
      else {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        selectedText = selection.toString().trim();

        // Для многострочных выделений из разных элементов
        if (range.startContainer !== range.endContainer) {
          const fragment = range.cloneContents();
          const div = document.createElement('div');
          div.appendChild(fragment);
          selectedText = div.textContent?.trim() || selectedText;
        }
      }

      if (selectedText) {
        e.preventDefault();
        setSelectedText(selectedText);
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setMenuVisible(true);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuVisible(false);
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [targetRef, textAreaRef]);

  if (!menuVisible) return null;

  return (
    <div 
      ref={menuRef}
      className="context-menu"
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