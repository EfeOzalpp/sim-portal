import clsx from "clsx";
import Block from "@/components/primitives/Block";
import styles from "@/components/primitives/CloseButton.module.css";

interface CloseButtonProps {
  href: string;
  className?: string;
}

export default function CloseButton({ href, className }: CloseButtonProps) {
  return (
    <Block
      as="a"
      href={href}
      pressable
      aria-label="Close"
      className={clsx(styles.root, className)}
    >
      <span className={styles.icon} aria-hidden="true" />
    </Block>
  );
}
