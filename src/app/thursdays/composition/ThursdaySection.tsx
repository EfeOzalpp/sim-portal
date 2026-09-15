"use client";

// Components
import { Input } from "@/components/input";
import { DatePicker } from "@/components/datepicker";
import { Select } from "@/components/select";
import { FieldError } from "@/components/field-error";

// Composition
import { fieldStackClassName } from "@/app/thursdays/composition/thursdayFormClasses";

// Helpers
import { Controller, useFormState, useWatch } from "react-hook-form";
import dayjs from "dayjs";
import { getSemesterYear } from "@/components/domain/filters/semester-filter";

interface ThursdaySectionProps {
  control: any;
  semesters?: Array<{ id: string; name: string }>;
}

export default function ThursdaySection({
  control,
  semesters,
}: ThursdaySectionProps) {
  // Anchors the Date picker's initial panel on the selected semester's own
  // year instead of wherever it opens by default - adding a Day to FA30
  // should start the calendar looking at 2030, not today.
  const semesterIdValue = useWatch({ control, name: "semesterId" });
  const selectedSemesterName = semesters?.find((s) => s.id === semesterIdValue)?.name;
  const dateTargetYear = getSemesterYear(selectedSemesterName);

  // Errors shouldn't appear the instant the modal opens (the mount-time
  // trigger() that keeps Save's isValid check accurate validates every
  // field right away) - only once the field's been touched, or a submit's
  // actually been attempted.
  const { isSubmitted } = useFormState({ control });

  return (
    <div className="flex flex-1 flex-col gap-[1.725rem]">
      <div className={semesters ? "grid grid-cols-1 gap-6 min-[601px]:grid-cols-2" : undefined}>
        {semesters && (
          <div className={fieldStackClassName}>
            <span className="ui-label m-0 block">Semester</span>
            <Controller
              control={control}
              name="semesterId"
              render={({ field }) => (
                <Select
                  inModal
                  {...field}
                  options={semesters.map((s) => ({ label: s.name, value: s.id }))}
                />
              )}
            />
          </div>
        )}
        <div className={fieldStackClassName}>
          <span className="ui-label m-0 block">Day Name *</span>
          <Controller
            control={control}
            name="name"
            rules={{ required: "Day name is required" }}
            render={({ field, fieldState }) => {
              const showError = Boolean(fieldState.error) && (fieldState.isTouched || isSubmitted);
              return (
                <>
                  <Input
                    {...field}
                    placeholder="Enter Day name"
                    status={showError ? "error" : ""}
                  />
                  {showError && (
                    <FieldError>{fieldState.error!.message}</FieldError>
                  )}
                </>
              );
            }}
          />
        </div>
      </div>

      <div className={fieldStackClassName}>
        <span className="ui-label m-0 block">Date *</span>
        <Controller
          control={control}
          name="date"
          rules={{ required: "Date is required" }}
          render={({ field, fieldState }) => {
            const showError = Boolean(fieldState.error) && (fieldState.isTouched || isSubmitted);
            return (
              <>
                <DatePicker
                  {...field}
                  key={!field.value && dateTargetYear ? dateTargetYear : "fixed"}
                  value={field.value ? dayjs(field.value) : null}
                  defaultPickerValue={
                    !field.value && dateTargetYear ? dayjs().year(dateTargetYear) : undefined
                  }
                  onChange={(d) =>
                    field.onChange(d && !Array.isArray(d) ? d.toISOString() : null)
                  }
                  style={{ width: "100%" }}
                  size="large"
                  format="MMM D, YYYY"
                  status={showError ? "error" : ""}
                />
                {showError && (
                  <FieldError>{fieldState.error!.message}</FieldError>
                )}
              </>
            );
          }}
        />
      </div>
    </div>
  );
}
