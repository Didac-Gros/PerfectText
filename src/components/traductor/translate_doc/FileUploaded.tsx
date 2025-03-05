import { motion } from "framer-motion";
import { FileHeader } from "./FileHeader";
import { SelectVersion } from "./SelectVersion";
import { useState } from "react";
import { PetitionButton } from "../../shared/PetitionButton";

interface FileUploadedProps {
  fileName: string;
  langName: string;
}

export function FileUploaded({ fileName, langName }: FileUploadedProps) {
  const [versionSelected, setVersionSelected] = useState<number>(0);
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen w-full"
    >
      <div className="bg-gray-50 rounded-b-lg">
        <header className="bg-blue-400/70 p-3  text-center rounded-t-lg mb-6">
          <p className="font-medium text-black">
            Elige la version que necesites!
          </p>
        </header>
        <FileHeader fileName={fileName} langName={langName}></FileHeader>
        <div className="flex justify-center mt-10 gap-12 pb-6">
          <SelectVersion
            title="VERSIÓN GRATUITA"
            description="Se extraerá y traducirá el texto sin conservar imágenes ni formato."
            onClick={() => setVersionSelected(1)}
            active={versionSelected === 1}
          ></SelectVersion>
          <SelectVersion
            title="VERSIÓN PREMIUM"
            description="Se mantendrá diseño, imágenes y formato del documento original."
            onClick={() => setVersionSelected(2)}
            active={versionSelected === 2}
          ></SelectVersion>
        </div>
        {versionSelected != 0 && (
          <div className="max-w-lg w-full m-auto">
            <PetitionButton
              isLoading={false}
              isFile
              title={"Traducir documento"}
              onSubmit={() => {}}
            ></PetitionButton>
          </div>
        )}
      </div>
    </motion.div>
  );
}
