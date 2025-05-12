import axios from 'axios';
import Cookies from 'js-cookie';

interface ContextSentence {
  text: string;
  textTranslate: string;
}

interface ContextResponse {
  sentences: ContextSentence[];
}

const API_URL = process.env.REACT_APP_API_CONTEXT_URL;

const getLanguageName = (code: string): string => {
  const languageMap: Record<string, string> = {
    en: 'english',
    ru: 'russian',
    es: 'spanish',
    de: 'german',
    fr: 'french'
  };
  return languageMap[code] || 'english';
};

export const contextApi = {
  getContextSentences: async (word: string): Promise<ContextResponse> => {
    try {
      const nativeLang = Cookies.get('nativeLang') || 'ru';
      const learningLang = Cookies.get('learningLang') || 'en';
      
      const response = await axios.post(`${API_URL}`, {
        word,
        nativeLang: getLanguageName(nativeLang),
        learningLang: getLanguageName(learningLang)
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('API Context Error:', error);
      throw error;
    }
  }
};