import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { fetchTranslateDocument } from "../services/deepl/translateDocApi";
import { TickIcon } from "../icons/TickIcon";
import { WordIcon } from "../icons/WordIcon";

export const SuccessPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const langCode = searchParams.get("lang_code");
  const navigate = useNavigate();
  const [isRender, setIsRender] = useState(false);
  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) return;
      setIsRender(true);
      // const paymentStatus = await fetchGetApi<{ paid: boolean }>(
      //   `check-payment?session_id=${sessionId}`
      // );

      // const fileResponse = await fetchGetFile(sessionId);

      // if (!fileResponse.data) {
      //   throw new Error("No se pudo obtener el archivo.");
      // }

      // const blob = await fetchDownloadFile(fileResponse.data.file.path);

      // // Crear un objeto `File` con el mismo nombre que tenía en el servidor
      // const file = new File(
      //   [blob],
      //   fileResponse.data.file.path.split("/").pop() || "archivo.pdf",
      //   {
      //     type: blob.type,
      //   }
      // );

      const response = await fetch(
        `http://localhost:3000/api/check-payment?session_id=${sessionId}`
      );
      const result = await response.json();

      const response2 = await fetch(
        `http://localhost:3000/api/get-file?session_id=${sessionId}`
      );

      if (!response2.ok) {
        throw new Error("No se pudo obtener el archivo.");
      }

      const data = await response2.json();
      console.log("sdaaaaaaaaaa", data);

      const response3 = await fetch(
        `http://localhost:3000/api/download-file?path=${encodeURIComponent(
          data.file.path
        )}`
      );

      if (!response3.ok) {
        throw new Error("No se pudo descargar el archivo.");
      }

      const blob = await response3.blob();

      // Crear un objeto `File` con el mismo nombre que tenía en el servidor
      const file2 = new File(
        [blob],
        data.file.path.split("/").pop() || "archivo.pdf",
        {
          type: blob.type,
        }
      );

      if (result.paid) {
        fetchTranslateDocument(file2!, langCode!)
          .then(async (blob) => {
            const fileURL = URL.createObjectURL(blob);
            navigate("/", { state: { fileURL, fileName: file2.name } });
          })
          .catch((error) => {
            console.error(
              "Error al traducir el texto: ",
              (error as Error).message
            );
          });
      }
    };

    !isRender && verifyPayment();
  }, [sessionId]);

  return (
    <div className="flex justify-center items-center min-h-screen flex-col gap-3 ">
      <div>
        <div className="flex justify-center items-center gap-1">
          <TickIcon></TickIcon>
          <h1 className="text-2xl font-bold">Pago exitoso</h1>
        </div>

        <p className="text-gray-700">Redirigiendo de vuelta...</p>
      </div>
      <div className="flex justify-center items-center gap-1">
        <WordIcon></WordIcon>
        <p className="text-lg font-semibold">Traduciendo su documento...</p>
      </div>
    </div>
  );
};
