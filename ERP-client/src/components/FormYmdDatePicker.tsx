import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { parseFormYmd, toFormYmd } from '@/lib/dates'
import type { SxProps, Theme } from '@mui/material/styles'
import type { TextFieldProps } from '@mui/material/TextField'

export type FormYmdDatePickerProps = {
  label: string
  value: string
  onChange: (ymd: string) => void
  required?: boolean
  fullWidth?: boolean
  textFieldProps?: Partial<TextFieldProps>
  /** Extra slot pass-through for layout (e.g. `sx: { mt: 2 }`). */
  slotSx?: SxProps<Theme>
}

export function FormYmdDatePicker({
  label,
  value,
  onChange,
  required,
  fullWidth = true,
  textFieldProps,
  slotSx,
}: FormYmdDatePickerProps) {
  return (
    <DatePicker
      label={label}
      value={parseFormYmd(value)}
      onChange={(d) => onChange(toFormYmd(d))}
      slotProps={{
        textField: {
          fullWidth,
          required,
          InputLabelProps: { shrink: true },
          ...textFieldProps,
          sx: slotSx,
        },
      }}
    />
  )
}
