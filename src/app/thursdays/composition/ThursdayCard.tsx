// Components
import ProductionCard from "@/components/domain/productions/ProductionCard";

// Composition
import ProductionsCollapse from "@/app/thursdays/composition/ProductionsCollapse";

// Helpers
import { auth } from "@/authentication";
import { normalizeThursdayName } from "@/helpers";
import { isAdminRole } from "@/constants/roles";
import { formatShortMonthDay } from "@/constants/date-format";
import { Prisma } from "@prisma/client";

type ThursdayWithProductions = Prisma.ThursdayGetPayload<{
  include: {
    productions: {
      include: {
        producers: { select: { id: true; name: true; image: true; role: true } };
        presentations: {
          include: {
            presenters: { select: { id: true; name: true; image: true } };
          };
        };
      };
    };
  };
}>;

interface ThursdayCardProps {
  thursday: ThursdayWithProductions;
  isAdmin?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

export default async function ThursdayCard({
  thursday,
  isAdmin: initialIsAdmin,
  isFirst,
  isLast,
}: ThursdayCardProps) {
  let isAdmin = initialIsAdmin;
  if (isAdmin === undefined) {
    const session = await auth();
    isAdmin = isAdminRole(session?.user?.role);
  }
  const formattedDate = formatShortMonthDay(thursday.date);
  const thursdayName = normalizeThursdayName(thursday.name);

  return (
    <ProductionsCollapse
      isFirst={isFirst}
      isLast={isLast}
      productions={[{
        id: thursday.id,
        name: thursdayName,
        href: `/thursdays?thursdayId=${thursday.id}`,
        date: formattedDate,
        content: (
          <>
            {thursday.productions.length > 0 ? (
              thursday.productions.map((production: any, index: number) => (
                <ProductionCard
                  key={production.id}
                  thursday={thursday as any}
                  production={production}
                  productionIndex={index}
                  productionCount={thursday.productions.length}
                  isAdmin={isAdmin}
                />
              ))
            ) : (
              <span className="text-[0.82rem] text-[var(--label-text)] italic">No current productions</span>
            )}
          </>
        ),
      }]}
    />
  );
}
