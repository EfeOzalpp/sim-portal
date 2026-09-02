import { Select as AntSelect, SelectProps } from "antd";
import { forwardRef } from "react";

// Split out of the AntD.tsx barrel — see Button.tsx for why.
export const Select = forwardRef<any, SelectProps>(function Select({ suffixIcon, allowClear, ...props }, ref) {
	const finalAllowClear = allowClear
		? {
			clearIcon: <span className="input-theme-icon input-select-clear-icon" aria-hidden="true" />,
			...(typeof allowClear === "object" ? allowClear : {}),
		}
		: allowClear;

	return (
		<AntSelect
			ref={ref}
			size="large"
			allowClear={finalAllowClear}
			suffixIcon={suffixIcon ?? (
				<span className="input-select-arrow" aria-hidden="true">
					<span className="input-theme-icon input-select-arrow-down" />
					<span className="input-theme-icon input-select-arrow-up" />
				</span>
			)}
			{...props}
		/>
	);
});
