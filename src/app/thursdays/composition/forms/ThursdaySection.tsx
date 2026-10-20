"use client";

// Components
import { Input } from "@/components/input";
import { DatePicker } from "@/components/datepicker";
import { Select } from "@/components/select";
import { FormField, FormStack } from "@/components/form";

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
    <FormStack className="flex-1">
      <div className={semesters ? "grid grid-cols-1 gap-x-4 gap-y-8 min-[601px]:grid-cols-2" : undefined}>
          <Controller
            control={control}
            name="name"
            rules={{ required: "Day title is required" }}
            render={({ field, fieldState }) => {
              const showError = Boolean(fieldState.error) && (fieldState.isTouched || isSubmitted);
              return (
                <FormField label="Day Title" required htmlFor={field.name} error={showError ? fieldState.error?.message : undefined}>
                  <Input
                    id={field.name}
                    variant="modal"
                    {...field}
                    placeholder="Enter day title"
                    status={showError ? "error" : ""}
                  />
                </FormField>
              );
            }}
          />
        {semesters && (
          <FormField label="Semester">
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
          </FormField>
        )}
      </div>

        <Controller
          control={control}
          name="date"
          rules={{ required: "Date is required" }}
          render={({ field, fieldState }) => {
            const showError = Boolean(fieldState.error) && (fieldState.isTouched || isSubmitted);
            return (
              <FormField label="Date" required htmlFor={field.name} error={showError ? fieldState.error?.message : undefined}>
                <DatePicker
                  {...field}
                  id={field.name}
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
              </FormField>
            );
          }}
        />
    </FormStack>
  );
}
