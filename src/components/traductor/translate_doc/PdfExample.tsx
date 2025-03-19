
export function PdfExample() {
  return (
    <div className="flex gap-6">
      <div className="flex flex-col items-center gap-2">
        <img
          src="/img/pdf_normal.png"
          alt="Documento original en español"
          className="w-64 h-auto rounded-lg shadow-md"
        />
        <p className="text-sm font-semibold text-gray-600">Español (original)</p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <img
          src="/img/pdf_trad.png"
          alt="Documento traducido"
          className="w-64 h-auto rounded-lg shadow-md"
        />
        <p className="text-sm font-semibold text-gray-600">Traducción</p>
      </div>
    </div>
  );
}
