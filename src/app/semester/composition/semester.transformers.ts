import dayjs, { Dayjs } from "dayjs";
import { SemesterInput } from "@/actions/schemas";
import { Prisma } from "@prisma/client";

type SemesterWithThursdays = Prisma.SemesterGetPayload<{ include: { thursdays: true, users: true } }>;

export function getSemesterDateRange(semester: SemesterWithThursdays): [Dayjs | null, Dayjs | null] {
  if (!semester?.thursdays?.length) return [null, null];

  const sortedDates = semester.thursdays
    .map((t) => new Date(t.date))
    .sort((a, b) => a.getTime() - b.getTime());

  return [dayjs(sortedDates[0]), dayjs(sortedDates[sortedDates.length - 1])];
}

export const transformSemesterFromAPI = (semester: SemesterWithThursdays | null, usersFromCurrentSemester: any[] = []) => {
  if (!semester) {
    return {
      name: "",
      dates: [null, null] as [Dayjs | null, Dayjs | null],
      users: (usersFromCurrentSemester || []).map(({ id }) => id) as string[],
    };
  }

  return {
    id: semester.id,
    name: semester.name,
    dates: getSemesterDateRange(semester),
    users: (semester.users || []).map(({ id }) => id) as string[],
  };
};

export const transformSemesterPayload = (formData: any): SemesterInput & { dates: string[], users: string[] } => {
  return {
    ...formData,
    dates: [
      formData.dates?.[0]?.toISOString ? formData.dates[0].toISOString() : formData.dates?.[0],
      formData.dates?.[1]?.toISOString ? formData.dates[1].toISOString() : formData.dates?.[1],
    ],
  };
};
