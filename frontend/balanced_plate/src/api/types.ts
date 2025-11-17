export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  city?: string;
  is_verified?: boolean;
  is_superuser?:boolean
  phone_number:string
  is_phone_number_verified:boolean
  is_email_verified:boolean
  gender:string
  dob:Date
  is_banned:boolean
  account_type:string
  country:string,
  state?:string

  
  
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: {
    access: string;
    refresh: string;
  };
}

export interface SignupCredentials{
  first_name:string,
  last_name:string,
  email:string,
  gender:string,
  dob?: string,
  phone_number:string,
  password: string,
  password2?:string,
  country?:string



}
export interface SignupResponse{
  user: User;
  token: {
    access: string;
    refresh: string;
  };
  message?:{
    phone_number:string,
    password:string,
    email?:string
}

}

export interface ResponseError{
  status:number
    message:{
      phone_number?:string,
      password?:string
      email?:string


    }
  
}
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  forgetPassword: (email: string) => Promise<string>;
  otpVerify: (email: string, otpCode: string) => Promise<string>;
  resetPassword: (email: string, password: string, confirmPassword: string) => Promise<string>;
  SignUp: (credentials: SignupCredentials) => Promise<SignupResponse>;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  loadCurrentUser: () => Promise<void>;
  setAuthStatus: (status: boolean) => void;
}


export interface FileType {
  id: string;
  file: string;
  purpose: "avatar" | "food image";
  mime_type?: string;
  original_name?: string;
  currently_under_processing?: boolean;
  upload_session_id?: string;
  size?: number;
  date_added: string;
  owner: number;
}

export interface FilesContextType {
  files: FileType[];
  isLoading: boolean;
  error: string | null;
  uploadFile: (file: File, purpose: "avatar" | "food image") => Promise<FileType>;
  fetchFiles: () => Promise<void>;
  getFile: (id: string) => Promise<FileType>;
  clearError: () => void;
}