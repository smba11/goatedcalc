const visualLabel = {
  '/': '÷',
  '*': '×',
  '-': '−',
};

export default function CalculatorButton({
  button,
  isAvatarHere,
  isPressed,
  onPress,
  onPointerEnter,
}) {
  const classes = [
    'calculator-button',
    `button-${button.kind}`,
    isAvatarHere ? 'avatar-here' : '',
    isPressed ? 'is-pressed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      type="button"
      style={{
        gridColumn: `${button.col + 1} / span ${button.span ?? 1}`,
        gridRow: `${button.row + 1} / span ${button.tall ? 2 : 1}`,
      }}
      onClick={onPress}
      onPointerEnter={onPointerEnter}
      aria-label={`Calculator button ${visualLabel[button.value] ?? button.label}`}
    >
      <span>{visualLabel[button.value] ?? button.label}</span>
    </button>
  );
}
