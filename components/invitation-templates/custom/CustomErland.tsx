"use client";

import { BaseTemplateProps } from "@/types/invitation.types";
import {
  withBaseTemplate,
  createSectionRenderer,
  getSpacingClass,
} from "../BaseTemplate";

function CustomErlandTemplate(props: BaseTemplateProps) {
  const { weddingData, config } = props;
  const sections = config.sectionOrder || config.sections || ['hero', 'couple', 'event', 'gallery', 'rsvp', 'wishes', 'gift'];
  const renderSection = createSectionRenderer(props);

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', color: config.colorText || 'var(--color-primary)' }}>
      {sections.map(renderSection)}

      {/* Footer Khusus */}
      <footer className={`${getSpacingClass('compact')} text-center py-6 mt-10`} style={{ backgroundColor: 'var(--color-bg)' }}>
        <p className="text-sm font-semibold opacity-60" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
          {weddingData.groomName} &amp; {weddingData.brideName}
        </p>
        <p className="text-xs mt-2 opacity-40" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-primary)' }}>
          Dibuat dengan ❤️ menggunakan Life-Start
        </p>
      </footer>
    </div>
  );
}

export default withBaseTemplate(CustomErlandTemplate);
