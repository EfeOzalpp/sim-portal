import { Input as AntInput, InputProps } from "antd";

// Split out of the AntD.tsx barrel — see Button.tsx for why.
export function Input(props: InputProps) {
	return <AntInput size="large" {...props} />;
}

export function TextArea(props: any) {
	return <AntInput.TextArea size="large" {...props} />;
}
