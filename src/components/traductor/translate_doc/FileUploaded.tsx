import { motion } from "framer-motion";
import { FileHeader } from "./FileHeader";
import { useState } from "react";
import { PopUpExample } from "./PopUpExample";
import { loadStripe } from "@stripe/stripe-js";
import { fetchCreateSession } from "../../../services/stripe/createSessionApi";
import { fetchUploadFile } from "../../../services/files/uploadFileApi";
import { Eye, Send } from "lucide-react";
import { LoadingProgress } from "../../shared/LoadingProgress";
import path from "path";
import slugify from "slugify";

interface FileUploadedProps {
  fileName: string;
  langName: string;
  langCode: string;
  file: File;
}

export function FileUploaded({
  fileName,
  langName,
  file,
  langCode,
}: FileUploadedProps) {
  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const stripePromise = loadStripe(
    "pk_live_51QRAsiKIdUQC1kmZ2An7o3OBNt54xFKdlTpByQz92H4xvh1NZvonLBUMooGH8k6XRXJ7zy3LLW3AlXlfdf00sDJK00OicnLdCI"
    // "pk_test_51QRAsiKIdUQC1kmZW09sMdKMahtALxF2ePorDUxt8vadtGkEW80S2Vxa9i3kgd71HyQVTpwXsHloaYTbttnBvU2S00GmqySJHZ"
  ); // Tu clave pública de Stripe

  const renombrarArchivo = (archivo: File, nuevoNombre: string): File => {
    return new File([archivo], nuevoNombre, {
      type: archivo.type,
      lastModified: archivo.lastModified,
      
    });
  };

  const formatearNombreArchivo = (nombre: string): string => {
    return nombre
      .normalize("NFD") // separa letras y tildes (e.g., á => a + ́)
      .replace(/[\u0300-\u036f]/g, "") // elimina las tildes
      .replace(/\s+/g, "_") // reemplaza espacios por guiones bajos
      .replace(/[^a-zA-Z0-9._-]/g, "") // elimina caracteres especiales excepto punto, guión y guión bajo
      .toLowerCase(); // opcional: todo en minúsculas
  };
  

  const handleCheckout = async () => {
    setIsLoading(true);
    const stripe = await stripePromise;

    if (!stripe) {
      console.error("Stripe no está disponible.");
      setIsLoading(false);
    } else {
      try {
        const originalName = file.name;
    
        const fileRenamed = renombrarArchivo(file, formatearNombreArchivo(originalName));
        console.log("Renombrado:", fileRenamed.name);
        
        await fetchUploadFile(fileRenamed);

        const sessionId = await fetchCreateSession(langCode, file);
        console.log("Session ID:", sessionId);

        const result = await stripe.redirectToCheckout({ sessionId });

        if (result.error) {
          console.error("Error al redirigir a checkout:", result.error.message);
        }
      } catch (error) {
        console.error("❌ Error durante el proceso de checkout:", error);
      } finally {
        setIsLoading(false); // Asegura que se detenga la carga siempre
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className=" w-full"
    >
      {showPopUp && (
        <PopUpExample setShowPopUp={() => setShowPopUp(false)}></PopUpExample>
      )}

      <div className="bg-gray-50 rounded-b-lg pb-2">
        <header className="bg-blue-400/70 p-3  text-center rounded-t-lg mb-6 flex">
          <p className="font-medium text-black">Traduce tu documento!</p>
        </header>
        <FileHeader fileName={fileName} langName={langName}></FileHeader>
        <div className="lg:flex justify-center items-center m-4 lg:mt-20 gap-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPopUp(true)}
            className={`lg:w-1/2 w-full py-3 px-6 mb-2 bg-blue-400 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2`}
          >
            <Eye className="w-5 h-5" />
            EJEMPLO VISUAL
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckout}
            disabled={isLoading}
            className={`lg:w-1/2 w-full py-3 px-6 mb-2 bg-teal-400 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200  ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }   flex flex-col items-center justify-center gap-2`}
          >
            {isLoading ? (
              <LoadingProgress
                isLoading={isLoading}
                text={"Redirigiendo a pasarela de pagos..."}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                <span>{"Traducir documento"}</span>
              </div>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
