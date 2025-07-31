export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 border-b pb-2">Términos del Servicio</h1>

        <p className="mb-4">
          Al utilizar <span className="font-semibold">PerfectText</span>, aceptas que la aplicación se utilice únicamente con fines <span className="font-semibold">educativos o personales</span>. Cualquier uso con fines comerciales sin autorización previa está prohibido.
        </p>

        <p className="mb-4">
          Nos reservamos el derecho de modificar estos términos en cualquier momento y sin previo aviso. Es responsabilidad del usuario revisar periódicamente esta sección para estar al tanto de cualquier cambio.
        </p>

        <p className="mb-4">
          El uso continuado de la aplicación después de la publicación de cambios constituye la aceptación de los nuevos términos. Si no estás de acuerdo con alguno de estos términos, te recomendamos dejar de utilizar la aplicación.
        </p>

        <p className="text-sm text-gray-500 mt-12">Última actualización: 31 de julio de 2025</p>
      </div>
    </div>
  );
}
