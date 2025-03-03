import { fetchAPI } from '../fetchApi'; // Usa la misma función fetchAPI para reutilización

export const summarizeText = async (
  text: string,
  language: string = 'es',
  mode: string = 'general'
): Promise<string> => {
  const maxChunkLength = 2000;

  if (text.length > maxChunkLength) {
    const chunks = text.match(new RegExp(`.{1,${maxChunkLength}}(?=\\s|$)`, 'g')) || [text];

    const results = await Promise.all(
      chunks.map(chunk =>
        fetchAPI<{ success: boolean; data: { summary: string } }>('summarize', { 
          text: chunk, 
          language, 
          mode 
        })
      )
    );

    return results.map(r => r.data.summary).join('\n\n');
  }

  const response = await fetchAPI<{ success: boolean; data: { summary: string } }>('summarize', { 
    text, 
    language, 
    mode 
  });

  return response.data.summary;
};
