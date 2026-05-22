import { formatTopicTitle, isSeniorOnlySection } from "./topicTitles";

export interface SocSection {
  subtitle?: string;
  notes?: string;
  sectionEligibility?: string;
}

export interface SocCourse {
  courseString: string;
  courseNumber: string;
  title: string;
  credits: number;
  sections?: SocSection[];
}

export interface SocTopicSection {
  code: string;
  topic: string;
  seniorOnly: boolean;
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

export function getTopicSections(course: SocCourse): SocTopicSection[] {
  const topics: SocTopicSection[] = [];
  for (const s of course.sections ?? []) {
    const raw = (s.subtitle || s.notes || "").trim();
    if (!raw) continue;
    topics.push({
      code: course.courseString,
      topic: formatTopicTitle(raw),
      seniorOnly: isSeniorOnlySection(s.sectionEligibility),
    });
  }
  return topics;
}

/** @deprecated Use getTopicSections */
export function getSectionTopics(course: SocCourse): string[] {
  return getTopicSections(course).map((t) => t.topic);
}
