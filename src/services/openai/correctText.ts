import { CorrectionResponse } from '../../types/global';
import { fetchAPI } from '../fetchApi'; // Asegúrate de tener esta función en un archivo compartido

export const correctText = async (
  text: string, 
  language: string = 'es',
  mode: string = 'general'
): Promise<CorrectionResponse> => {
  const maxChunkLength = 2000;

  if (text.length > maxChunkLength) {
    const chunks = text.match(new RegExp(`.{1,${maxChunkLength}}(?=\\s|$)`, 'g')) || [text];

    const results = await Promise.all(
      chunks.map(chunk =>
        fetchAPI<{ success: boolean; data: CorrectionResponse }>('correct', { 
          text: chunk, 
          language, 
          mode 
        })
      )
    );

    return {
      corrected: results.map(r => r.data.corrected).join('\n\n'),
      enhanced: results.map(r => r.data.enhanced).join('\n\n')
    };
  }

  const response = await fetchAPI<{ success: boolean; data: CorrectionResponse }>('correct', { 
    text, 
    language, 
    mode 
  });

  return response.data;
};
