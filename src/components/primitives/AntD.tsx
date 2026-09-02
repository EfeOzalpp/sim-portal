"use client";

import {
	Switch as AntSwitch,
	Card as AntCard,
	DatePicker as AntDatePicker,
	Transfer as AntTransfer,
	Upload as AntUpload,
	Alert as AntAlert,
	Collapse as AntCollapse,
	Modal as AntModal,
	Divider as AntDivider,
	Table as AntTable,
	Checkbox as AntCheckbox,
	SwitchProps,
	CardProps,
	DatePickerProps,
	TransferProps,
	UploadProps,
	AlertProps,
	CollapseProps,
	ModalProps,
	DividerProps,
	TableProps,
	CheckboxProps,
} from "antd";
import { RangePickerProps } from "antd/es/date-picker";

// Button is gone — every consumer now uses the dependency-free
// src/components/button/button-component.tsx instead of antd's Button.
// Input/Select still live in ./AntD/*.tsx (see Input.tsx/Select.tsx),
// re-exported below so existing "@/components/primitives/AntD" imports
// keep working; import them directly wherever a route needs compile-time
// isolation from the rest of this barrel (Table/Transfer/DatePicker/
// Upload/Modal/etc).
export { Input, TextArea } from "@/components/primitives/AntD/Input";
export { Select } from "@/components/primitives/AntD/Select";

export function DatePicker(props: DatePickerProps) {
	return <AntDatePicker size="large" {...props} />;
}

export function RangePicker(props: RangePickerProps) {
	return <AntDatePicker.RangePicker size="large" {...props} />;
}

export function Switch(props: SwitchProps) {
	return <AntSwitch {...props} />;
}

export function Alert(props: AlertProps) {
	return <AntAlert {...props} />;
}

export function Collapse(props: CollapseProps) {
	return <AntCollapse {...props} />;
}

export function Card({ children, className, ...props }: CardProps) {
	return (
		<AntCard className={className} {...props}>
			{children}
		</AntCard>
	);
}

interface UserTransferProps extends Omit<TransferProps<any>, "dataSource" | "targetKeys" | "onChange"> {
	users: any[];
	selectedUserKeys: string[];
	setSelectedUserKeys: (keys: string[]) => void;
}

export function UserTransfer({ users, selectedUserKeys, setSelectedUserKeys, ...props }: UserTransferProps) {
	const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name));
	const usersWithKeys = sortedUsers.map((user) => ({
		...user,
		key: user.id,
	}));

	return (
		<AntTransfer
			{...props}
			dataSource={usersWithKeys}
			targetKeys={selectedUserKeys}
			onChange={setSelectedUserKeys as any}
			oneWay
			showSearch
			render={(item) => item.name}
		/>
	);
}

export function Upload(props: UploadProps) {
	return <AntUpload {...props} />;
}

export function Modal({ children, ...props }: ModalProps) {
	return (
		<AntModal
			{...props}
			okButtonProps={{
				...props.okButtonProps
			}}
			cancelButtonProps={{
				...props.cancelButtonProps
			}}
		>
			{children}
		</AntModal>
	);
}

export function Divider(props: DividerProps) {
	return <AntDivider style={{ borderColor: "var(--app-border)", borderWidth: "var(--app-border-width)", ...props.style }} {...props} />;
}

export function Table(props: TableProps<any>) {
	return (
		<AntTable
			{...props}
			pagination={false}
		/>
	);
}

export function Checkbox(props: CheckboxProps) {
	return <AntCheckbox {...props} />;
}

Checkbox.Group = AntCheckbox.Group;
