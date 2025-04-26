
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

  export interface Folder {
    id: number;
    name: string;
    cardCount: number;
    nearestReviewTime: {
      value: number;
      unit: string;
    } | null;
  }
  
  export interface AllFolderData {
    cardCount: number;
    nearestReviewTime: {
      value: number;
      unit: string;
    } | null;
  }
  
  export interface FoldersResponse {
    folders: Folder[];
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }

  export interface HomeProps {
    isAuthenticated: boolean;
  }

  
  export interface HomePropsToken {
  isAuthenticated: boolean;
  onAuthSuccess: (token: string) => void;
  }

  export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }

  export interface RegisterProps {
    onAuthSuccess: (token: string) => void;
  }

  export interface LoginProps {
    onAuthSuccess: (token: string) => void;
  }

  export interface ProfileData {
    username: string;
    email: string;
    learningLanguageId: number;
    nativeLanguageId: number;
    learningLanguage?: string; 
    nativeLanguage?: string;
  }