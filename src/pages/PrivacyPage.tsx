export default function PrivacyPage() {
  return (
    <body className="h-full bg-white text-zinc-900 antialiased">
      <main className="mx-auto max-w-4xl px-5 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Política de Privacidad
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Última actualización: 10 de agosto de 2025
          </p>
        </header>

        <section className="space-y-8">
          <p>
            En <span className="font-medium">PerfectText</span> valoramos y
            protegemos tu privacidad. Esta política explica qué datos tratamos,
            con qué permisos accedemos a tu cuenta de Google y cómo los
            protegemos.
          </p>

          <div>
            <h2 className="text-xl font-semibold">
              Permisos de Google Calendar que usamos
            </h2>
            <p className="mt-2">
              PerfectText solo accede a tu cuenta de Google con tu
              consentimiento y exclusivamente para funciones de calendario.
              Usamos estos alcances (scopes):
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">
                  https://www.googleapis.com/auth/calendar.events
                </code>{" "}
                — crear, editar y eliminar eventos necesarios para sincronizar
                tu agenda desde la app.
              </li>
              <li>
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">
                  https://www.googleapis.com/auth/calendar.events.readonly
                </code>{" "}
                — leer eventos de tus calendarios para mostrarlos en tu agenda.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              Datos de Google Calendar a los que accedemos
            </h2>
            <p className="mt-2">
              PerfectText accede únicamente a los{" "}
              <span className="font-medium">eventos de tu Google Calendar</span>,
              incluyendo la información necesaria para mostrarlos en la
              aplicación y permitirte crearlos, modificarlos o eliminarlos.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              Finalidades del tratamiento
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Mostrar tus eventos y recordatorios en la aplicación.</li>
              <li>
                Permitir la creación, edición y eliminación de eventos desde
                PerfectText.
              </li>
              <li>
                Sincronizar cambios realizados en PerfectText con tu Google
                Calendar y viceversa.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              Lo que <em>no</em> hacemos
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                No vendemos, alquilamos ni compartimos tus datos con terceros
                con fines comerciales.
              </li>
              <li>
                No usamos tus datos para publicidad ni para crear perfiles con
                fines de marketing.
              </li>
              <li>
                No accedemos a otros productos de Google distintos de Calendar
                sin tu permiso explícito.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Protección y seguridad</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                Todas las comunicaciones entre PerfectText y Google se realizan
                mediante{" "}
                <span className="font-medium">HTTPS (TLS 1.2 o superior)</span>.
              </li>
              <li>
                Solo guardamos la información estrictamente necesaria para la
                sincronización. Cuando se requiere almacenamiento temporal, se
                cifra y se elimina al completar la operación.
              </li>
              <li>
                Limitamos el acceso interno a datos a personal autorizado y
                aplicamos controles de acceso basados en la necesidad de saber.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Retención y eliminación</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                No almacenamos de forma permanente el contenido de tus
                calendarios en nuestros servidores.
              </li>
              <li>
                Al revocar el acceso o solicitar eliminación, borramos los datos
                vinculados a tu cuenta que obren en nuestro poder, salvo
                obligaciones legales de conservación.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Control del usuario</h2>
            <p className="mt-2">
              Puedes revocar el acceso de PerfectText en cualquier momento desde
              tu configuración de Google:
              <a
                href="https://myaccount.google.com/permissions"
                className="font-medium text-blue-600 hover:underline"
                rel="noopener noreferrer"
              >
                myaccount.google.com/permissions
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Menores</h2>
            <p className="mt-2">
              PerfectText no está dirigida a menores de 13 años y no recopilamos
              conscientemente datos de menores.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Cambios a esta política</h2>
            <p className="mt-2">
              Podemos actualizar esta política para reflejar cambios en la app o
              en la normativa. Publicaremos la versión vigente en esta página
              indicando la fecha de “Última actualización”.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Contacto</h2>
            <p className="mt-2">
              Si tienes dudas o solicitudes sobre tus datos, escríbenos a
              <a
                href="mailto:soporte@perfecttext.com"
                className="font-medium text-blue-600 hover:underline"
              >
                soporte@perfecttext.com
              </a>
              .
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
            <p>
              PerfectText usa las API de Google y cumple con la
              <em>Google API Services User Data Policy</em>, incluido el
              requisito de “Limited Use”. El acceso y uso de los datos se limita
              a las finalidades descritas en esta política.
            </p>
          </div>
        </section>
      </main>
    </body>
  );
}
