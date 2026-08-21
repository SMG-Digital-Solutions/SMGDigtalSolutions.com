/**
 * Shared labeled text input / textarea for the site's two lead-capture
 * forms (ContactForm, BookingDrawer). Centralizing the markup keeps their
 * styling and behavior in sync — previously each form hand-rolled its own
 * copy of this input, which had quietly drifted out of sync (one had
 * `font-normal` on its textarea, the other didn't).
 *
 * The label wraps the control (implicit `<label>` association), which is
 * valid per the HTML spec and needs no manual `id`/`htmlFor` bookkeeping.
 */

const FIELD_CLASSES =
  'mt-2 w-full border border-black/10 bg-white px-4 py-3 text-sm font-normal text-[#121212] outline-none transition focus:border-[#008C9E] focus:ring-2 focus:ring-[#008C9E]/20 dark:border-white/10 dark:bg-[#122238] dark:text-[#F7F7F7] disabled:opacity-50';

const LABEL_CLASSES = 'block text-sm font-semibold text-[#121212] dark:text-[#F7F7F7]';

interface FormFieldSharedProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

interface TextFieldProps extends FormFieldSharedProps {
  multiline?: false;
  type?: 'text' | 'email' | 'tel';
}

interface TextAreaFieldProps extends FormFieldSharedProps {
  multiline: true;
  rows?: number;
}

type FormFieldProps = TextFieldProps | TextAreaFieldProps;

export default function FormField(props: FormFieldProps) {
  const { label, name, value, onChange, required, disabled, placeholder, className = '' } = props;

  if (props.multiline) {
    return (
      <label className={`flex flex-1 flex-col ${LABEL_CLASSES} ${className}`}>
        {label}
        <textarea
          name={name}
          rows={props.rows ?? 5}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`${FIELD_CLASSES} flex-1 rounded-[1.5rem]`}
        />
      </label>
    );
  }

  return (
    <label className={`block ${LABEL_CLASSES} ${className}`}>
      {label}
      <input
        type={props.type ?? 'text'}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`${FIELD_CLASSES} rounded-3xl`}
      />
    </label>
  );
}
