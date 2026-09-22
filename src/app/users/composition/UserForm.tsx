"use client";

// React & Next.js
import { useEffect, useState } from "react";

// Actions
import { UserInput } from "@/actions/schemas";

// Components
import { Input, TextArea } from "@/components/input";
import { Alert } from "@/components/alert";
import { Select } from "@/components/select";
import { Button } from "@/components/button";
import ModalPopup from "@/components/modal";
import { useModalCloseGuard } from "@/components/modal/CloseGuard";
import { FieldError, fieldLabelRowClassName } from "@/components/field-error";
import ConfirmDelete from "@/components/confirm-delete";
import { confirmDeleteDialogClassName } from "@/components/confirm-delete/styles";
import { useToast } from "@/components/toast";

// Composition
import { transformUserFromAPI } from "@/app/users/composition/user.transformers";
import ImageUpload from "@/app/users/composition/ImageUpload";
import RepeatableInput from "@/app/users/composition/RepeatableInput";

// Helpers
import { useForm, useWatch, Controller } from "react-hook-form";
import { handleFormAction } from "@/helpers";
import { formatSemesterCode, getCurrentSemesterCode, normalizeSemesterCode } from "@/components/domain/filters/semester-filter";
import { ROLES } from "@/constants/roles";

const fieldStackClassName = "flex min-w-0 flex-col gap-2";
const fieldLabelClassName = "ui-label m-0 block min-h-5 pl-1";
const userFieldLabelRowClassName = `${fieldLabelRowClassName} pl-1`;

function getSemesterNameOptions(currentValues: string[] = []) {
  const options = Array.from({ length: 100 }, (_, year) => {
    const shortYear = String(year).padStart(2, "0");
    return [
      { value: `SP${shortYear}`, label: `SP${shortYear}` },
      { value: `FA${shortYear}`, label: `FA${shortYear}` },
    ];
  }).flat();

  const extraOptions = currentValues
    .filter((value) => value && !options.some((option) => option.value === value))
    .map((value) => ({ value, label: value }));

  return [...extraOptions, ...options];
}

// Prefer whichever semester actually matches today over semesters[0]
// (newest by code) - production keeps future semesters pre-created for
// planning ahead, and those would otherwise always outrank the real
// current one as "newest".
function getDefaultSemester(semesters: any[]) {
  const currentCode = getCurrentSemesterCode();
  const currentSemester = semesters.find(
    (semester) => normalizeSemesterCode(semester.name) === currentCode,
  );
  return {
    id: currentSemester?.id ?? semesters[0]?.id ?? null,
    code: formatSemesterCode(currentSemester?.name) || currentCode,
  };
}

interface UserFormProps {
  onSubmit: (data: UserInput) => Promise<any>;
  onRemove?: (user: any) => void;
  user?: any;
  isCurrentUserAdmin?: boolean;
  allSemesters?: any[];
}

