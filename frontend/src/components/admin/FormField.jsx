/**
 * Form validation utilities
 */

export const ValidationRules = {
  required: (value) => !value ? 'This field is required' : null,
  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? 'Please enter a valid email address' : null;
  },
  minLength: (min) => (value) => {
    if (!value) return null;
    return value.length < min ? `Minimum ${min} characters required` : null;
  },
  maxLength: (max) => (value) => {
    if (!value) return null;
    return value.length > max ? `Maximum ${max} characters allowed` : null;
  },
  number: (value) => {
    if (!value) return null;
    return isNaN(value) ? 'Please enter a valid number' : null;
  },
  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return !phoneRegex.test(value) ? 'Please enter a valid phone number' : null;
  },
  match: (fieldName, compareValue) => (value) => {
    return value !== compareValue ? `Must match ${fieldName}` : null;
  },
  custom: (validator) => validator
};

/**
 * Validate form fields
 * @param {Object} formData - Form data object
 * @param {Object} rules - Validation rules object { fieldName: [validators] }
 * @returns {Object} Errors object { fieldName: errorMessage }
 */
export function validateForm(formData, rules) {
  const errors = {};

  Object.entries(rules).forEach(([fieldName, validators]) => {
    const value = formData[fieldName];
    const validatorsArray = Array.isArray(validators) ? validators : [validators];

    for (let validator of validatorsArray) {
      const error = validator(value, formData);
      if (error) {
        errors[fieldName] = error;
        break;
      }
    }
  });

  return errors;
}

/**
 * Form field component with validation
 */
import PropTypes from 'prop-types';

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  disabled = false,
  required = false,
  options = [],
  rows,
  help
}) {
  const hasError = error && error[name];

  const inputClasses = `w-full rounded-lg border px-3 py-2 text-sm transition-all ${
    hasError
      ? 'border-red-500 focus:ring-2 focus:ring-red-500 dark:border-red-500'
      : 'border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-neutral-700 dark:focus:border-primary-500'
  } dark:bg-neutral-800 dark:text-white`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-neutral-900 dark:text-white">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}

      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={inputClasses}
        >
          <option value="">Select {label?.toLowerCase() || 'option'}</option>
          {options.map((opt) => (
            <option
              key={typeof opt === 'string' ? opt : opt.value}
              value={typeof opt === 'string' ? opt : opt.value}
            >
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows || 4}
          className={inputClasses}
        />
      ) : type === 'checkbox' ? (
        <label className="inline-flex items-center gap-2">
          <input
            id={name}
            type="checkbox"
            name={name}
            checked={value || false}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className="rounded border-neutral-300 dark:border-neutral-700"
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
        </label>
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClasses}
        />
      )}

      {hasError && (
        <p className="text-sm text-red-600 dark:text-red-400">{error[name]}</p>
      )}
      {help && !hasError && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{help}</p>
      )}
    </div>
  );
}

FormField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.object,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  options: PropTypes.array,
  rows: PropTypes.number,
  help: PropTypes.string
};
