import { PdfExample } from "./PdfExample";

interface PopUpExampleProps {
  setShowPopUp: () => void;
}

export function PopUpExample({ setShowPopUp }: PopUpExampleProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-10 pb-8 shadow-2xl w-[33rem] relative m-10 ">
        {/* Botón de cierre (cruz) */}
        <button
          onClick={setShowPopUp}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex flex-col items-center justify-center gap-4 mt-4">
          <PdfExample></PdfExample>
          <button
            onClick={setShowPopUp}
            className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-full font-semibold hover:opacity-90"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
