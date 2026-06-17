/** @param {import('../types/letter.js').Letter[]} letters */
export function sortLetters(letters) {
  return [...letters].sort((a, b) => {
    const d = a.isoDate.localeCompare(b.isoDate);
    if (d !== 0) return d;
    const oa = a.sameDayOrder ?? 0;
    const ob = b.sameDayOrder ?? 0;
    if (oa !== ob) return oa - ob;
    return a.slug.localeCompare(b.slug);
  });
}
