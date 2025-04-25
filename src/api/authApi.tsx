import axios from 'axios';
import {
  LoginRequestDto,
  AuthResponseDto,
  UserRegistrationDto,
  LanguageDto,
  ProfileGet,
  ProfileChangeDto
} from '../types/auth';

const API_BASE_URL = 'http://localhost:8080';

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

};

 