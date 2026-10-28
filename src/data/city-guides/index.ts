import { bodenGuide } from './boden';
import { oskarshamnGuide } from './oskarshamn';
import { luleaGuide } from './lulea';
import { gavleGuide } from './gavle';
import { monsterasGuide } from './monsteras';
import type { GuideCityContent } from './common';

export const cityGuideContent = {
  boden: bodenGuide,
  oskarshamn: oskarshamnGuide,
  lulea: luleaGuide,
  gavle: gavleGuide,
  monsteras: monsterasGuide,
} satisfies Record<string, GuideCityContent>;
