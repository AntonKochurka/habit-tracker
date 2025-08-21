import type { BaseState, Model } from "@shared/types";

export interface Credentials {identifier: string, password: string}

export interface User extends Model {
    username: string;
}

export interface AuthState extends BaseState {
    access: string | null;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}