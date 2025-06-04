import { fetchAPI } from '../fetchApi'; // Ruta segons estructura del teu projecte

export interface ExchangeTokenResponse {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

export async function fetchExchangeCode(code: string): Promise<ExchangeTokenResponse> {
  if (!code?.trim()) {
    throw new Error('No sha proporcionat cap codi dautorització');
  }

  try {
    const response = await fetchAPI<{ success: boolean; data: ExchangeTokenResponse }>(
      'google/exchange-code',
      { code }
    );

    if (!response.success || !response.data?.access_token) {
      throw new Error('No s’han pogut obtenir els tokens de Google');
    }

    return response.data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Error inesperat durant l’intercanvi de codi'
    );
  }
}
