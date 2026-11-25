import { Dict } from './i18n.service';
import { ALL } from './dict';
export const FR: Dict = Object.assign({}, ...ALL.map(d => d.fr));
