// utils.ts

/**
 * Convierte el contenido de un archivo en una cadena de texto.
 * @param file - El archivo a convertir.
 * @returns Una promesa que resuelve con el contenido del archivo como string.
 */
export const parseFileToString = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Evento que se ejecuta cuando la lectura es exitosa
    reader.onload = () => {
      if (reader.result) {
        resolve(reader.result.toString()); // Convierte el resultado en una cadena
      } else {
        reject(new Error("Error al leer el archivo"));
      }
    };

    // Evento para manejar errores
    reader.onerror = () => {
      reject(new Error("No se pudo leer el archivo"));
    };

    // Lee el archivo como texto
    reader.readAsText(file);
  });
};
