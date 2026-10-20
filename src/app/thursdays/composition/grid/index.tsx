import ThursdayGridCard from "@/app/thursdays/composition/grid/ThursdayGridCard";
import { formatShortMonthDay } from "@/constants/date-format";
import { normalizeThursdayName } from "@/helpers";

interface ThursdaysGridViewProps {
  thursdays: any[];
  isAdmin: boolean;
  getViewHref: (thursdayId: string) => string;
}

export default function ThursdaysGridView({ thursdays, isAdmin, getViewHref }: ThursdaysGridViewProps) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 pb-6 min-[769px]:pt-4 min-[769px]:grid-cols-[repeat(auto-fill,minmax(min(100%,18rem),1fr))]">
      {thursdays.map((thursday: any) => {
        const hasOnlyPlaceholderProduction =
          thursday.productions.length === 1 &&
          thursday.productions[0].name === "Big Production" &&
          thursday.productions[0].location === "Pozen Center" &&
          (thursday.productions[0].tags?.length ?? 0) === 0 &&
          thursday.productions[0].presentations.length === 0 &&
          thursday.productions[0].producers.length === 0;
        const isEmpty = thursday.productions.length === 0 || hasOnlyPlaceholderProduction;
        const presentationCount = thursday.productions.reduce((total: number, production: any) => total + production.presentations.length, 0);
        const producerIds = new Set<string>();
        const producerPreviews: { id: string; name: string | null; image?: string | null }[] = [];
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

        return (
          <ThursdayGridCard
            key={thursday.id}
            id={thursday.id}
            name={normalizeThursdayName(thursday.name)}
            href={getViewHref(thursday.id)}
            date={formatShortMonthDay(thursday.date) || ""}
            calendarDate={thursday.date.toISOString().slice(0, 10)}
            productionCount={isEmpty ? 0 : thursday.productions.length}
            presentationCount={presentationCount}
            producerCount={producerIds.size}
            producerPreviews={producerPreviews}
            isEmpty={isEmpty}
            isAdmin={isAdmin}
          />
        );
      })}
    </div>
  );
}
