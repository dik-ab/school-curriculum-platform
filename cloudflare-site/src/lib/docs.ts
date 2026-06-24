import { getCollection, type CollectionEntry } from 'astro:content';

export type DocItem = {
  entry: CollectionEntry<'docs'>;
  slug: string;
  section: string;
  title: string;
  order: number;
  isSectionIndex: boolean;
};

export function slugFromId(id: string) {
  const withoutExt = id.replace(/\.md$/, '');
  if (withoutExt === 'index') return 'legacy-home';
  if (withoutExt === 'README') return 'readme';
  if (withoutExt.endsWith('/index')) return withoutExt.slice(0, -'/index'.length);
  return withoutExt;
}

export function sectionFromSlug(slug: string) {
  return slug.includes('/') ? slug.split('/')[0] : slug;
}

export function titleFromEntry(entry: CollectionEntry<'docs'>) {
  if (entry.data.title) return String(entry.data.title);
  return entry.id.split('/').pop()?.replace(/\.md$/, '').replace(/[-_]/g, ' ') ?? 'Page';
}

export async function getAllDocEntries(): Promise<DocItem[]> {
  return (await getCollection('docs')).map((entry) => {
    const slug = slugFromId(entry.id);
    const section = sectionFromSlug(slug);
    const isSectionIndex = slug === section;
    return {
      entry,
      slug,
      section,
      title: titleFromEntry(entry),
      order: isSectionIndex ? -1 : Number(entry.data.nav_order ?? 999),
      isSectionIndex
    };
  });
}
