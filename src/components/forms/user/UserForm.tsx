"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Space, Typography } from "antd";
import {
  Input,
  TextArea,
  Select,
  Card,
  Button,
  Alert,
} from "@/components/primitives/AntD";
import { transformUserFromAPI } from "@/components/forms/user/user.transformers";
import ImageUpload from "@/components/primitives/ImageUpload";
import DeleteButton from "@/components/modals/DeleteButton";
import RepeatableInput from "@/components/primitives/RepeatableInput";
import { handleFormAction } from "@/helpers";
import { UserInput } from "@/components/forms/schemas";

const { Text, Title } = Typography;

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

function formatSemesterCode(name?: string | null) {
  if (!name) return "";

  const code = name.match(/^(SP|FA)\d{2}$/i);
  if (code) return name.toUpperCase();

  const namedSemester = name.match(/^(Spring|Fall)\s+(\d{4})$/i);
  if (namedSemester) {
    const term = namedSemester[1].toLowerCase() === "spring" ? "SP" : "FA";
    return `${term}${namedSemester[2].slice(-2)}`;
  }

  return name;
}

function getCurrentSemesterYearValue() {
  return `SP${String(new Date().getFullYear()).slice(-2)}`;
}

function getSemesterNameIndex(value?: string) {
  const match = value?.match(/^(SP|FA)(\d{2})$/i);
  if (!match) return 0;

  const termOffset = match[1].toUpperCase() === "FA" ? 1 : 0;
  return Number(match[2]) * 2 + termOffset;
}

function getDefaultSemesterCode(semesters: any[]) {
  return formatSemesterCode(semesters[0]?.name) || getCurrentSemesterYearValue();
}

function getRangeEndpoints(selectedCodes: string[] = []) {
  const selectedIndexes = selectedCodes
    .map((code) => getSemesterNameIndex(code))
    .filter((index) => index >= 0);

  if (selectedIndexes.length === 0) {
    return { startCode: undefined, endCode: undefined };
  }

  const options = getSemesterNameOptions();
  return {
    startCode: options[Math.min(...selectedIndexes)]?.value,
    endCode: options[Math.max(...selectedIndexes)]?.value,
  };
}

