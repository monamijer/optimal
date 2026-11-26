import { Dict } from './i18n.service';
import { ALL } from './dict';
export const EN: Dict = Object.assign({}, ...ALL.map(d => d.en));
