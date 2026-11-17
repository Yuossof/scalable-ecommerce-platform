import { API_ENDPOINTS } from "@/shared/lib/api/endpoints";
import { axiosInstanace } from "@/shared/lib/axios";
import { handleApiError } from "@/shared/lib/errors/handleApiError";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface RegisterResponse {
  success: boolean;
  data: RegisteredUser;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: { userId: string };
}

interface RefreshResponse {
  success: boolean;
  message: string;
}

interface MessageResponse {
  success?: boolean;
  message: string;
}

/** Creates the account and triggers the verification email on the backend. */
export const registerService = async (
  data: RegisterInput
): Promise<RegisteredUser> => {
  try {
    const res = await axiosInstanace.post<RegisterResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return res.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/** Authenticates the user and stores the auth cookies. */
export const loginService = async (data: LoginInput): Promise<{ userId: string }> => {
  try {
    const res = await axiosInstanace.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    return res.data.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Probes the session. Resolves when a valid refresh cookie exists (and rotates
 * the access cookie), rejects with a 401 otherwise. Used as the `useAuth` check
 * because the backend exposes no `/auth/me` endpoint.
 */
export const refreshSessionService = async (): Promise<RefreshResponse> => {
  try {
    const res = await axiosInstanace.get<RefreshResponse>(
      API_ENDPOINTS.AUTH.REFRESH
    );
    return res.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/** Consumes the email verification token from the emailed link. */
export const verifyEmailService = async (token: string): Promise<string> => {
  try {
    const res = await axiosInstanace.get<MessageResponse>(
      API_ENDPOINTS.AUTH.VERIFY,
      { params: { token } }
    );
    return res.data.message;
  } catch (error) {
    throw handleApiError(error);
  }
};

/** Requests a fresh verification email. */
export const resendVerificationService = async (
  email: string
): Promise<string> => {
  try {
    const res = await axiosInstanace.post<MessageResponse>(
      API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
      { email }
    );
    return res.data.message;
  } catch (error) {
    throw handleApiError(error);
  }
};
