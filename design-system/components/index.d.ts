import * as React from "react";

/** Icon asset URL from the system's Icons group, painted in currentColor. */
export interface IconProps { src: string; size?: "md" | "sm"; className?: string; style?: React.CSSProperties; }
export declare function Icon(props: IconProps): React.ReactElement | null;

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Default "primary". */
  variant?: "primary" | "secondary" | "tertiary" | "ghost" | "destructive" | "destructive-ghost";
  /** "lg" = 56px (default), "sm" = 36px. */
  size?: "lg" | "sm";
  /** Shows a spinner in place of iconStart, disables, sets aria-busy. */
  loading?: boolean;
  /** Icon asset URL before the label. */
  iconStart?: string;
  /** Icon asset URL after the label. */
  iconEnd?: string;
  /** Full width. */
  block?: boolean;
  /** Force the pressed look (documentation only). */
  pressed?: boolean;
  children: React.ReactNode;
}
export declare function Button(props: ButtonProps): React.ReactElement;

export interface TextFieldProps {
  id?: string;
  label?: React.ReactNode;
  /** "above" (default) or "inside" the box. */
  labelPosition?: "above" | "inside";
  required?: boolean;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  type?: string;
  /** Read-only row that opens a picker. */
  select?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  subtitle?: React.ReactNode;
  trailingText?: React.ReactNode;
  trailingIcon?: string;
  helper?: React.ReactNode;
  helperTone?: "info" | "success" | "error" | "pending";
  helperIcon?: string;
  /** Right-aligned text under the box (counter, subtitle). */
  meta?: React.ReactNode;
}
export declare function TextField(props: TextFieldProps): React.ReactElement;

export interface ToastProps {
  tone?: "success" | "failed" | "pending" | "neutral";
  icon?: string;
  closeIcon?: string;
  onClose?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}
export declare function Toast(props: ToastProps): React.ReactElement;

export interface ChoiceItem { value: string; label: React.ReactNode; icon?: string; }
export interface TabsProps { items: ChoiceItem[]; value?: string; defaultValue?: string; onChange?: (value: string) => void; }
export declare function Tabs(props: TabsProps): React.ReactElement;
export interface SegmentedControlProps extends TabsProps { ariaLabel?: string; }
export declare function SegmentedControl(props: SegmentedControlProps): React.ReactElement;

export interface BottomNavItem { value: string; label: React.ReactNode; icon: string; activeIcon?: string; /** The raised gradient action (Scan). */ center?: boolean; }
export interface BottomNavProps { items: BottomNavItem[]; value?: string; defaultValue?: string; onChange?: (value: string) => void; ariaLabel?: string; }
export declare function BottomNav(props: BottomNavProps): React.ReactElement;

export interface ReviewCardProps {
  name: React.ReactNode; handle?: React.ReactNode; avatar?: string;
  rating?: number; starIcon?: string; tag?: React.ReactNode; date?: React.ReactNode;
  children: React.ReactNode;
}
export declare function ReviewCard(props: ReviewCardProps): React.ReactElement;

export interface DialogProps {
  title: React.ReactNode; children?: React.ReactNode;
  cancelLabel?: string; cancelTone?: "default" | "danger"; onCancel?: () => void;
  confirmLabel?: string; onConfirm?: () => void;
}
export declare function Dialog(props: DialogProps): React.ReactElement;
