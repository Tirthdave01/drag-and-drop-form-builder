/**
 * Evaluates whether a field's conditional visibility rule is satisfied
 */
function isFieldVisible(field, answers) {
  if (!field.condition || !field.condition.fieldId) {
    return true; // No condition, always visible
  }

  const parentAnswer = answers[field.condition.fieldId];
  const targetValue = field.condition.value;
  const operator = field.condition.operator || 'equals';

  if (parentAnswer === undefined || parentAnswer === null) {
    return false;
  }

  switch (operator) {
    case 'equals':
      return String(parentAnswer).trim().toLowerCase() === String(targetValue).trim().toLowerCase();
    case 'notEquals':
      return String(parentAnswer).trim().toLowerCase() !== String(targetValue).trim().toLowerCase();
    case 'contains':
      if (Array.isArray(parentAnswer)) {
        return parentAnswer.some(item => String(item).toLowerCase() === String(targetValue).toLowerCase());
      }
      return String(parentAnswer).toLowerCase().includes(String(targetValue).toLowerCase());
    case 'isNotEmpty':
      return String(parentAnswer).trim().length > 0;
    default:
      return true;
  }
}

/**
 * Validates submitted answers against form fields schema
 */
function validateAnswers(fields, answers) {
  const errors = {};
  const cleanedAnswers = {};

  for (const field of fields) {
    const { id, type, label, required, options = [], min, max, minLength, maxLength } = field;
    const value = answers[id];

    // Check conditional visibility
    if (!isFieldVisible(field, answers)) {
      // Field was hidden; skip validation and don't store bogus answers
      continue;
    }

    // Check required
    const isEmpty = value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0);
    
    if (required && isEmpty) {
      errors[id] = `${label || 'This field'} is required.`;
      continue;
    }

    // If empty and not required, we can allow it
    if (isEmpty) {
      cleanedAnswers[id] = value ?? '';
      continue;
    }

    // Type-specific validations
    switch (type) {
      case 'text':
      case 'longtext':
        if (typeof value !== 'string') {
          errors[id] = `${label} must be text.`;
        } else {
          if (minLength && value.length < Number(minLength)) {
            errors[id] = `${label} must be at least ${minLength} characters.`;
          }
          if (maxLength && value.length > Number(maxLength)) {
            errors[id] = `${label} must not exceed ${maxLength} characters.`;
          }
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof value !== 'string' || !emailRegex.test(value.trim())) {
          errors[id] = `Please provide a valid email address.`;
        }
        break;

      case 'number':
        const numVal = Number(value);
        if (isNaN(numVal) || !Number.isFinite(numVal)) {
          errors[id] = `${label} must be a valid number.`;
        } else {
          if (min !== undefined && min !== '' && numVal < Number(min)) {
            errors[id] = `${label} cannot be less than ${min}.`;
          }
          if (max !== undefined && max !== '' && numVal > Number(max)) {
            errors[id] = `${label} cannot be greater than ${max}.`;
          }
        }
        break;

      case 'dropdown':
      case 'radio':
        if (options && options.length > 0) {
          const optionValues = options.map(opt => typeof opt === 'object' ? opt.value : opt);
          if (!optionValues.includes(value)) {
            errors[id] = `Please select a valid option from the list.`;
          }
        }
        break;

      case 'checkbox':
        if (Array.isArray(value)) {
          if (options && options.length > 0) {
            const optionValues = options.map(opt => typeof opt === 'object' ? opt.value : opt);
            const invalid = value.some(v => !optionValues.includes(v));
            if (invalid) {
              errors[id] = `One or more selected options are invalid.`;
            }
          }
        } else if (typeof value !== 'boolean' && typeof value !== 'string') {
          errors[id] = `${label} contains invalid selection.`;
        }
        break;

      case 'date':
        const parsedDate = Date.parse(value);
        if (isNaN(parsedDate)) {
          errors[id] = `Please provide a valid date.`;
        }
        break;

      default:
        break;
    }

    cleanedAnswers[id] = value;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cleanedAnswers
  };
}

module.exports = {
  validateAnswers,
  isFieldVisible
};
