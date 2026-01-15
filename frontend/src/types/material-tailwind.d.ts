import * as React from "react";
import "@material-tailwind/react";

// 1. Tipagem auxiliar para tudo que o React 18/Next.js pede e a lib esqueceu
interface GenericMissingProps {
  placeholder?: any;
  onPointerEnterCapture?: any;
  onPointerLeaveCapture?: any;
  crossOrigin?: any;
  onResize?: any;
  onResizeCapture?: any;
}

declare module "@material-tailwind/react" {
  // 2. Injetamos essas props em TODOS os componentes principais
  export interface DialogProps extends GenericMissingProps {}
  export interface DialogHeaderProps extends GenericMissingProps {}
  export interface DialogBodyProps extends GenericMissingProps {}
  export interface DialogFooterProps extends GenericMissingProps {}
  
  export interface ButtonProps extends GenericMissingProps {}
  export interface IconButtonProps extends GenericMissingProps {}
  export interface InputProps extends GenericMissingProps {}
  export interface SelectProps extends GenericMissingProps {}
  export interface OptionProps extends GenericMissingProps {}
  
  export interface CardProps extends GenericMissingProps {}
  export interface CardBodyProps extends GenericMissingProps {}
  export interface CardHeaderProps extends GenericMissingProps {}
  export interface CardFooterProps extends GenericMissingProps {}
  
  export interface NavbarProps extends GenericMissingProps {}
  export interface TypographyProps extends GenericMissingProps {}
  export interface ChipProps extends GenericMissingProps {}
  export interface CheckboxProps extends GenericMissingProps {}
  export interface SwitchProps extends GenericMissingProps {}

  export interface ListProps extends GenericMissingProps {}
  export interface ListItemProps extends GenericMissingProps {}
  export interface ListItemPrefixProps extends GenericMissingProps {}
  export interface ListItemSuffixProps extends GenericMissingProps {}

  export interface SpinnerProps extends GenericMissingProps {}
  export interface AvatarProps extends GenericMissingProps {}
  export interface AlertProps extends GenericMissingProps {}
  export interface BadgeProps extends GenericMissingProps {}

  export interface MenuProps extends GenericMissingProps {}
  export interface MenuHandlerProps extends GenericMissingProps {}
  export interface MenuListProps extends GenericMissingProps {}
  export interface MenuItemProps extends GenericMissingProps {}

  export interface ProgressProps extends GenericMissingProps {}
  export interface TextareaProps extends GenericMissingProps {}
}