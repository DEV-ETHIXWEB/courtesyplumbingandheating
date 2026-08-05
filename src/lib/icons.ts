import * as icons from '@lucide/astro';
import type { AstroComponent } from '@lucide/astro';

/**
 * Maps kebab-case icon names (as stored in data files) to Lucide Astro components.
 * Data files store icon names as plain strings so they stay JSON-serializable
 * and framework-agnostic; this is the single place that resolves them to components.
 */
function toPascalCase(kebab: string): string {
  return kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export function getIconComponent(name: string): AstroComponent {
  const componentName = toPascalCase(name) as keyof typeof icons;
  const icon = icons[componentName] as unknown as AstroComponent | undefined;
  if (!icon) {
    throw new Error(`Unknown icon: "${name}" (looked up as "${String(componentName)}")`);
  }
  return icon;
}
