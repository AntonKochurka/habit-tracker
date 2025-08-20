import type { LoadingStatus, Model } from "@shared/types";

export interface Credentials {identifier: string, password: string}

export interface User extends Model {
    username: string;
}

export interface AuthState {
    access: string | null;
    status: LoadingStatus;
    error: string | null;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}