import { getCollection, type CollectionEntry } from 'astro:content';

export type DocItem = {
  entry: CollectionEntry<'docs'>;
  slug: string;
  section: string;
  sectionTitle: string;
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

export function sectionKeyFromEntry(entry: CollectionEntry<'docs'>, slug: string) {
  if (entry.data.section_key) return String(entry.data.section_key);
  return sectionFromSlug(slug);
}

export function sectionTitleFromEntry(entry: CollectionEntry<'docs'>, section: string) {
  if (entry.data.section_title) return String(entry.data.section_title);
  return section;
}

export async function getAllDocEntries(): Promise<DocItem[]> {
  return (await getCollection('docs')).map((entry) => {
    const slug = slugFromId(entry.id);
    const rootSection = sectionFromSlug(slug);
    const section = sectionKeyFromEntry(entry, slug);
    const isSectionIndex = slug === rootSection;
    return {
      entry,
      slug,
      section,
      sectionTitle: sectionTitleFromEntry(entry, section),
      title: titleFromEntry(entry),
      order: isSectionIndex ? -1 : Number(entry.data.nav_order ?? 999),
      isSectionIndex
    };
  });
}
