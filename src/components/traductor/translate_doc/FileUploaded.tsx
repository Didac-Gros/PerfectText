import { motion } from "framer-motion";
import { FileHeader } from "./FileHeader";
import { SelectVersion } from "./SelectVersion";
import { useState } from "react";
import { PetitionButton } from "../../shared/PetitionButton";
import { PopUpExample } from "./PopUpExample";
import { loadStripe } from "@stripe/stripe-js";
import { fetchCreateSession } from "../../../services/stripe/createSessionApi";
import { fetchUploadFile } from "../../../services/files/uploadFileApi";
import { log } from "node:console";

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
  const [versionSelected, setVersionSelected] = useState<boolean>(false);
  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const stripePromise = loadStripe(
    "pk_test_51QRAsiKIdUQC1kmZW09sMdKMahtALxF2ePorDUxt8vadtGkEW80S2Vxa9i3kgd71HyQVTpwXsHloaYTbttnBvU2S00GmqySJHZ"
  ); // Tu clave pública de Stripe

  const handleCheckout = async () => {
    setIsLoading(true);
    const stripe = await stripePromise;

    if (!stripe) {
      console.error("Stripe no está disponible.");
      setIsLoading(false);
    } else {
      try {
        const path = await fetchUploadFile(file);

        const sessionId = await fetchCreateSession(langCode, file);

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
      className="min-h-screen w-full"
    >
      {showPopUp && (
        <PopUpExample setShowPopUp={() => setShowPopUp(false)}></PopUpExample>
      )}

      <div className="bg-gray-50 rounded-b-lg pb-10">
        <header className="bg-blue-400/70 p-3  text-center rounded-t-lg mb-6 flex">
          <p className="font-medium text-black">Traduce tu documento!</p>
        </header>
        <FileHeader fileName={fileName} langName={langName}></FileHeader>
        <div className="flex justify-center mt-10 gap-12 pb-6">
          <SelectVersion
            title="VERSIÓN PREMIUM"
            description="Se mantendrá diseño, imágenes y formato del documento original."
            onClick={() => setVersionSelected(true)}
            active={versionSelected}
            onExampleClick={() => setShowPopUp(true)}
          ></SelectVersion>
        </div>
        {versionSelected && (
          <div className="max-w-lg w-full m-auto">
            <PetitionButton
              isLoading={isLoading}
              isFile
              title={"Traducir documento"}
              onSubmit={handleCheckout}
            ></PetitionButton>
          </div>
        )}
      </div>
    </motion.div>
  );
}
