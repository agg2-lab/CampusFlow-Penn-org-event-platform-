import { v4 as uuid } from "uuid";

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + `-${uuid().slice(0, 6)}`
  );
}
