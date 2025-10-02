export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  city?: string;
  is_verified?: boolean;
  
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
  logout: () => void;
  error: string | null;
  clearError: () => void;
}


export interface FileType{
  id? : number;
  file?: string;
  date_added?: string;
  date_last_modified?: string;
  analysis_result?: string;
  owner?: number;
}