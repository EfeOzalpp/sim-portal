import ProductionsCollapse from "@/app/thursdays/composition/ProductionsCollapse";
import ProductionCard from "@/components/domain/thursdays/ProductionCard";
import { auth } from "@/authentication";
import { normalizeThursdayName } from "@/helpers";

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
}

export default async function ThursdayCard({
  thursday,
  isAdmin: initialIsAdmin,
}: ThursdayCardProps) {
  let isAdmin = initialIsAdmin;
  if (isAdmin === undefined) {
    const session = await auth();
    isAdmin = session?.user?.role === "ADMIN";
  }
  const formattedDate = new Date(thursday.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const thursdayName = normalizeThursdayName(thursday.name);

  return (
    <ProductionsCollapse
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
              <span className="text-[0.82rem] text-[var(--app-muted)] italic">No current productions</span>
            )}
          </>
        ),
      }]}
    />
  );
}
