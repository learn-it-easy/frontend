import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { ApiErrorResponse } from '../types/auth';

const API_BASE_URL = process.env.REACT_APP_API_SUBS_URL;

interface Subtitle {
  start: string;
  end: string;
  text: string;
}

interface SubtitleRequest {
  url: string;
  lang: string;
}

interface SubtitlesResponse {
  status: string;
  language: string;
  subtitles: Subtitle[];
  message?: string;
}

export const fetchSubtitles = async (videoUrl: string): Promise<{
  language: string;
  subtitles: Subtitle[];
}> => {
  try {
    const learningLang = Cookies.get('learningLang') || 'en';
    
    const response = await axios.post<SubtitlesResponse>(
      `${API_BASE_URL}`,
      {
        url: videoUrl,
        lang: learningLang
      } as SubtitleRequest,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
     
     
    );

    return response.data;
  } catch (err) {
    const axiosError = err as AxiosError<ApiErrorResponse>;
    throw new Error(axiosError.response?.data?.message);
  }

};