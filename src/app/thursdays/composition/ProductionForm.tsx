"use client";

import { Controller } from "react-hook-form";
import { Input } from "@/components/input";
import { Select } from "@/components/select";
import { Button } from "@/components/button";
import PresentationsField from "@/app/thursdays/composition/PresentationsField";
import { BasicUser } from "@/actions/schemas";
import {
  fieldStackClassName,
  inlineActionsClassName,
  sectionHeaderClassName,
} from "@/app/thursdays/composition/thursdayFormClasses";

const LOCATIONS = [
  { label: "Pozen Center", value: "Pozen Center" },
  { label: "Studio A", value: "Studio A" },
  { label: "Studio B", value: "Studio B" },
  { label: "Main Hall", value: "Main Hall" },
];

interface ProductionFormProps {
  productionIndex: number;
  control: any;
  users: BasicUser[];
}

export default function ProductionForm({
  productionIndex,
  control,
  users,
}: ProductionFormProps) {
  const producerUsers = users.filter((u) => (u as any).role !== "STAFF");

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 min-[601px]:grid-cols-2">
        <div className={fieldStackClassName}>
          <span className="ui-label m-0 block">Production Name</span>
          <Controller
            control={control}
            name={`productions.${productionIndex}.name`}
            rules={{ required: "Production name is required" }}
            render={({ field, fieldState }) => (
              <>
                <Input
                  {...field}
                  placeholder="Enter production name"
                  status={fieldState.error ? "error" : ""}
                />
                {fieldState.error && (
                  <span className="ui-note">{fieldState.error.message}</span>
                )}
              </>
            )}
          />
        </div>

        <div className={fieldStackClassName}>
          <span className="ui-label m-0 block">Location</span>
          <Controller
            control={control}
            name={`productions.${productionIndex}.location`}
            rules={{ required: "Location is required" }}
            render={({ field, fieldState }) => (
              <>
                <Select
                  {...field}
                  placeholder="Select location"
                  options={LOCATIONS}
                  allowClear
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

      <div>
        <Controller
          control={control}
          name={`productions.${productionIndex}.producers`}
          render={({ field }) => (
            <>
              <div className={sectionHeaderClassName}>
                <span className="ui-label m-0 block">Producers & Faculty</span>
                <div className={inlineActionsClassName}>
                  <Button
                    type="button"
                    onClick={() => field.onChange(producerUsers.map((u) => u.id))}
                  >
                    Select all
                  </Button>
                  <Button
                    type="button"
                    tone="danger"
                    onClick={() => field.onChange([])}
                  >
                    Unselect all
                  </Button>
                </div>
              </div>
              <Select
                {...field}
                mode="multiple"
                searchable
                maxTagCount={12}
                placeholder="Search and select users..."
                options={[
                  ...producerUsers,
                  ...users.filter(
                    (u) => (field.value ?? []).includes(u.id) && (u as any).role === "STAFF"
                  ),
                ]
                  .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
                  .map((u) => ({ value: u.id, label: u.name ?? "Unnamed User" }))}
              />
            </>
          )}
        />
      </div>

      <PresentationsField
        productionIndex={productionIndex}
        control={control}
        users={users}
      />
    </div>
  );
}
