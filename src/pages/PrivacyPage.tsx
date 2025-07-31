export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 border-b pb-2">Política de Privacidad</h1>

        <p className="mb-4">
          En <span className="font-semibold">PerfectText</span> valoramos tu privacidad. Esta aplicación accede únicamente a tu cuenta de <span className="font-semibold">Google Calendar</span> con tu permiso, y solo para sincronizar eventos necesarios para su funcionalidad.
        </p>

        <p className="mb-4">
          <span className="font-semibold">No compartimos, vendemos ni almacenamos</span> datos personales fuera del uso previsto. Toda la información que accedemos es utilizada exclusivamente para mejorar tu experiencia dentro de la aplicación.
        </p>

        <p className="mb-4">
          Puedes revocar el acceso a tu cuenta de Google en cualquier momento desde la configuración de tu cuenta de Google. Al hacerlo, se eliminarán automáticamente los datos sincronizados.
        </p>

        <p className="mb-4">
          Para cualquier duda o solicitud sobre tus datos, puedes contactarnos en <a href="mailto:soporte@perfecttext.com" className="text-blue-600 underline">soporte@perfecttext.com</a>.
        </p>

        <p className="text-sm text-gray-500 mt-12">Última actualización: 31 de julio de 2025</p>
      </div>
    </div>
  );
}
