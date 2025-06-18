import axios from 'axios';
import {
  LoginRequestDto,
  AuthResponseDto,
  UserRegistrationDto,
  LanguageDto,
  ProfileGet,
  ProfileChangeDto,
  AllFolderData,
  FoldersResponse,
  CardsResponse,
  Folder,
  CardUpdateData,
  UpdateData,
  Card,
  ApiErrorResponse,
  CardAndError

} from '../types/auth';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const authApi = {
  register: async (userData: UserRegistrationDto, lang: string): Promise<AuthResponseDto> => {
    const response = await axios.post<AuthResponseDto>(
      `${API_BASE_URL}/auth/register`, 
      userData,
      {
        headers: {
          'Cookie': `lang=${lang}`
        },
        withCredentials: true
      }
    );
    return response.data;
  },


  login: async (credentials: LoginRequestDto, lang: string): Promise<AuthResponseDto> => {
    const response = await axios.post<AuthResponseDto>(`${API_BASE_URL}/auth/login`,
     credentials,
     {
      headers: {
        'Cookie': `lang=${lang}`
      },
      withCredentials: true
    }
     );
    return response.data;
  },

  getLanguages: async (): Promise<LanguageDto[]> => {
    const response = await axios.get<LanguageDto[]>(`${API_BASE_URL}/api/languages/all`);
    return response.data;
  },


  getProfile: async (lang: string): Promise<ProfileGet> => {
     const response = await axios.get<ProfileGet>(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cookie': `lang=${lang}`
        },
        withCredentials: true
      });
      return response.data;
     },

  updateProfile: async (profile: ProfileChangeDto, lang: string): Promise<AuthResponseDto> => {
    const response = await axios.patch<AuthResponseDto>(`${API_BASE_URL}/profile`,
     profile,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cookie': `lang=${lang}`
        },
        withCredentials: true
      });
      return response.data;
    },
    validateToken: async (token: string): Promise<boolean> => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/utils/validate-token`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return response.status === 200;
      } catch {
        return false;
      }
    },
    getFolders: async (page: number, lang: string): Promise<FoldersResponse> => {
      const token = localStorage.getItem('token');
      const response = await axios.post<FoldersResponse>(
        `${API_BASE_URL}/folder/get?page=${page}`, 
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cookie': `lang=${lang}`
          },
          withCredentials: true
        }
      );
      return response.data;
    },
  
    getAllFolderData: async (lang: string): Promise<AllFolderData> => {
      const token = localStorage.getItem('token');
      const response = await axios.get<AllFolderData>(
        `${API_BASE_URL}/folder/get/all`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cookie': `lang=${lang}`
          },
          withCredentials: true
        }
      );
      return response.data;
    },
  
    createFolder: async (name: string, lang: string): Promise<void> => {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/folder/create`,
        { name },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cookie': `lang=${lang}`
          },
          withCredentials: true
        }
      );
    },
  
    updateFolderName: async (folderId: number, name: string, lang: string): Promise<void> => {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/folder/changeName?folderId=${folderId}`,
        { name },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cookie': `lang=${lang}`
          },
          withCredentials: true
        }
      );
    },
  
    deleteFolder: async (folderId: number, lang: string): Promise<void> => {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_BASE_URL}/folder/delete?folderId=${folderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cookie': `lang=${lang}`
          },
          withCredentials: true
        }
      );
    },








   getCardsFromFolder: async (folderId: string, page: number, lang: string): Promise<CardsResponse> => {
  const token = localStorage.getItem('token');
  const response = await axios.post<CardsResponse>(
    `${API_BASE_URL}/card/from-folder?page=${page}&folderId=${folderId}`,
    {}, // Пустое тело запроса
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': `lang=${lang}`
      },
      withCredentials: true
    }
  );
  return response.data;
},
    
          
    deleteCard: async (cardId: number, lang: string): Promise<void> => {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_BASE_URL}/card/delete?cardId=${cardId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cookie': `lang=${lang}`
          },
          withCredentials: true
        }
      );
    },

    getAllFolders: async (lang: string): Promise<Folder[]> => {
      const token = localStorage.getItem('token');
      const response = await axios.get<Folder[]>(
        `${API_BASE_URL}/folder/get/all-folders`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cookie': `lang=${lang}`
          },
          withCredentials: true
        }
      );
      return response.data;
    },

    
    getCardDetails: async (cardId: number, lang: string): Promise<Card> => {
      const token = localStorage.getItem('token');
      const response = await axios.post<Card>(
        `${API_BASE_URL}/card/get`, 
        null,
        {
          params: {
            'cardId': cardId 
          },      
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cookie': `lang=${lang}`
        },
        withCredentials: true
      });
      return response.data;
    },

    getAllCards: async (page: number, lang: string): Promise<{ 
      cards: Card[]; 
      currentPage: number; 
      totalPages: number 
    }> => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/card/get/all?page=${page}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept-Language': lang
        },
        withCredentials: true
      });
      return response.data;
    },

    updateCard: async (cardId: number, data: Partial<UpdateData>, lang: string): Promise<void> => {
      const token = localStorage.getItem('token');
      
      if (!cardId || isNaN(cardId)) {
        throw new Error(`Invalid card ID: ${cardId}`);
      }
    
      try {
        const response = await axios({
          method: 'patch',
          url: `${API_BASE_URL}/card/update?cardId=${cardId}`,
          data: { ...data, cardId },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cookie': `lang=${lang}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        return response.data;
      } catch (err) {
        console.error('API update error:', err);
        throw err;
      }
    },
    

    createCard: async (data: Partial<UpdateData>, lang: string): Promise<void> => {
      const token = localStorage.getItem('token');
         
      try {
        const response = await axios({
          method: 'post',
          url: `${API_BASE_URL}/card/create`,
          data: { ...data },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cookie': `lang=${lang}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        return response.data;
      } catch (err) {
        console.error('API update error:', err);
        throw err;
      }
    },

    



};

export const cardService = {
  // Получение карточки для повторения из всех
  getReviewCardAll: async (lang: string): Promise<CardAndError> => {
    const token = localStorage.getItem('token');
    const response = await axios.get<Card>(
      `${API_BASE_URL}/card/get/review-all`,
      {
        
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cookie': `lang=${lang}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    );
    return response.data;
  },

    // Получение карточки для повторения из определённой папки
    getReviewCard: async (lang: string, folderId: number): Promise<CardAndError> => {
      const token = localStorage.getItem('token');
      const response = await axios.get<Card>(
        `${API_BASE_URL}/card/get/review-folder?folderId=${folderId}`,
        {
          
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cookie': `lang=${lang}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      return response.data;
    },

  // Отправка оценки сложности карточки
  submitDifficulty: async (cardId: number, difficulty: 'easy' | 'medium' | 'hard', lang: string): Promise<void> => {
    const token = localStorage.getItem('token');
    await axios.post(
      `${API_BASE_URL}/api/space-repetition`,
      null,
      {
        params: {
          cardId,
          difficulty
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cookie': `lang=${lang}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    );
  },


};