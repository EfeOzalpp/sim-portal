import ThursdayCard from "@/app/thursdays/composition/list/ThursdayCard";

export default function ThursdaysListView({ thursdays, isAdmin }: { thursdays: any[]; isAdmin: boolean }) {
  return (
    <div className="grid gap-2 min-[769px]:pt-4">
      {thursdays.map((thursday: any, index: number) => (
        <ThursdayCard key={thursday.id} thursday={thursday} isAdmin={isAdmin} isFirst={index === 0} isLast={index === thursdays.length - 1} />
      ))}
    </div>
  );
}
