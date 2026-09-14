"use client";

// React & Next.js
import { useEffect, useState } from "react";

// Actions
import {
  BasicUser,
  ProductionInput,
  ThursdayInput,
} from "@/actions/schemas";
import { ActionResult } from "@/actions/utilities";

// Components
import { Alert } from "@/components/alert";
import { Button } from "@/components/button";
import { useModalCloseGuard } from "@/components/modal/CloseGuard";
import { useToast } from "@/components/toast";

// Composition
import {
  transformThursdayFromAPI,
  transformThursdayPayload,
} from "@/app/thursdays/composition/thursday.transformers";
import ThursdaySection from "@/app/thursdays/composition/ThursdaySection";
import ProductionsSection from "@/app/thursdays/composition/ProductionsSection";

// Helpers
import { useForm } from "react-hook-form";
import { handleFormAction } from "@/helpers";
import { getCurrentSemesterCode, normalizeSemesterCode } from "@/components/domain/filters/semester-filter";

interface ThursdayFormValues extends Omit<ThursdayInput, "date"> {
  productions: ProductionInput[];
  semesterId: string | null;
  date: any;
}

interface ThursdayFormProps {
  defaultValues?: any;
  users: BasicUser[];
  semesters: Array<{ id: string; name: string }>;
  thursdayId?: string;
  onSubmit: (data: any) => Promise<ActionResult<any> | any>;
}

export default function ThursdayForm({
  defaultValues,
  users,
  semesters,
  thursdayId,
  onSubmit,
}: ThursdayFormProps) {
  // Transform API data into form shape if provided
  const initialValues: ThursdayFormValues = defaultValues
    ? transformThursdayFromAPI(defaultValues)
    : {
        name: "",
        date: "",
        // Prefer whichever semester actually matches today over semesters[0]
        // (newest by code) - production keeps future semesters pre-created
        // for planning ahead, and those would otherwise always outrank the
        // real current one as "newest", silently misfiling a new Day.
        semesterId:
          semesters?.find(
            (semester) => normalizeSemesterCode(semester.name) === getCurrentSemesterCode(),
          )?.id ?? semesters?.[0]?.id ?? null,
        productions: [],
      };

  const {
    control,
    handleSubmit,
    trigger,
    formState: { isSubmitting, isDirty, isValid },
  } = useForm<ThursdayFormValues>({
    defaultValues: initialValues as any,
    mode: "onChange",
  });

  useEffect(() => {
    trigger();
  }, [trigger]);

  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleFormSubmit = async (data: ThursdayFormValues) => {
    const payload = transformThursdayPayload(data);
    await handleFormAction(
      () => onSubmit(payload),
      setError,
      "An error occurred while saving Day.",
      () => toast.success(defaultValues ? "Changes saved" : "Day created"),
    );
  };

  useModalCloseGuard(isDirty && !isSubmitting, isValid, () => handleSubmit(handleFormSubmit)());

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-[1.725rem]">
        {error && (
          <Alert
            description={error}
            tone="danger"
            closable
            showIcon
            onClose={() => setError(null)}
          />
        )}

        <ThursdaySection control={control} semesters={semesters} />
        <ProductionsSection control={control} users={users} semesters={semesters} />
      </div>

      <div className="mt-4 flex justify-start pt-4">
        <Button type="submit" disabled={isSubmitting} tone="success" fullWidth>
          {isSubmitting
            ? "Saving..."
            : thursdayId
              ? "Save Changes"
              : "Create Day"}
        </Button>
      </div>
    </form>
  );
}
