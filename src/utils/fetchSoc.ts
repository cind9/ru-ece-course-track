export interface SocCourse {
  courseString: string;
  courseNumber: string;
  title: string;
  credits: number;
  sections?: { subtitle?: string; notes?: string }[];
}

export async function fetchEce332Offerings(
  year: number,
  term: number,
): Promise<SocCourse[]> {
  const params = new URLSearchParams({
    year: String(year),
    term: String(term),
    campus: "NB",
    level: "U",
  });
  const url = `/soc-api/courses.json?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`SOC API error: ${res.status}`);
  const data: SocCourse[] = await res.json();
  return data.filter((c) => c.courseString?.startsWith("14:332:"));
}

export function getSectionTopics(course: SocCourse): string[] {
  const topics: string[] = [];
  for (const s of course.sections ?? []) {
    const t = (s.subtitle || s.notes || "").trim();
    if (t) topics.push(t);
  }
  return topics;
}
