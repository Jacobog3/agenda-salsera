import { Container } from "@/components/shared/container";
import type { Locale } from "@/types/locale";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEs = (locale as Locale) === "es";
  return {
    title: isEs ? "Política de Privacidad | ExploraGuate" : "Privacy Policy | ExploraGuate",
    description: isEs
      ? "Política de privacidad y tratamiento de datos del sitio ExploraGuate."
      : "Privacy policy and data handling for the ExploraGuate website.",
    robots: { index: true, follow: true }
  };
}

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
            <p>
              Este Sitio es operado por <strong>GuatCloud</strong>, desarrollador
              independiente con actividad en la República de Guatemala, responsable del
              tratamiento de los datos recogidos a través de{" "}
              <strong>salsa.exploraguate.com</strong>.
            </p>
            <p className="mt-3">
              Para consultas de privacidad o solicitudes sobre tus datos, escribinos a{" "}
              <a href="mailto:info@exploraguate.com" className="text-brand-600 hover:underline">
                info@exploraguate.com
              </a>
              . Nos comprometemos a responder en un plazo de 15 días hábiles.
            </p>
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
                    Google Analytics y solo se activan con tu consentimiento explícito.
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
                  <li>
                    <strong>Envío de academias y lugares:</strong> Al registrar una academia
                    o lugar, recopilamos la información ingresada (nombre, descripción, horarios,
                    datos de contacto). Esta información es revisada antes de publicarse.
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
              </a>
              .
            </p>
          </LegalSection>

          <LegalSection title="4. Base legal del tratamiento">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>Interés legítimo:</strong> para la publicación de información de
                eventos de acceso público y el funcionamiento del directorio.
              </li>
              <li>
                <strong>Consentimiento:</strong> para el uso de cookies analíticas (Google
                Analytics) que requieren aceptación explícita del usuario.
              </li>
              <li>
                <strong>Ejecución de servicio:</strong> para procesar información enviada
                voluntariamente a través de los formularios del Sitio.
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="5. Uso de la información">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Publicar y curar información de eventos de baile</li>
              <li>Mejorar el Sitio mediante analítica anónima (con consentimiento)</li>
              <li>Responder consultas y solicitudes de envío de eventos</li>
            </ul>
          </LegalSection>

          <LegalSection title="6. Compartición de datos">
            No vendemos, comercializamos ni transferimos tu información personal a
            terceros. Los datos de eventos enviados para publicación se muestran
            públicamente en el Sitio según la intención del remitente. Usamos servicios
            de terceros (Google Analytics, Supabase, Vercel) que tienen sus propias
            políticas de privacidad.
          </LegalSection>

          <LegalSection title="7. Almacenamiento y seguridad de datos">
            Los datos del Sitio se almacenan en infraestructura segura en la nube
            (Supabase y Vercel). Tomamos medidas razonables para proteger tu información,
            pero ninguna transmisión por internet es 100% segura. Los datos enviados a
            través de formularios se conservan mientras sean relevantes para el servicio.
          </LegalSection>

          <LegalSection title="8. Tus derechos">
            Podés:
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                Solicitar acceso, rectificación o eliminación de datos enviados a través
                del Sitio escribiéndonos a{" "}
                <a href="mailto:info@exploraguate.com" className="text-brand-600 hover:underline">
                  info@exploraguate.com
                </a>
              </li>
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

          <LegalSection title="9. Canal de reclamos">
            <p>
              Para reclamos relacionados con el tratamiento de tus datos o el contenido
              del Sitio, escribinos a{" "}
              <a href="mailto:info@exploraguate.com" className="text-brand-600 hover:underline">
                info@exploraguate.com
              </a>
              . Atenderemos tu solicitud en un plazo de 15 días hábiles.
            </p>
            <p className="mt-3">
              Adicionalmente, si sos consumidor en Guatemala, podés presentar tu queja
              ante la <strong>Dirección de Atención y Asistencia al Consumidor (DIACO)</strong>:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                Sitio web:{" "}
                <a
                  href="https://diaco.gob.gt"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-600 hover:underline"
                >
                  diaco.gob.gt
                </a>
              </li>
              <li>
                Trámite de quejas:{" "}
                <a
                  href="https://diaco.gob.gt/tramite-de-queja/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-600 hover:underline"
                >
                  diaco.gob.gt/tramite-de-queja
                </a>
              </li>
            </ul>
          </LegalSection>

          <LegalSection title="10. Privacidad de menores">
            El Sitio no está dirigido a menores de 13 años. No recopilamos
            conscientemente información de menores.
          </LegalSection>

          <LegalSection title="11. Cambios a esta política">
            Podemos actualizar esta Política de Privacidad. Los cambios se publicarán
            en esta página con la fecha de revisión actualizada. El uso continuado del
            Sitio tras los cambios implica la aceptación de la Política revisada.
          </LegalSection>

          <LegalSection title="12. Contacto">
            Para consultas sobre privacidad escribinos a{" "}
            <a href="mailto:info@exploraguate.com" className="text-brand-600 hover:underline">
              info@exploraguate.com
            </a>
            .
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
