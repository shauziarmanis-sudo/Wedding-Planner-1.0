"use client";

import { BaseTemplateProps } from "@/types/invitation.types";
import {
  withBaseTemplate,
  createSectionRenderer,
  getSpacingClass,
} from "../BaseTemplate";

function SundaneseFloralTemplate(props: BaseTemplateProps) {
  const { config } = props;
  const sections = config.sectionOrder || config.sections || ['hero', 'countdown', 'couple', 'event', 'gallery', 'map', 'rsvp', 'wishes'];
  const renderSection = createSectionRenderer(props);

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', color: config.colorText || 'var(--color-primary)' }}>
      {sections.map(renderSection)}

      {/* Footer */}
      <footer className={`${getSpacingClass('compact')} text-center border-t`} style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
        <p className="text-xs opacity-50" style={{ fontFamily: 'var(--font-body)' }}>
          Dibuat dengan â¤ï¸ menggunakan Life-Start
        </p>
      </footer>
    </div>
  );
}

export default withBaseTemplate(SundaneseFloralTemplate);
