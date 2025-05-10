import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface TextSelectionMenuProps {
  targetRef: React.RefObject<HTMLElement>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TextSelectionMenu: React.FC<TextSelectionMenuProps> = ({ 
  targetRef, 
  onInputChange
}) => {
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [isFormatted, setIsFormatted] = useState(false);
  const [activeInput, setActiveInput] = useState<HTMLInputElement | null>(null);
  const [selectionStart, setSelectionStart] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const checkIfFormatted = (input: HTMLInputElement, start: number, end: number, text: string) => {
    if (text.startsWith('==') && text.endsWith('==') && text.length > 4) {
      return true;
    }
    
    const value = input.value;
    const beforeText = value.substring(start - 2, start);
    const afterText = value.substring(end, end + 2);
    
    return beforeText === '==' && afterText === '==';
  };

  const formatSelection = () => {
    if (!selectedText || !activeInput) return;
  
    const currentValue = activeInput.value;
    let newValue = currentValue;
    let newSelectionStart = selectionStart;
    let newSelectionEnd = selectionStart + selectedText.length;
  
    if (isFormatted) {
      let unformattedText = selectedText;
      let startOffset = 0;
      let endOffset = 0;
      
      if (selectedText.startsWith('==') && selectedText.endsWith('==')) {
        unformattedText = selectedText.slice(2, -2);
        startOffset = 0;
        endOffset = 0;
        newValue =
          currentValue.substring(0, selectionStart) +
          unformattedText +
          currentValue.substring(selectionStart + selectedText.length);
      } else {
        const beforeText = currentValue.substring(selectionStart - 2, selectionStart);
        const afterText = currentValue.substring(selectionStart + selectedText.length, selectionStart + selectedText.length + 2);
        
        if (beforeText === '==' && afterText === '==') {
          startOffset = -2;
          endOffset = 2;
          newValue =
            currentValue.substring(0, selectionStart + startOffset) +
            selectedText +
            currentValue.substring(selectionStart + selectedText.length + endOffset);
        }
      }
      
      newSelectionStart = selectionStart + startOffset;
      newSelectionEnd = newSelectionStart + (unformattedText || selectedText).length;
    } else {
      newValue = 
        currentValue.substring(0, selectionStart) + 
        `==${selectedText}==` + 
        currentValue.substring(selectionStart + selectedText.length);
      
      newSelectionStart = selectionStart + 2;
      newSelectionEnd = newSelectionStart + selectedText.length;
    }
  
    activeInput.value = newValue;
    activeInput.setSelectionRange(newSelectionStart, newSelectionEnd);
    
    const event = {
      target: {
        name: activeInput.name,
        value: newValue
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onInputChange(event);
    setMenuVisible(false);
  };

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!targetRef.current?.contains(target)) return;

      if (target instanceof HTMLInputElement) {
        const input = target;
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const text = input.value.substring(start, end);

        if (text) {
          e.preventDefault();
          setActiveInput(input);
          setSelectionStart(start);
          setSelectedText(text);
          setIsFormatted(checkIfFormatted(input, start, end, text));
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
        }}
        onClick={formatSelection}
      >
        {isFormatted ? t.common.removeHihglightText : t.common.highlightText}
      </div>
    </div>
  );
};