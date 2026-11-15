import type { ExpressionSpecification, Map as MapLibreMap } from 'maplibre-gl';
import type { Language } from '../../shared/i18n';

/**
 * Names in the OpenFreeMap tiles (OpenMapTiles schema): `name` is the local
 * name ("Россия"), `name:xx` the name in each language, `name:latin` the
 * local name in Latin letters. Try the app language first, then fall back.
 */
const NAME_FIELDS: Record<Language, string[]> = {
  pt: ['name:pt', 'name:latin', 'name'],
  en: ['name:en', 'name_en', 'name:latin', 'name'],
};

/**
 * The basemap styles label places as "{name:latin} {name:nonlatin}", in the
 * local language. This switches every place-name layer to the app language.
 * Call it after each 'style.load' and whenever the language changes.
 *
 * Example: the label of Russia becomes "Rússia" (pt) or "Russia" (en)
 * instead of "Russia Россия".
 */
export function localizeBasemap(map: MapLibreMap, language: Language): void {
  const textField: ExpressionSpecification = [
    'coalesce',
    ...NAME_FIELDS[language].map((field): ExpressionSpecification => ['get', field]),
  ];
  for (const layer of map.getStyle().layers) {
    if (layer.type !== 'symbol') continue;
    const current: unknown = map.getLayoutProperty(layer.id, 'text-field');
    // Only place names: keep road numbers ("{ref}"), house numbers and the like.
    if (current === undefined || !JSON.stringify(current).includes('name')) continue;
    map.setLayoutProperty(layer.id, 'text-field', textField);
  }
}
