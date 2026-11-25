import type { Dict } from '../i18n.service';
import { LAYOUT } from './layout';
import { HOME } from './home';
import { APP } from './app';
import { NOTES } from './notes';

export interface Entry { fr: Dict; en: Dict; }
export const ALL: Entry[] = [LAYOUT, HOME, APP, NOTES];
