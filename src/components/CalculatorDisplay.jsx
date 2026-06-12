export default function CalculatorDisplay({ value, expressionHint }) {
  return (
    <section className="calculator-display" aria-label="Calculator display">
      <span className="display-brand">GoatedCalc</span>
      <output className="display-value" aria-live="polite">
        {value}
      </output>
      <span className="display-hint">{expressionHint}</span>
    </section>
  );
}
