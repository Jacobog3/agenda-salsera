import { Container } from "@/components/shared/container";

export const metadata = {
  title: "Política de Privacidad | ExploraGuate",
  robots: { index: true, follow: true }
};

export default function PrivacyPage() {
  return (
    <section className="page-section pb-16">
      <Container className="max-w-2xl">
        <div className="space-y-8">
          <div className="space-y-2 border-b border-gray-100 pb-6">
            <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">
              Política de Privacidad
            </h1>
            <p className="text-sm text-gray-400">Última actualización: marzo 2026</p>
          </div>

          <LegalSection title="1. Responsable del tratamiento">
            Este Sitio es operado por <strong>GuatCloud</strong>. Para consultas de
            privacidad escribinos a{" "}
            <a href="mailto:info@exploraguate.com" className="text-brand-600 hover:underline">
              info@exploraguate.com
            </a>.
          </LegalSection>

          <LegalSection title="2. Información que recopilamos">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-700">2.1 Recopilada automáticamente</p>
                <ul className="mt-2 list-disc space-y-1.5 pl-5">
                  <li>
                    <strong>Analítica:</strong> Usamos Google Analytics 4 para recopilar datos
                    anónimos de uso (páginas visitadas, duración de sesión, tipo de dispositivo,
                    ubicación geográfica aproximada). No se recopila información personal
                    identificable a través de analítica.
                  </li>
                  <li>
                    <strong>Cookies:</strong> Usamos cookies esenciales para funcionalidad del
                    Sitio (preferencia de idioma). Las cookies de analítica son configuradas por
                    Google Analytics.
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-700">2.2 Proporcionada voluntariamente</p>
                <ul className="mt-2 list-disc space-y-1.5 pl-5">
                  <li>
                    <strong>Envío de eventos:</strong> Al enviar un evento, recopilamos la
                    información que proporcionás (título, descripción, fecha, lugar, nombre del
                    organizador, enlace de contacto). Esta información se usa únicamente para
                    publicar el evento en el Sitio.
                  </li>
                </ul>
              </div>
            </div>
          </LegalSection>

          <LegalSection title="3. Contenido de fuentes públicas">
            <p>
              ExploraGuate recopila y publica información de eventos culturales y de baile
              proveniente de publicaciones públicas en redes sociales como Instagram,
              Facebook, WhatsApp y otras plataformas, realizadas por organizadores,
              academias y locales de entretenimiento.
            </p>
            <p className="mt-3">
              Esta información es de acceso público y no incluye datos personales de
              usuarios privados. ExploraGuate la utiliza con fines informativos y culturales.
              Si deseás solicitar la remoción de contenido, podés escribirnos a{" "}
              <a href="mailto:info@exploraguate.com" className="text-brand-600 hover:underline">
                info@exploraguate.com
              </a>.
            </p>
          </LegalSection>

          <LegalSection title="4. Uso de la información">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Publicar y curar información de eventos de baile</li>
              <li>Mejorar el Sitio mediante analítica anónima</li>
              <li>Responder consultas y solicitudes de envío de eventos</li>
            </ul>
          </LegalSection>

          <LegalSection title="5. Compartición de datos">
            No vendemos, comercializamos ni transferimos tu información personal a
            terceros. Los datos de eventos enviados para publicación se muestran
            públicamente en el Sitio según la intención del remitente.
          </LegalSection>

          <LegalSection title="6. Almacenamiento de datos">
            Los datos del Sitio se almacenan en infraestructura segura en la nube
            (Supabase y Vercel). Tomamos medidas razonables para proteger tu información,
            pero ninguna transmisión por internet es 100% segura.
          </LegalSection>

          <LegalSection title="7. Tus derechos">
            Podés:
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Solicitar la eliminación de contenido de evento que hayas enviado</li>
              <li>Optar por no ser rastreado desactivando las cookies en tu navegador</li>
              <li>
                Usar la extensión oficial de Google para desactivar Google Analytics:{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-600 hover:underline"
                >
                  Google Analytics Opt-out
                </a>
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="8. Privacidad de menores">
            El Sitio no está dirigido a menores de 13 años. No recopilamos
            conscientemente información de menores.
          </LegalSection>

          <LegalSection title="9. Cambios a esta política">
            Podemos actualizar esta Política de Privacidad. Los cambios se publicarán
            en esta página con la fecha de revisión actualizada.
          </LegalSection>

          <LegalSection title="10. Contacto">
            Para consultas sobre privacidad escribinos a{" "}
            <a href="mailto:info@exploraguate.com" className="text-brand-600 hover:underline">
              info@exploraguate.com
            </a>.
          </LegalSection>
        </div>
      </Container>
    </section>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      <div className="text-sm leading-relaxed text-gray-600">{children}</div>
    </div>
  );
}
