
  export interface LoginRequestDto {
    username: string;
    password: string;
  }
  
  export interface AuthResponseDto {
    token: string;
  }

  export interface UserRegistrationDto {
    username: string;
    email: string;
    password: string;
    learningLanguageId: number;
    nativeLanguageId: number;
  }

  export interface ApiErrorResponse {
    field: string | null;
    message: string;
    rejectedValue: any;
  }

  export interface LanguageDto {
    id: number;
    name: string;
  }

  export interface ProfileGet {
    username: string;
    email: string;
    learningLanguage: string;
    nativeLanguage: string;
    learningLanguageId: number;
    nativeLanguageId: number;
  }

  export interface ProfileChangeDto{
    username: string;
    email: string;
    password?: string;
    learningLanguageId: number;
    nativeLanguageId: number;
  }