import { API_URL_LOCAL, API_URL } from "../../utils/constants";

interface SendInvitePayload {
    email: string;
    boardId: string;
    userId: string;
  }
  
  export async function sendInviteEmail(payload: SendInvitePayload) {
    try {
    const response = await fetch(`${API_URL_LOCAL}/send-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error enviant la invitació');
      }
  
      const data = await response.json();
      console.log('✅ Invitació enviada correctament:', data);
      return data;
    } catch (error) {
      console.error('❌ Error enviant invitació:', error);
      throw error;
    }
  }
  