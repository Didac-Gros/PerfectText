import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { fetchTranslateDocument } from "../services/deepl/translateDocApi";
import { TickIcon } from "../icons/TickIcon";
import { WordIcon } from "../icons/WordIcon";
import { fetchGetApi } from "../services/fetchGetApi";
import { fetchGetFile } from "../services/files/getFileApi";
import { fetchDownloadFile } from "../services/files/downloadFileApi";

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
      const paymentStatus = await fetchGetApi<{ paid: boolean }>(
        `check-payment?session_id=${sessionId}`,
        false
      );

      const filePath = (await fetchGetFile(sessionId)).file.path;
      const blob = await fetchDownloadFile(filePath);

      // Crear un objeto `File` con el mismo nombre que tenía en el servidor
      const file = new File(
        [blob],
        filePath.split("/").pop() || "archivo.pdf",
        {
          type: blob.type,
        }
      );

      if (paymentStatus.paid) {
        fetchTranslateDocument(file!, langCode!)
          .then(async (blob) => {
            const fileURL = URL.createObjectURL(blob);
            navigate("/", { state: { fileURL, fileName: file.name } });
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
