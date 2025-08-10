export default function TermsPage() {
  return (
    <body className="h-full bg-white text-zinc-900 antialiased">
      <main className="mx-auto max-w-4xl px-5 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Términos de servicio
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Última actualización: 9 de agosto de 2025
          </p>
        </header>

        <section className="space-y-8">
          <p>
            Estos Términos de servicio (“
            <span className="font-medium">Términos</span>”) constituyen un
            acuerdo legal entre
            <span className="font-medium">PerfectText</span> (“nosotros”) y la
            persona usuaria (“tú”) que accede o utiliza la aplicación y los
            servicios asociados (conjuntamente, los “Servicios”). Al usar los
            Servicios, aceptas estos Términos y nuestra
            <a
              href="/privacy"
              className="text-blue-600 hover:underline font-medium"
            >
              Política de privacidad
            </a>
            .
          </p>

          <div>
            <h2 className="text-xl font-semibold">
              1. Descripción del servicio
            </h2>
            <p className="mt-2">
              PerfectText es una aplicación que te ayuda a organizar y estudiar,
              pudiendo integrarse con Google Calendar para ver y gestionar
              eventos en tu agenda desde la app.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">2. Cuentas y acceso</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                Para usar ciertas funciones puedes iniciar sesión con tu cuenta
                de Google.
              </li>
              <li>
                Eres responsable de mantener la confidencialidad de tus
                credenciales y de toda actividad realizada bajo tu cuenta.
              </li>
              <li>
                Debes tener al menos 13 años (o la mayoría de edad aplicable en
                tu jurisdicción) para usar los Servicios.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              3. Permisos de Google y datos
            </h2>
            <p className="mt-2">
              Para funciones de calendario, solicitamos los siguientes alcances
              (scopes) de Google Calendar, únicamente con tu consentimiento:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">
                  https://www.googleapis.com/auth/calendar.events
                </code>{" "}
                — crear, editar y eliminar eventos desde PerfectText.
              </li>
              <li>
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm">
                  https://www.googleapis.com/auth/calendar.events.readonly
                </code>{" "}
                — leer eventos para mostrarlos en tu agenda.
              </li>
            </ul>
            <p className="mt-2">
              Cumplimos la <em>Google API Services User Data Policy</em>{" "}
              (incluido “Limited Use”) y tratamos los datos conforme a nuestra{" "}
              <a
                href="/privacy"
                className="text-blue-600 hover:underline font-medium"
              >
                Política de privacidad
              </a>
              . Puedes revocar el acceso en cualquier momento en
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                myaccount.google.com/permissions
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              4. Uso permitido y prohibido
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                Puedes usar los Servicios para fines personales o educativos,
                conforme a estos Términos.
              </li>
              <li>
                No debes: (a) infringir la ley; (b) intentar acceder sin
                autorización a sistemas o datos; (c) interferir con el
                funcionamiento de los Servicios; (d) usar los Servicios para
                difundir malware, spam o contenido ilícito; (e) descompilar o
                realizar ingeniería inversa salvo lo permitido por la ley.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">5. Contenido del usuario</h2>
            <p className="mt-2">
              Eres titular del contenido que subes o generas en PerfectText. Nos
              concedes una licencia limitada, no exclusiva y revocable para
              procesarlo únicamente con el fin de prestar los Servicios (p. ej.,
              sincronizar y mostrar eventos).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">6. Propiedad intelectual</h2>
            <p className="mt-2">
              PerfectText, su código, diseños, marcas y demás elementos son de
              nuestra titularidad o de sus licenciantes. No se te concede ningún
              derecho de propiedad intelectual salvo las licencias limitadas
              necesarias para usar los Servicios.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">7. Servicios de terceros</h2>
            <p className="mt-2">
              Algunas funciones dependen de servicios de terceros (p. ej.,
              Google). No garantizamos la disponibilidad, continuidad o cambios
              introducidos por dichos terceros.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              8. Disponibilidad; cambios
            </h2>
            <p className="mt-2">
              Podremos modificar, suspender o interrumpir funciones de los
              Servicios en cualquier momento con aviso razonable cuando sea
              posible. Intentaremos minimizar impactos significativos para los
              usuarios.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">9. Terminación</h2>
            <p className="mt-2">
              Puedes dejar de usar los Servicios en cualquier momento. Podemos
              suspender o cancelar tu acceso si incumples estos Términos, si lo
              exige la ley o para prevenir riesgos de seguridad o abuso. Al
              terminar, podremos desactivar tu acceso y eliminar datos asociados
              conforme a la{" "}
              <a
                href="/privacy"
                className="text-blue-600 hover:underline font-medium"
              >
                Política de privacidad
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">10. Garantías y descargos</h2>
            <p className="mt-2">
              Prestamos los Servicios “tal cual” y “según disponibilidad”. En la
              medida máxima permitida por la ley, excluimos garantías implícitas
              de comerciabilidad, idoneidad para un propósito particular y no
              infracción.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              11. Limitación de responsabilidad
            </h2>
            <p className="mt-2">
              En la medida permitida por la ley, no seremos responsables por
              daños indirectos, incidentales, especiales, consecuentes o
              punitivos, ni por pérdida de beneficios, datos o reputación,
              derivados del uso o imposibilidad de uso de los Servicios.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">12. Indemnización</h2>
            <p className="mt-2">
              Aceptas indemnizarnos frente a reclamaciones de terceros derivadas
              de tu uso de los Servicios en violación de estos Términos o de la
              ley.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              13. Ley aplicable y jurisdicción
            </h2>
            <p className="mt-2">
              Estos Términos se rigen por las leyes de España, salvo que la
              normativa imperativa de tu país establezca otra cosa. Cualquier
              disputa se someterá a los tribunales de Barcelona, España, salvo
              que la ley aplicable disponga un fuero distinto.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              14. Cambios a estos Términos
            </h2>
            <p className="mt-2">
              Podremos actualizar estos Términos para reflejar cambios en los
              Servicios o en la normativa. Publicaremos la versión vigente con
              la fecha de última actualización. Si los cambios son sustanciales,
              procuraremos notificarte por medios razonables.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">15. Contacto</h2>
            <p className="mt-2">
              Para dudas legales o notificaciones, escríbenos a
              <a
                href="mailto:soporte@perfecttext.com"
                className="text-blue-600 hover:underline font-medium"
              >
                soporte@perfecttext.com
              </a>
              .
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
            <p>
              PerfectText usa las API de Google y cumple con la{" "}
              <em>Google API Services User Data Policy</em> (incluido “Limited
              Use”). El acceso y uso de datos de usuario se limita a las
              finalidades descritas en estos Términos y en la Política de
              privacidad.
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-12">
            Última actualización: 09 de agosto de 2025
          </p>
        </section>
      </main>
    </body>
  );
}
