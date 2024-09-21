import { CheckSquare, Loader2, Square, icons } from "lucide-react";
import { z } from "zod";
import {
  FieldError as RAFieldError,
  Checkbox as RACheckbox,
  CheckboxGroup as RACheckboxGroup,
  type CheckboxGroupProps as RACheckboxGroupProps,
  Label as RALabel,
  ComboBox as RAComboBox,
  Popover as RAPopover,
  ListBox as RAListBox,
  ListBoxItem as RAListBoxItem,
  Input as RAInput,
  type ComboBoxProps as RAComboBoxProps,
  type SelectProps as RASelectProps,
  Select as RASelect,
  type ValidationResult as RAValidationResult,
  Text as RAText,
  SelectValue as RASelectValue,
  type ListBoxProps,
} from "react-aria-components";
import { Button } from "./button";
import {
  Controller,
  type DefaultValues,
  type FieldValues,
  FormProvider,
  type SubmitHandler,
  type UseFormSetValue,
  useForm,
  useFormContext,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ComponentProps,
  type InputHTMLAttributes,
  forwardRef,
  useEffect,
} from "react";
import Icon from "./icon";
import { css, cva, cx, type RecipeVariantProps } from "../styled-system/css";
import { FieldError, Text } from "react-aria-components";

const ListBoxPopover = ({
  items,
}: {
  items: { label: string; value: string }[];
}) => (
  <RAPopover>
    <RAListBox
      className={css({
        bg: "background2",
        boxSizing: "border-box",
        w: "var(--trigger-width)",
        flex: 1,
        textStyle: "body",
        maxH: "500px",
        overflowY: "scroll",
        _focusVisible: {
          outline: "none",
          ringColor: "prometheus",
          ring: "2px solid",
        },
        scrollbar: "hidden",
      })}
    >
      {items.map((item) => (
        <RAListBoxItem
          key={item.value}
          id={item.value}
          className={css({
            p: 2,
            _focusVisible: { bg: "backgroundDim", outline: "none" },
            _hover: { bg: "backgroundDim" },
          })}
        >
          {item.label}
        </RAListBoxItem>
      ))}
    </RAListBox>
  </RAPopover>
);

export const Select = <T extends object>(
  props: RASelectProps<T> & {
    items: { label: string; value: string }[];
    buttonVariant?: ComponentProps<typeof Button>["variant"];
    buttonSize?: ComponentProps<typeof Button>["size"];
  }
) => {
  return (
    <RASelect
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: 2,
      })}
      {...props}
    >
      <Button
        variant={props.buttonVariant}
        size={props.buttonSize}
        className={css({
          minW: 40,
          justifyContent: "space-between",
          scrollbar: "hidden",
        })}
      >
        <RASelectValue />
        <Icon name="ChevronDown" />
      </Button>

      <ListBoxPopover items={props.items} />
    </RASelect>
  );
};

type SelectFieldProps<T extends object> = Omit<
  RASelectProps<T>,
  "children" | "items"
> & {
  label?: string;
  description?: string | null;
  errorMessage?: string | ((validation: RAValidationResult) => string);
  items: { label: string; value: string }[];
  name: string;
};

export function SelectField<T extends object>({
  label,
  description,
  errorMessage,
  items,
  name,
  ...props
}: SelectFieldProps<T>) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { name, value, onChange, onBlur, ref },
        fieldState: { invalid, error },
      }) => (
        <RASelect
          {...props}
          name={name}
          selectedKey={value}
          onSelectionChange={onChange}
          onBlur={onBlur}
          isRequired
          // Let React Hook Form handle validation instead of the browser.
          validationBehavior="aria"
          isInvalid={invalid}
          ref={ref}
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: 2,
          })}
        >
          <RALabel>{label}</RALabel>
          <Button
            variant="outline"
            className={css({
              h: 10,
              w: "full",
              justifyContent: "space-between",
            })}
          >
            <RASelectValue />
            <Icon name="ChevronDown" />
          </Button>
          {description && <Text slot="description">{description}</Text>}
          <RAFieldError
            className={css({
              color: "red",
            })}
          >
            {error?.message}
          </RAFieldError>
          <ListBoxPopover items={items} />
        </RASelect>
      )}
    />
  );
}

type ComboBoxProps<T extends object> = Omit<
  RAComboBoxProps<T>,
  "children" | "items"
> & {
  label?: string;
  description?: string | null;
  errorMessage?: string | ((validation: RAValidationResult) => string);
  items: { label: string; value: string }[];
};

export function ComboBox<T extends object>({
  label,
  description,
  errorMessage,
  items,
  ...props
}: ComboBoxProps<T>) {
  return (
    <RAComboBox {...props} menuTrigger="focus" shouldFocusWrap>
      <RALabel>{label}</RALabel>
      <Input className={css({ flex: 1 })} />
      {description && <RAText slot="description">{description}</RAText>}
      <FieldError>{errorMessage}</FieldError>
      <ListBoxPopover items={items} />
    </RAComboBox>
  );
}

type DeepNonNullable<T> = {
  [K in keyof T]: DeepNonNullable<NonNullable<T[K]>>;
};

type FormProps<TFormValues extends FieldValues> = {
  onSubmit: SubmitHandler<DeepNonNullable<TFormValues>>;
  onRevalidate?: () => void;
  validationSchema?: z.Schema<TFormValues, any>;
  defaultValues?: DefaultValues<TFormValues>;
  children: React.ReactNode;
};

