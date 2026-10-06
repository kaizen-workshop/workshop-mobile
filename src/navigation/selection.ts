export type SelectedWorkshop = Readonly<{
  id: string;
  title?: string;
}>;

export type SelectedEntity = Readonly<{ id: string; title?: string }>;

const storageKey = 'workshop-mobile:selected-workshop';
let selectedWorkshop: SelectedWorkshop | undefined;
let selectedGroup: SelectedEntity | undefined;
let selectedPost: SelectedEntity | undefined;

export function selectWorkshop(workshop: SelectedWorkshop) {
  selectedWorkshop = workshop;
  try {
    globalThis.sessionStorage?.setItem(storageKey, JSON.stringify(workshop));
  } catch {
    // Native runtimes and restricted browsers may not expose sessionStorage.
  }
}

export function getSelectedWorkshop(): SelectedWorkshop | undefined {
  if (selectedWorkshop) return selectedWorkshop;
  try {
    const stored = globalThis.sessionStorage?.getItem(storageKey);
    if (!stored) return undefined;
    const parsed = JSON.parse(stored) as Partial<SelectedWorkshop>;
    if (typeof parsed.id !== 'string' || !parsed.id.trim()) return undefined;
    selectedWorkshop = {
      id: parsed.id,
      ...(typeof parsed.title === 'string' ? { title: parsed.title } : {}),
    };
    return selectedWorkshop;
  } catch {
    return undefined;
  }
}

export function selectGroup(group: SelectedEntity) {
  selectedGroup = group;
  writeSelection('group', group);
}

export function getSelectedGroup() {
  selectedGroup ??= readSelection('group');
  return selectedGroup;
}

export function selectPost(post: SelectedEntity) {
  selectedPost = post;
  writeSelection('post', post);
}

export function getSelectedPost() {
  selectedPost ??= readSelection('post');
  return selectedPost;
}

function writeSelection(name: string, value: SelectedEntity) {
  try {
    globalThis.sessionStorage?.setItem(
      `${storageKey}:${name}`,
      JSON.stringify(value),
    );
  } catch {
    // Native runtimes and restricted browsers may not expose sessionStorage.
  }
}

function readSelection(name: string): SelectedEntity | undefined {
  try {
    const stored = globalThis.sessionStorage?.getItem(`${storageKey}:${name}`);
    if (!stored) return undefined;
    const parsed = JSON.parse(stored) as Partial<SelectedEntity>;
    if (typeof parsed.id !== 'string' || !parsed.id.trim()) return undefined;
    return {
      id: parsed.id,
      ...(typeof parsed.title === 'string' ? { title: parsed.title } : {}),
    };
  } catch {
    return undefined;
  }
}
