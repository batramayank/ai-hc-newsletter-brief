/**
 * Maps a category name to Tailwind bg + text color classes.
 * Full class names used as literals so Tailwind JIT includes them.
 */
export function getCategoryColor(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('clinical')) return 'bg-blue-600 text-white';
  if (c.includes('admin') || c.includes('rcm')) return 'bg-emerald-600 text-white';
  if (c.includes('patient')) return 'bg-rose-600 text-white';
  if (c.includes('regulat')) return 'bg-amber-600 text-white';
  if (c.includes('research') || c.includes('innovation')) return 'bg-violet-600 text-white';
  if (c.includes('fund') || c.includes('invest')) return 'bg-sky-600 text-white';
  if (c.includes('digital') || c.includes('tech')) return 'bg-indigo-600 text-white';
  if (c.includes('workforce') || c.includes('staffing')) return 'bg-orange-600 text-white';
  return 'bg-teal-600 text-white';
}
