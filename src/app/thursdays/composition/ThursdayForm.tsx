"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/alert";
import { Button } from "@/components/button";
import {
  transformThursdayFromAPI,
  transformThursdayPayload,
} from "@/app/thursdays/composition/thursday.transformers";
import ThursdaySection from "@/app/thursdays/composition/ThursdaySection";
import ProductionsSection from "@/app/thursdays/composition/ProductionsSection";
import { handleFormAction } from "@/helpers";
import {
  BasicUser,
  ProductionInput,
  ThursdayInput,
} from "@/actions/schemas";
import { ActionResult } from "@/actions/utilities";

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
        semesterId: semesters?.[0]?.id || null,
        productions: [],
      };

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ThursdayFormValues>({
    defaultValues: initialValues as any,
  });

  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: ThursdayFormValues) => {
    const payload = transformThursdayPayload(data);
    await handleFormAction(
      () => onSubmit(payload),
      setError,
      "An error occurred while saving Day.",
    );
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-[calc(var(--gap-lg)*1.15)]">
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
        <ProductionsSection control={control} users={users} />
      </div>

      <div className="mt-[var(--spacing-md)] flex justify-start pt-[var(--spacing-md)]">
        <Button type="submit" disabled={isSubmitting} tone="success">
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
