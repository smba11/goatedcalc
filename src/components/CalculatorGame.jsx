import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Avatar from './Avatar.jsx';
import CalculatorButton from './CalculatorButton.jsx';
import CalculatorDisplay from './CalculatorDisplay.jsx';
import CharacterSelect from './CharacterSelect.jsx';
import { characters } from '../data/characters.js';
import { themes } from '../data/themes.js';
import { calculateNextState, initialCalculatorState } from '../utils/calculator.js';
import { createSoundController } from '../utils/sound.js';

const PRESS_COOLDOWN_MS = 360;

const buttons = [
  { label: 'C', value: 'C', row: 0, col: 0, kind: 'clear' },
  { label: '÷', value: '/', row: 0, col: 1, kind: 'operator' },
  { label: '×', value: '*', row: 0, col: 2, kind: 'operator' },
  { label: '−', value: '-', row: 0, col: 3, kind: 'operator' },
  { label: '7', value: '7', row: 1, col: 0, kind: 'number' },
  { label: '8', value: '8', row: 1, col: 1, kind: 'number' },
  { label: '9', value: '9', row: 1, col: 2, kind: 'number' },
  { label: '+', value: '+', row: 1, col: 3, kind: 'operator', tall: true },
  { label: '4', value: '4', row: 2, col: 0, kind: 'number' },
  { label: '5', value: '5', row: 2, col: 1, kind: 'number' },
  { label: '6', value: '6', row: 2, col: 2, kind: 'number' },
  { label: '1', value: '1', row: 3, col: 0, kind: 'number' },
  { label: '2', value: '2', row: 3, col: 1, kind: 'number' },
  { label: '3', value: '3', row: 3, col: 2, kind: 'number' },
  { label: '=', value: '=', row: 3, col: 3, kind: 'equals', tall: true },
  { label: '0', value: '0', row: 4, col: 0, kind: 'number', span: 2 },
  { label: '.', value: '.', row: 4, col: 2, kind: 'number' },
];

const buttonByPosition = new Map(buttons.flatMap((button) => {
  const positions = [[`${button.row}:${button.col}`, button]];
  if (button.span === 2) {
    positions.push([`${button.row}:${button.col + 1}`, button]);
  }
  return positions;
}));

