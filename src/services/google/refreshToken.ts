import { fetchAPI } from '../fetchApi';

export interface RefreshTokenResponse {
  access_token: string;
  expiry_date: number;
}

export async function fetchRefreshToken(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  if (!refreshToken?.trim()) {
    throw new Error('No s’ha proporcionat cap refresh token');
  }

  try {
    const response = await fetchAPI<{ success: boolean; data: RefreshTokenResponse }>(
      'google/refresh-token',
      { refreshToken }
    );
    if (!response.success || !response.data?.access_token) {
      throw new Error('No s’ha pogut renovar el token d’accés');
    }

    return response.data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Error inesperat refrescant el token'
    );
  }
}