export default function UserForm({
  onSubmit,
  onRemove,
  user,
  isCurrentUserAdmin = false,
  allSemesters = [],
}: UserFormProps) {
  const defaultSemester = getDefaultSemester(allSemesters);
  const initialValues = transformUserFromAPI(user) || {
    name: "",
    pronouns: "",
    image: "/face.jpg",
    email: "",
    link: "",
    links: [""],
    about: "",
    role: ROLES.student,
    semesterIds: defaultSemester.id ? [defaultSemester.id] : [],
    semesterCodes: defaultSemester.code ? [defaultSemester.code] : [],
  };

  const {
    control,
    handleSubmit,
    trigger,
    formState: { isSubmitting, isDirty, isValid, isSubmitted },
  } = useForm<UserInput>({
    defaultValues: initialValues as any,
    mode: "onChange",
  });

  useEffect(() => {
    trigger();
  }, [trigger]);

  // A File instance means a new photo was picked this session (not yet
  // uploaded); a string means it's still whatever path the user already had.
  // The form's own type says "image" is always a string - it isn't, once
  // ImageUpload's onChange has fired - so this checks the runtime shape
  // instead of relying on that type holding up.
  const imageValue = useWatch({ control, name: "image" });
  const hasNewImage = typeof imageValue !== "string" && imageValue != null;

  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const semesterOptions = getSemesterNameOptions(initialValues.semesterCodes);
  const toast = useToast();

  const handleFormSubmit = async (data: UserInput) => {
    await handleFormAction(
      () => onSubmit(data),
      setError,
      "An error occurred while saving the user.",
      () => toast.success(user ? "Changes saved" : "User created"),
    );
  };

  useModalCloseGuard(isDirty && !isSubmitting, isValid, () => handleSubmit(handleFormSubmit)());

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="flex w-full flex-col gap-6">
        {error && (
          <Alert
            description={error}
            tone="danger"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        <div className="flex w-full flex-col gap-6">
          <div className={fieldStackClassName}>
            <span className={fieldLabelClassName}>
              Photo
            </span>
            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <ImageUpload
                  onChange={field.onChange}
                  currentImagePath={field.value}
                  isSubmitting={isSubmitting}
                />
              )}
            />
            <span className="ui-note mt-1 block text-[var(--subtle-text)]">
              {isCurrentUserAdmin
                ? <>You can upload high resolution photos up to 4MB.<br />They will be automatically downsized.</>
                : "Contact SIM faculty to change your photo."}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
            <div className={fieldStackClassName}>
              <Controller
                control={control}
                name="name"
                rules={{ required: "Name is required" }}
                render={({ field, fieldState }) => {
                  const showError = Boolean(fieldState.error) && (fieldState.isTouched || isSubmitted);
                  return (
                    <>
                      <div className={userFieldLabelRowClassName}>
                        <span className="ui-label m-0">Full Name *</span>
                        {showError && <FieldError>{fieldState.error!.message}</FieldError>}
                      </div>
                      <Input
                        {...field}
                        placeholder="Enter name"
                        status={showError ? "error" : ""}
                      />
                    </>
                  );
                }}
              />
            </div>

            <div className={fieldStackClassName}>
              <span className={fieldLabelClassName}>
                Pronouns
              </span>
              <Controller
                control={control}
                name="pronouns"
                render={({ field }) => (
                  <Input {...field} placeholder="E.g. they/them" />
                )}
              />
            </div>
          </div>

          {isCurrentUserAdmin && (
            <div className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 max-[600px]:grid-cols-1">
              <div className={fieldStackClassName}>
                <span className={fieldLabelClassName}>Role</span>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      inModal
                      {...field}
                      options={[
                        { value: ROLES.student, label: "Student" },
                        { value: ROLES.staff, label: "Staff" },
                        { value: ROLES.admin, label: "Admin" },
                      ]}
                    />
                  )}
                />
              </div>

              <div className={fieldStackClassName}>
                <span className={fieldLabelClassName}>
                  Semesters Enrolled
                </span>
                <Controller
                  control={control}
                  name="semesterCodes"
                  render={({ field }) => (
                    // A real multi-select, not a From/To range - a contiguous
                    // range can't represent a student taking a semester off
                    // and coming back, since it always fills in everything
                    // between the two endpoints.
                    <Select
                      inModal
                      mode="multiple"
                      value={field.value ?? []}
                      searchable
                      placeholder="Select semesters"
                      options={semesterOptions}
                      onChange={(value) => field.onChange(value)}
                      scrollToValueOnOpen={getCurrentSemesterCode()}
                    />
                  )}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 max-[600px]:w-full max-[600px]:grid-cols-1">
          <div className={fieldStackClassName}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
              render={({ field, fieldState }) => {
                const showError = Boolean(fieldState.error) && (fieldState.isTouched || isSubmitted);
                return (
                <>
                  <div className={userFieldLabelRowClassName}>
                    <span className="ui-label m-0">Email Address *</span>
                    {showError && (
                      <FieldError tone={fieldState.error!.type === "pattern" ? "warning" : "error"}>
                        {fieldState.error!.message}
                      </FieldError>
                    )}
                  </div>
                  <Input
                    {...field}
                    placeholder="email@example.com"
                    disabled={!isCurrentUserAdmin && user}
                    status={showError ? (fieldState.error!.type === "pattern" ? "warning" : "error") : ""}
                  />
                  {!isCurrentUserAdmin && user && (
                    <span className="ui-note mt-1 block">
                      Contact SIM faculty to change your email.
                    </span>
                  )}
                </>
                );
              }}
            />
          </div>

          <div className={fieldStackClassName}>
            <span className={fieldLabelClassName}>
              Contact & Links
            </span>
            <Controller
              control={control}
              name="links"
              render={({ field }) => (
                <RepeatableInput
                  id="user-links"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Phone, https://... or @handle"
                />
              )}
            />
          </div>
        </div>

        <div className={fieldStackClassName}>
          <span className={fieldLabelClassName}>
            About
          </span>
          <Controller
            control={control}
            name="about"
            render={({ field }) => (
              <TextArea
                {...field}
                rows={6}
                style={{ width: "100%" }}
                placeholder="Tell us about yourself..."
              />
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} tone="success" style={{ width: "100%" }}>
          {isSubmitting
            ? (hasNewImage ? "Loading image..." : "Saving...")
            : user ? "Save changes" : "Create user"}
        </Button>

        {user && isCurrentUserAdmin && onRemove && (
          <div
            className="overflow-hidden rounded-xl"
            style={{ backgroundColor: "var(--tone-danger-bg)" }}
          >
            <div className="px-4 py-2">
              <h4 className="m-0 text-[var(--tone-danger-text)]">
                Danger Zone
              </h4>
            </div>
            <div className="flex w-full flex-col gap-2 p-4">
              <p className="m-0">
                This permanently removes the data of this user from the database
                altogether. If you want to unlist this user from a semester but
                keep their data in the database, go to the admin dashboard and
                edit the semester instead.
              </p>
              <Button onClick={() => setIsDeleteModalOpen(true)} tone="danger">
                Permanently remove User {user.name}?
              </Button>
              <ModalPopup
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title={`Remove ${user.name}?`}
                dialogClassName={confirmDeleteDialogClassName}
              >
                <ConfirmDelete
                  itemName={user.name}
                  itemType="item"
                  onConfirm={() => onRemove(user)}
                  onConfirmed={() => setIsDeleteModalOpen(false)}
                />
              </ModalPopup>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
