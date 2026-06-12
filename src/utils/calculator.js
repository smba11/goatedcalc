const MAX_DISPLAY_LENGTH = 14;

export function calculateNextState(state, input) {
  const { display, storedValue, operator, waitingForOperand } = state;

  if (input === 'C') {
    return initialCalculatorState();
  }

  if (input === '.') {
    if (waitingForOperand) {
      return { ...state, display: '0.', waitingForOperand: false };
    }

    if (display.includes('.')) {
      return state;
    }

    return { ...state, display: `${display}.` };
  }

  if (isDigit(input)) {
    if (waitingForOperand) {
      return { ...state, display: input, waitingForOperand: false };
    }

    const nextDisplay = display === '0' ? input : `${display}${input}`;
    return { ...state, display: trimDisplay(nextDisplay) };
  }

  if (isOperator(input)) {
    const inputValue = Number.parseFloat(display);

    if (operator && !waitingForOperand) {
      const result = applyOperator(storedValue, inputValue, operator);
      return {
        display: formatResult(result),
        storedValue: result,
        operator: input === '=' ? null : input,
        waitingForOperand: true,
      };
    }

    return {
      ...state,
      storedValue: storedValue ?? inputValue,
      operator: input === '=' ? null : input,
      waitingForOperand: true,
    };
  }

  return state;
}

export function initialCalculatorState() {
  return {
    display: '0',
    storedValue: null,
    operator: null,
    waitingForOperand: false,
  };
}

function isDigit(input) {
  return /^\d$/.test(input);
}

function isOperator(input) {
  return ['+', '-', '*', '/', '='].includes(input);
}

function applyOperator(left, right, operator) {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return right === 0 ? Number.NaN : left / right;
    default:
      return right;
  }
}

function formatResult(value) {
  if (!Number.isFinite(value)) {
    return 'Error';
  }

  const result = Number.isInteger(value) ? String(value) : String(Number(value.toPrecision(10)));
  return trimDisplay(result);
}

function trimDisplay(value) {
  if (value.length <= MAX_DISPLAY_LENGTH) {
    return value;
  }

  const number = Number.parseFloat(value);
  if (!Number.isFinite(number)) {
    return 'Error';
  }

  return number.toExponential(6);
}