function getSemesterCodesInRange(startCode: string | undefined, endCode: string | undefined) {
  if (!startCode && !endCode) return [];
  if (!startCode) return [endCode!];
  if (!endCode) return [startCode];

  const startIndex = getSemesterNameIndex(startCode);
  const endIndex = getSemesterNameIndex(endCode);
  const firstIndex = Math.min(startIndex, endIndex);
  const lastIndex = Math.max(startIndex, endIndex);

  return getSemesterNameOptions()
    .slice(firstIndex, lastIndex + 1)
    .map((option) => option.value);
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
  const defaultSemesterCode = getDefaultSemesterCode(allSemesters);
  const initialValues = transformUserFromAPI(user) || {
    name: "",
    pronouns: "",
    image: "/face.jpg",
    email: "",
    link: "",
    links: [""],
    about: "",
    role: "STUDENT",
    semesterIds: allSemesters.length > 0 ? [allSemesters[0].id] : [],
    semesterCodes: defaultSemesterCode ? [defaultSemesterCode] : [],
  };

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UserInput>({
    defaultValues: initialValues as any,
  });

  const [error, setError] = useState<string | null>(null);
  const semesterOptions = getSemesterNameOptions(initialValues.semesterCodes);

  const handleFormSubmit = async (data: UserInput) => {
    await handleFormAction(
      () => onSubmit(data),
      setError,
      "An error occurred while saving the user.",
    );
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        {error && (
          <Alert
            description={error}
            type="error"
            showIcon
            closable
          />
        )}

        <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <span className="ui-label mb-[var(--spacing-sm)] block">
              Photo
            </span>
            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <ImageUpload
                  onChange={field.onChange}
                  currentImagePath={field.value}
                />
              )}
            />
            <span className="ui-note mt-[calc(var(--spacing-sm)/2)] block">
              {isCurrentUserAdmin
                ? <>You can upload high resolution photos up to 8MB.<br />They will be automatically downsized.</>
                : "Contact SIM faculty to change your photo."}
            </span>
          </div>

          {isCurrentUserAdmin && (
            <div className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 max-[600px]:grid-cols-1">
              <div className="min-w-0 [&_.ant-select]:min-w-0 [&_.ant-select]:w-full">
                <span className="ui-label mb-[var(--spacing-sm)] block">
                  Semesters Enrolled
                </span>
                <Controller
                  control={control}
                  name="semesterCodes"
                  render={({ field }) => {
                    const { startCode, endCode } = getRangeEndpoints(field.value);

                    return (
                      <div className="grid w-full grid-cols-[minmax(0,1fr)_min-content_minmax(0,1fr)] items-center gap-x-4 [&_.ant-select]:min-w-0 [&_.ant-select]:w-full">
                        <Select
                          value={startCode}
                          placeholder="From"
                          showSearch
                          options={semesterOptions}
                          onChange={(value) => {
                            field.onChange(
                              getSemesterCodesInRange(
                                value as string | undefined,
                                endCode,
                              ),
                            );
                          }}
                        />
                        <span className="justify-self-center whitespace-nowrap text-[0.9rem] leading-none font-bold text-[var(--app-muted)]">to</span>
                        <Select
                          value={endCode}
                          placeholder="To"
                          showSearch
                          options={semesterOptions}
                          onChange={(value) => {
                            field.onChange(
                              getSemesterCodesInRange(
                                startCode,
                                value as string | undefined,
                              ),
                            );
                          }}
                        />
                      </div>
                    );
                  }}
                />
              </div>

              <div className="min-w-0 [&_.ant-select]:min-w-0 [&_.ant-select]:w-full">
                <span className="ui-label mb-[var(--spacing-sm)] block">Role</span>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <Select
                      {...field}
                      style={{ width: "100%" }}
                      options={[
                        { value: "STUDENT", label: "Student" },
                        { value: "STAFF", label: "Staff" },
                        { value: "ADMIN", label: "Admin" },
                      ]}
                    />
                  )}
                />
              </div>
            </div>
          )}
        </Space>

        <div className="grid grid-cols-2 gap-4 max-[600px]:w-full max-[600px]:grid-cols-1">
          <div>
            <span className="ui-label mb-[var(--spacing-sm)] block">
              Full Name
            </span>
            <Controller
              control={control}
              name="name"
              rules={{ required: "Name is required" }}
              render={({ field, fieldState }) => (
                <>
                  <Input
                    {...field}
                    placeholder="Enter name"
                    status={fieldState.error ? "error" : ""}
                  />
                  {fieldState.error && (
                    <Text type="danger">{fieldState.error.message}</Text>
                  )}
                </>
              )}
            />
          </div>

          <div>
            <span className="ui-label mb-[var(--spacing-sm)] block">
              Pronouns
            </span>
            <Controller
              control={control}
              name="pronouns"
              render={({ field }) => (
                <Input {...field} placeholder="e.g. they/them" />
              )}
            />
          </div>

          <div>
            <span className="ui-label mb-[var(--spacing-sm)] block">
              Email Address
            </span>
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
              render={({ field, fieldState }) => (
                <>
                  <Input
                    {...field}
                    placeholder="email@example.com"
                    disabled={!isCurrentUserAdmin && user}
                    status={fieldState.error ? "error" : ""}
                  />
                  {!isCurrentUserAdmin && user && (
                    <span className="ui-note mt-[calc(var(--spacing-sm)/2)] block">
                      Contact SIM faculty to change your email.
                    </span>
                  )}
                  {fieldState.error && (
                    <Text type="danger">{fieldState.error.message}</Text>
                  )}
                </>
              )}
            />
          </div>

          <div>
            <span className="ui-label mb-[var(--spacing-sm)] block">
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
            <span className="ui-note mt-[calc(var(--spacing-sm)/2)] block">
              Phone number, social media, gallery of your presentations, handles, etc.
            </span>
          </div>
        </div>

        <div className="w-full">
          <span className="ui-label mb-[var(--spacing-sm)] block">
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

        <Button type="submit" disabled={isSubmitting} className="accept-button" style={{ width: "100%" }}>
          {isSubmitting ? "Saving..." : user ? "Save Changes" : "Create User"}
        </Button>

        {user && isCurrentUserAdmin && onRemove && (
          <Card
            title={
              <Title level={4} type="danger" style={{ margin: 0 }}>
                Danger Zone
              </Title>
            }
            style={{ borderColor: "#ffa39e", backgroundColor: "#fff2f0" }}
          >
            <Space orientation="vertical" style={{ width: "100%" }}>
              <Text>
                This permanently removes the data of this user from the database
                altogether. If you want to unlist this user from a semester but
                keep their data in the database, go to the admin dashboard and
                edit the semester instead.
              </Text>
              <DeleteButton
                itemName={user.name + "?"}
                buttonText="Permanently remove User"
                onConfirm={() => onRemove(user)}
              />
            </Space>
          </Card>
        )}
      </Space>
    </form>
  );
}
