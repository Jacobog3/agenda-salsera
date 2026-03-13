import { Container } from "@/components/shared/container";

export const metadata = {
  title: "Términos de Uso | ExploraGuate",
  robots: { index: true, follow: true }
};

export default function TermsPage() {
  return (
    <section className="page-section pb-16">
      <Container className="max-w-2xl">
        <div className="space-y-8">
          <div className="space-y-2 border-b border-gray-100 pb-6">
            <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">
              Términos de Uso
            </h1>
            <p className="text-sm text-gray-400">Última actualización: marzo 2026</p>
          </div>

          <LegalSection title="1. Aceptación de los términos">
            Al acceder y usar <strong>salsa.exploraguate.com</strong> (el &quot;Sitio&quot;),
            operado por GuatCloud, aceptás quedar sujeto a estos Términos de Uso.
            Si no estás de acuerdo, por favor no uses el Sitio.
          </LegalSection>

          <LegalSection title="2. Descripción del servicio">
            ExploraGuate es una agenda y directorio de eventos, lugares y academias de
            salsa, bachata y baile latino en Guatemala. El contenido es informativo y
            tiene como fin ayudar a la comunidad a descubrir actividades de baile.
          </LegalSection>

          <LegalSection title="3. Uso de información de publicaciones públicas">
            <p>
              Parte del contenido publicado en este Sitio proviene de publicaciones
              realizadas públicamente en redes sociales como Instagram, Facebook,
              WhatsApp y otras plataformas similares por organizadores de eventos,
              academias y locales de entretenimiento.
            </p>
            <p className="mt-3">
              Dicha información es de acceso público y es utilizada únicamente con
              fines informativos y de difusión cultural, sin fines comerciales directos
              sobre el contenido de terceros. ExploraGuate no se atribuye autoría de
              flyers, imágenes ni descripciones originales de terceros.
            </p>
            <p className="mt-3">
              Si sos propietario de contenido publicado en este Sitio y deseás que sea
              removido o modificado, podés contactarnos a{" "}
              <a href="mailto:info@exploraguate.com" className="text-brand-600 hover:underline">
                info@exploraguate.com
              </a>{" "}
              y atenderemos tu solicitud a la brevedad.
            </p>
          </LegalSection>

          <LegalSection title="4. Contenido enviado por usuarios">
            Los usuarios pueden enviar información de eventos a través del Sitio. Al
            hacerlo, confirmás que la información es veraz y que tenés derecho a
            compartirla. GuatCloud se reserva el derecho de revisar, editar o eliminar
            cualquier contenido enviado a su sola discreción.
          </LegalSection>

          <LegalSection title="5. Propiedad intelectual">
            El diseño, código y contenido original del Sitio son propiedad de
            GuatCloud. Los flyers e imágenes de eventos pertenecen a sus respectivos
            creadores y se muestran únicamente con fines informativos.
          </LegalSection>

          <LegalSection title="6. Exactitud de la información">
            ExploraGuate no garantiza la exactitud, integridad ni vigencia de la
            información de eventos. Las fechas, precios y lugares son sujetos a cambios
            por parte de los organizadores. Recomendamos verificar los detalles directamente
            con el organizador antes de asistir.
          </LegalSection>

          <LegalSection title="7. Limitación de responsabilidad">
            GuatCloud no será responsable por daños directos, indirectos, incidentales
            o consecuentes derivados del uso del Sitio o de la confianza en la
            información publicada.
          </LegalSection>

          <LegalSection title="8. Cambios a los términos">
            GuatCloud puede actualizar estos Términos en cualquier momento. El uso
            continuado del Sitio tras los cambios implica la aceptación de los Términos
            revisados.
          </LegalSection>

          <LegalSection title="9. Ley aplicable">
            Estos Términos se rigen por las leyes de la República de Guatemala.
          </LegalSection>

          <LegalSection title="10. Contacto">
            Para consultas sobre estos Términos, escribinos a{" "}
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
