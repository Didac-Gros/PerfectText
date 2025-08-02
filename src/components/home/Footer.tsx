export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm text-gray-400 mb-4 md:mb-0">
          &copy; {new Date().getFullYear()} PerfectText. Todos los derechos reservados.
        </p>
        <div className="flex space-x-6">
          <a
            href="/privacy"
            className="text-gray-400 hover:text-white transition"
          >
            Política de Privacidad
          </a>
          <a
            href="/terms"
            className="text-gray-400 hover:text-white transition"
          >
            Términos del Servicio
          </a>
        </div>
      </div>
    </footer>
  );
}
