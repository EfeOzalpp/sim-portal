// Components
import ProductionCard from "@/components/domain/productions/ProductionCard";

// Composition
import ProductionsCollapse from "@/app/thursdays/composition/ProductionsCollapse";
import type { ThursdayProducerPreview } from "@/app/thursdays/composition/ThursdayProducerAvatarStack";

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

function isPlaceholderProduction(production: ThursdayWithProductions["productions"][number]) {
  return (
    production.name === "Big Production" &&
    production.location === "Pozen Center" &&
    production.producers.length === 0 &&
    production.presentations.length === 0
  );
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
  const hasOnlyPlaceholderProduction =
    thursday.productions.length === 1 && isPlaceholderProduction(thursday.productions[0]);
  const isEmpty = thursday.productions.length === 0 || hasOnlyPlaceholderProduction;
  const presentationCount = thursday.productions.reduce(
    (total: number, production: any) => total + production.presentations.length,
    0,
  );
  const producerIds = new Set<string>();
  const producerPreviews: ThursdayProducerPreview[] = [];
  thursday.productions.forEach((production: any) => {
    production.producers.forEach((producer: any) => {
      if (producerIds.has(producer.id)) return;

      producerIds.add(producer.id);
      if (producerPreviews.length < 3) {
        producerPreviews.push({
          id: producer.id,
          name: producer.name,
          image: producer.image,
        });
      }
    });
  });
  const displayProductions = thursday.productions.length > 0
    ? thursday.productions.map((production: any) => (
        isPlaceholderProduction(production)
          ? { ...production, isPlaceholderDisplay: true }
          : production
      ))
    : [{
        id: `${thursday.id}-empty-production`,
        name: "",
        location: "Pozen Center",
        producers: [],
        presentations: [],
        isPlaceholderDisplay: true,
      }];

  return (
    <ProductionsCollapse
      isFirst={isFirst}
      isLast={isLast}
      productions={[{
        id: thursday.id,
        name: thursdayName,
        href: `/thursdays?thursdayId=${thursday.id}`,
        date: formattedDate,
        calendarDate: thursday.date.toISOString().slice(0, 10),
        productionCount: isEmpty ? 0 : thursday.productions.length,
        presentationCount,
        producerCount: producerIds.size,
        producerPreviews,
        isEmpty,
        canEdit: isAdmin,
        content: (
          <>
            {displayProductions.map((production: any, index: number) => (
                <ProductionCard
                  key={production.id}
                  thursday={thursday as any}
                  production={production}
                  productionIndex={index}
                  productionCount={displayProductions.length}
                  isAdmin={isAdmin}
                  showEditButton={!isEmpty}
                  surface="page"
                />
              ))}
          </>
        ),
      }]}
    />
  );
}
