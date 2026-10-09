import type { Href } from 'expo-router';

/**
 * Destinations of the administrative area. The generated typed-routes list
 * index screens as "/…/index", so they are declared once here as `Href`.
 */
export const adminHref = {
  home: '/admin' as Href,
  workshops: '/admin/workshops' as Href,
  newWorkshop: '/admin/workshops/new' as Href,
  newPost: '/admin/posts/new' as Href,
  manage: (id: string) =>
    ({ pathname: '/admin/workshops/[id]', params: { id } }) as unknown as Href,
  edit: (id: string) =>
    ({
      pathname: '/admin/workshops/[id]/edit',
      params: { id },
    }) as unknown as Href,
  participants: (id: string) =>
    ({
      pathname: '/admin/workshops/[id]/participants',
      params: { id },
    }) as unknown as Href,
};