export const Form = <TFormValues extends FieldValues>({
  onSubmit,
  validationSchema,
  defaultValues,
  children,
}: FormProps<TFormValues>) => {
  const methods = useForm<TFormValues>({
    defaultValues,
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
  });

  return (
    <FormProvider {...methods}>
      <form
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: 6,
        })}
        onSubmit={methods.handleSubmit(async (data, event) => {
          await onSubmit(data, event);
        })}
      >
        {children}
      </form>
    </FormProvider>
  );
};

export const inputStyle = cva({
  base: {
    bg: "background2",
    display: "flex",
    gap: "2",
    alignItems: "center",
    cursor: "default",
    _hover: {
      bg: "background2Dim",
    },
    width: "full",
    boxSizing: "border-box",
    _focusWithin: {
      outline: "none",
      ring: "2px solid",
      ringColor: "prometheus",
      ringOffset: "-2px",
      _hover: {
        bg: "background2Dim",
      },
    },
    _disabled: {
      opacity: 0.5,
    },
    transition: "all",
  },
  variants: {
    size: {
      default: {
        h: "10",
      },
      sm: {
        h: "8",
      },
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export type InputVariants = RecipeVariantProps<typeof inputStyle>;

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  InputVariants & { icon?: keyof typeof icons };

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size, className, icon, ...props }: InputProps, ref) => (
    <div className={inputStyle({ size })}>
      {icon ? <Icon name={icon} className={css({ h: "4" })} /> : null}
      <RAInput
        className={css({
          bg: "background2",
          _hover: {
            bg: "transparent",
          },
          color: "text",
          cursor: "default",
          px: 2,
          w: "full",
          h: "full",
          border: "none",
          boxSizing: "border-box",
          _focusVisible: {
            outline: "none",
          },
        })}
        {...props}
        ref={ref}
      />
    </div>
  )
);

type TextFieldProps<TFormValues extends FieldValues> = {
  name: string;
  label: string;
  description?: string;
  watch?: (params: {
    setValue: UseFormSetValue<TFormValues>;
    value: string;
  }) => void;
};

export const TextField = <TFormValues extends FieldValues>({
  name,
  label,
  description,
  watch,
}: TextFieldProps<TFormValues>) => {
  const {
    register,
    formState: { errors },
    ...methods
  } = useFormContext();

  useEffect(() => {
    if (watch) {
      const subscription = methods.watch((value, { name: watchName }) => {
        if (watchName === name) {
          watch({
            value: value[name],
            setValue: methods.setValue as UseFormSetValue<TFormValues>,
          });
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [methods.watch]);

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: 2,
      })}
    >
      <label className={css({ opacity: 0.9 })} htmlFor={name}>
        {label}
      </label>
      <Input id={name} {...register(name)} />
      {description ? (
        <span className={css({ textStyle: "caption", opacity: 0.8 })}>
          {description}
        </span>
      ) : null}
      {typeof errors[name]?.message === "string" && (
        <p className={css({ color: "red" })}>{`${errors[name]?.message}`}</p>
      )}
    </div>
  );
};

export const zodCheckboxGroupSchema = z
  .union([z.literal("production"), z.literal("development")])
  .array()
  .optional();

export const zodURLFriendlyIDSchema = z
  .string()
  .regex(/^[a-z0-9_\-\/]+$/, "Must be lowercase and URL friendly")
  .min(3, "Must be at least 3 characters long");

export function CheckboxOptions({
  label,
  name,
  items,
  ...props
}: Omit<RACheckboxGroupProps, "children" | "name"> & {
  name: string;
  items?: { label: string; value: string }[];
  label?: string;
}) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { name, value, onChange, onBlur, ref },
        fieldState: { invalid, error },
      }) => (
        <RACheckboxGroup
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          isRequired
          // Let React Hook Form handle validation instead of the browser.
          validationBehavior="aria"
          isInvalid={invalid}
          ref={ref}
          {...props}
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: 2,
          })}
        >
          <RALabel
            className={css({
              opacity: 0.9,
            })}
          >
            {label}
          </RALabel>
          <div
            className={css({
              display: "flex",
              gap: 4,
            })}
          >
            {items?.map((item) => (
              <RACheckbox
                key={item.value}
                value={item.value}
                className={cx(
                  css({
                    cursor: "default",
                    _hover: {
                      opacity: 0.8,
                    },
                    transition: "all",
                  }),
                  "group"
                )}
              >
                {({ isSelected }) => (
                  <div
                    className={css({
                      display: "flex",
                      gap: 2,
                    })}
                  >
                    {isSelected ? (
                      <CheckSquare
                        className={css({
                          _groupFocusVisible: {
                            ring: "2px solid",
                            ringColor: "prometheus",
                            ringOffset: "-2px",
                          },
                        })}
                      />
                    ) : (
                      <Square
                        className={css({
                          _groupFocusVisible: {
                            ring: "2px solid",
                            ringColor: "prometheus",
                            ringOffset: "-2px",
                          },
                        })}
                      />
                    )}
                    {item.label}
                  </div>
                )}
              </RACheckbox>
            ))}
          </div>
          <RAFieldError
            className={css({
              color: "red",
            })}
          >
            {error?.message}
          </RAFieldError>
        </RACheckboxGroup>
      )}
    />
  );
}

export const SubmitButton = ({
  children,
  ...props
}: ComponentProps<typeof Button>) => {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <Button
      className={css({
        textStyle: "body",
        w: "full",
        _disabled: {
          opacity: 0.5,
        },
      })}
      type="submit"
      isDisabled={isSubmitting}
      {...props}
    >
      {isSubmitting ? (
        <Loader2 className={css({ animation: "spin" })} />
      ) : (
        children
      )}
    </Button>
  );
};
