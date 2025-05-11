import axios, { AxiosError } from 'axios';
import { ApiErrorResponse } from '../types/auth';
import Cookies from 'js-cookie';

interface TranslateRequest {
  q: string;
  source: string;
  target: string;
  format: string;
  alternatives: number;
  api_key: string;
}

interface TranslateResponse {
  translatedText: string;
}

const API_URL = process.env.REACT_APP_API_TRANSLATE_URL;

export const translateApi = {
  
  async translateText(error: string, text: string): Promise<string> {
    try {
      const source = Cookies.get('learningLang');
      const target = Cookies.get('nativeLang');

      const response = await axios.post<TranslateResponse>(
        `${API_URL}`,
        {
          q: text,
          source,
          target,
          format: 'text',
          alternatives: 0,
          api_key: '',
        } as TranslateRequest,
        {
          headers: {
            withCredentials: true,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.translatedText;
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      throw new Error(axiosError.response?.data?.message || error);
    }
  },
};