"use client";

import { Controller } from "react-hook-form";
import { Input } from "@/components/input";
import { DatePicker } from "@/components/datepicker";
import { Select } from "@/components/select";
import dayjs from "dayjs";
import { fieldStackClassName } from "@/app/thursdays/composition/thursdayFormClasses";

interface ThursdaySectionProps {
  control: any;
  semesters?: Array<{ id: string; name: string }>;
}

export default function ThursdaySection({
  control,
  semesters,
}: ThursdaySectionProps) {
  return (
    <div className="flex flex-1 flex-col gap-[calc(var(--gap-lg)*1.15)]">
      <div className={semesters ? "grid grid-cols-1 gap-[var(--gap-lg)] min-[601px]:grid-cols-2" : undefined}>
        {semesters && (
          <div className={fieldStackClassName}>
            <span className="ui-label m-0 block">Semester</span>
            <Controller
              control={control}
              name="semesterId"
              render={({ field }) => (
                <Select
                  {...field}
                  options={semesters.map((s) => ({ label: s.name, value: s.id }))}
                />
              )}
            />
          </div>
        )}
        <div className={fieldStackClassName}>
          <span className="ui-label m-0 block">Day Name</span>
          <Controller
            control={control}
            name="name"
            rules={{ required: "Day name is required" }}
            render={({ field, fieldState }) => (
              <>
                <Input
                  {...field}
                  placeholder="Enter Day name"
                  status={fieldState.error ? "error" : ""}
                />
                {fieldState.error && (
                  <span className="ui-note">{fieldState.error.message}</span>
                )}
              </>
            )}
          />
        </div>
      </div>

      <div className={fieldStackClassName}>
        <span className="ui-label m-0 block">Date</span>
        <Controller
          control={control}
          name="date"
          rules={{ required: "Date is required" }}
          render={({ field, fieldState }) => (
            <>
              <DatePicker
                {...field}
                value={field.value ? dayjs(field.value) : null}
                onChange={(d) =>
                  field.onChange(d && !Array.isArray(d) ? d.toISOString() : null)
                }
                style={{ width: "100%" }}
                size="large"
                format="MMM D, YYYY"
                status={fieldState.error ? "error" : ""}
              />
              {fieldState.error && (
                <span className="ui-note">{fieldState.error.message}</span>
              )}
            </>
          )}
        />
      </div>
    </div>
  );
}