export default function CalculatorGame() {
  const [calculator, setCalculator] = useState(initialCalculatorState);
  const [selectedCharacterId, setSelectedCharacterId] = useState(characters[0].id);
  const [selectedThemeId, setSelectedThemeId] = useState(themes[0].id);
  const [hasStarted, setHasStarted] = useState(false);
  const [avatarPosition, setAvatarPosition] = useState({ row: 4, col: 0 });
  const [direction, setDirection] = useState('down');
  const [isWalking, setIsWalking] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [pressedKey, setPressedKey] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const cooldownRef = useRef({ key: null, until: 0 });
  const soundRef = useRef(createSoundController());

  const selectedCharacter = useMemo(
    () => characters.find((character) => character.id === selectedCharacterId) ?? characters[0],
    [selectedCharacterId],
  );

  const selectedTheme = useMemo(
    () => themes.find((theme) => theme.id === selectedThemeId) ?? themes[0],
    [selectedThemeId],
  );

  useEffect(() => {
    soundRef.current.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const pressButton = useCallback((button, source = 'manual') => {
    const now = Date.now();
    const key = `${button.row}:${button.col}:${button.value}`;

    if (source === 'avatar' && cooldownRef.current.key === key && cooldownRef.current.until > now) {
      return;
    }

    cooldownRef.current = { key, until: now + PRESS_COOLDOWN_MS };
    setPressedKey(key);
    setCalculator((current) => calculateNextState(current, button.value));
    soundRef.current.buttonPress();
    window.setTimeout(() => setPressedKey((current) => (current === key ? null : current)), 220);
  }, []);

  const moveAvatarTo = useCallback((position, nextDirection) => {
    const button = buttonByPosition.get(`${position.row}:${position.col}`);

    if (!button) {
      return;
    }

    setDirection(nextDirection);
    setAvatarPosition({ row: button.row, col: button.col });
    setIsWalking(true);
    soundRef.current.footstep();
    window.setTimeout(() => setIsWalking(false), 190);
  }, []);

  const jumpOnCurrentButton = useCallback(() => {
    const button = buttonByPosition.get(`${avatarPosition.row}:${avatarPosition.col}`);

    if (!button) {
      return;
    }

    setHasStarted(true);
    setIsJumping(true);
    window.setTimeout(() => setIsJumping(false), 280);
    window.setTimeout(() => pressButton(button, 'avatar'), 130);
  }, [avatarPosition, pressButton]);

  const handleMove = useCallback((deltaRow, deltaCol, nextDirection) => {
    if (!hasStarted) {
      setHasStarted(true);
    }

    const nextPosition = {
      row: Math.max(0, Math.min(4, avatarPosition.row + deltaRow)),
      col: Math.max(0, Math.min(3, avatarPosition.col + deltaCol)),
    };

    if (!buttonByPosition.has(`${nextPosition.row}:${nextPosition.col}`)) {
      return;
    }

    moveAvatarTo(nextPosition, nextDirection);
  }, [avatarPosition, hasStarted, moveAvatarTo]);

  const handleDirectPress = useCallback((button) => {
    setHasStarted(true);
    setAvatarPosition({ row: button.row, col: button.col });
    setDirection('down');
    setIsJumping(true);
    window.setTimeout(() => setIsJumping(false), 280);
    pressButton(button, 'click');
  }, [pressButton]);

  useEffect(() => {
    function handleKeyDown(event) {
      const key = event.key.toLowerCase();

      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' ', 'enter'].includes(key)) {
        event.preventDefault();
      }

      const keyboardInput = key === 'enter' ? null : normalizeKeyboardInput(event.key);
      const keyboardButton = buttons.find((candidate) => candidate.value === keyboardInput);

      if (keyboardButton && key !== ' ') {
        handleDirectPress(keyboardButton);
      } else if (key === 'arrowup' || key === 'w') {
        handleMove(-1, 0, 'up');
      } else if (key === 'arrowdown' || key === 's') {
        handleMove(1, 0, 'down');
      } else if (key === 'arrowleft' || key === 'a') {
        handleMove(0, -1, 'left');
      } else if (key === 'arrowright' || key === 'd') {
        handleMove(0, 1, 'right');
      } else if (key === 'enter' || key === ' ') {
        jumpOnCurrentButton();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDirectPress, handleMove, jumpOnCurrentButton]);

  const expressionHint = calculator.operator ? `Ready for ${calculator.operator}` : 'Move, then Space/Enter';

  return (
    <main className={`game-shell theme-${selectedTheme.id}`}>
      <div className="ambient-light" aria-hidden="true" />
      <ThemeDecor themeId={selectedTheme.id} />
      <CharacterSelect
        selectedId={selectedCharacterId}
        selectedThemeId={selectedThemeId}
        onSelect={setSelectedCharacterId}
        onThemeSelect={setSelectedThemeId}
        hasStarted={hasStarted}
        onStart={() => {
          setCalculator(initialCalculatorState());
          setAvatarPosition({ row: 4, col: 0 });
          setDirection('down');
          setHasStarted(true);
        }}
      />

      <section className="calculator-stage" aria-label="GoatedCalc calculator game">
        <label className="sound-toggle">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(event) => setSoundEnabled(event.target.checked)}
          />
          <span>Sound</span>
        </label>
        <div className="calculator-body">
          <CalculatorDisplay value={calculator.display} expressionHint={expressionHint} />
          <div className="button-field">
            <div className="button-grid">
              {buttons.map((button) => {
                const key = `${button.row}:${button.col}:${button.value}`;
                return (
                  <CalculatorButton
                    key={key}
                    button={button}
                    isAvatarHere={button.row === avatarPosition.row && button.col === avatarPosition.col}
                    isPressed={pressedKey === key}
                    onPress={() => handleDirectPress(button)}
                    onPointerEnter={() => {}}
                  />
                );
              })}
            </div>
            <Avatar
              character={selectedCharacter}
              position={avatarPosition}
              direction={direction}
              isWalking={isWalking}
              isJumping={isJumping}
              isPressing={Boolean(pressedKey)}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function ThemeDecor({ themeId }) {
  return (
    <div className={`scene-decor scene-${themeId}`} aria-hidden="true">
      <span className="decor decor-1" />
      <span className="decor decor-2" />
      <span className="decor decor-3" />
      <span className="decor decor-4" />
      {themeId === 'rainforest' && (
        <span className="rain-layer">
          {Array.from({ length: 18 }, (_, index) => (
            <i key={index} style={{ '--drop-index': index }} />
          ))}
        </span>
      )}
      {themeId === 'starlight' && (
        <span className="star-layer">
          {Array.from({ length: 14 }, (_, index) => (
            <i key={index} style={{ '--star-index': index }} />
          ))}
        </span>
      )}
    </div>
  );
}

function normalizeKeyboardInput(key) {
  if (key === 'Escape' || key.toLowerCase() === 'c') {
    return 'C';
  }

  if (key === 'x') {
    return '*';
  }

  if (key === 'Enter') {
    return '=';
  }

  return key;
}
