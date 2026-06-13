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
  { id: 'clear', label: 'C', value: 'C', row: 0, col: 0, kind: 'clear' },
  { id: 'divide', label: '÷', value: '/', row: 0, col: 1, kind: 'operator' },
  { id: 'multiply', label: '×', value: '*', row: 0, col: 2, kind: 'operator' },
  { id: 'subtract', label: '−', value: '-', row: 0, col: 3, kind: 'operator' },
  { id: 'seven', label: '7', value: '7', row: 1, col: 0, kind: 'number' },
  { id: 'eight', label: '8', value: '8', row: 1, col: 1, kind: 'number' },
  { id: 'nine', label: '9', value: '9', row: 1, col: 2, kind: 'number' },
  { id: 'add', label: '+', value: '+', row: 1, col: 3, kind: 'operator', tall: true },
  { id: 'four', label: '4', value: '4', row: 2, col: 0, kind: 'number' },
  { id: 'five', label: '5', value: '5', row: 2, col: 1, kind: 'number' },
  { id: 'six', label: '6', value: '6', row: 2, col: 2, kind: 'number' },
  { id: 'one', label: '1', value: '1', row: 3, col: 0, kind: 'number' },
  { id: 'two', label: '2', value: '2', row: 3, col: 1, kind: 'number' },
  { id: 'three', label: '3', value: '3', row: 3, col: 2, kind: 'number' },
  { id: 'equals', label: '=', value: '=', row: 3, col: 3, kind: 'equals', tall: true },
  { id: 'zero', label: '0', value: '0', row: 4, col: 0, kind: 'number', span: 2 },
  { id: 'decimal', label: '.', value: '.', row: 4, col: 2, kind: 'number' },
];

const buttonById = new Map(buttons.map((button) => [button.id, button]));
const defaultTheme = themes.find((theme) => theme.id === 'rainforest') ?? themes[0];

export default function CalculatorGame() {
  const [calculator, setCalculator] = useState(initialCalculatorState);
  const [selectedCharacterId, setSelectedCharacterId] = useState(characters[0].id);
  const [selectedThemeId, setSelectedThemeId] = useState(defaultTheme.id);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [avatarButtonId, setAvatarButtonId] = useState('zero');
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

  const avatarButton = buttonById.get(avatarButtonId) ?? buttonById.get('zero');
  const avatarPosition = getButtonCenter(avatarButton);

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

  const moveAvatarTo = useCallback((button, nextDirection) => {
    setDirection(nextDirection);
    setAvatarButtonId(button.id);
    setIsWalking(true);
    soundRef.current.footstep();
    window.setTimeout(() => setIsWalking(false), 190);
  }, []);

  const jumpOnCurrentButton = useCallback(() => {
    const button = buttonById.get(avatarButtonId);

    if (!button) {
      return;
    }

    setHasStarted(true);
    setIsJumping(true);
    window.setTimeout(() => setIsJumping(false), 280);
    window.setTimeout(() => pressButton(button, 'avatar'), 130);
  }, [avatarButtonId, pressButton]);

  const handleMove = useCallback((deltaRow, deltaCol, nextDirection) => {
    if (!hasStarted) {
      setHasStarted(true);
    }

    const nextButton = getNextButton(avatarButton, deltaRow, deltaCol);

    if (!nextButton) {
      return;
    }

    moveAvatarTo(nextButton, nextDirection);
  }, [avatarButton, hasStarted, moveAvatarTo]);

  const handleDirectPress = useCallback((button) => {
    setHasStarted(true);
    setAvatarButtonId(button.id);
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
        isOpen={settingsOpen}
        onToggle={() => setSettingsOpen((current) => !current)}
        soundEnabled={soundEnabled}
        onSoundChange={setSoundEnabled}
        hasStarted={hasStarted}
        onStart={() => {
          setCalculator(initialCalculatorState());
          setAvatarButtonId('zero');
          setDirection('down');
          setHasStarted(true);
          setSettingsOpen(false);
        }}
      />

      <section className="calculator-stage" aria-label="GoatedCalc calculator game">
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
                    isAvatarHere={button.id === avatarButton.id}
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

function getButtonCenter(button) {
  return {
    col: button.col + ((button.span ?? 1) - 1) / 2,
    row: button.row + (button.tall ? 0.5 : 0),
  };
}

function getButtonBounds(button) {
  return {
    left: button.col,
    right: button.col + (button.span ?? 1) - 1,
    top: button.row,
    bottom: button.row + (button.tall ? 1 : 0),
  };
}

function rangesOverlap(firstStart, firstEnd, secondStart, secondEnd) {
  return Math.max(firstStart, secondStart) <= Math.min(firstEnd, secondEnd);
}

function getNextButton(currentButton, deltaRow, deltaCol) {
  const currentBounds = getButtonBounds(currentButton);
  const currentCenter = getButtonCenter(currentButton);
  const candidates = buttons.filter((button) => {
    if (button.id === currentButton.id) {
      return false;
    }

    const bounds = getButtonBounds(button);

    if (deltaRow < 0) {
      return bounds.bottom < currentBounds.top && rangesOverlap(bounds.left, bounds.right, currentBounds.left, currentBounds.right);
    }
    if (deltaRow > 0) {
      return bounds.top > currentBounds.bottom && rangesOverlap(bounds.left, bounds.right, currentBounds.left, currentBounds.right);
    }
    if (deltaCol < 0) {
      return bounds.right < currentBounds.left && rangesOverlap(bounds.top, bounds.bottom, currentBounds.top, currentBounds.bottom);
    }
    if (deltaCol > 0) {
      return bounds.left > currentBounds.right && rangesOverlap(bounds.top, bounds.bottom, currentBounds.top, currentBounds.bottom);
    }

    return false;
  });

  return candidates
    .map((button) => {
      const center = getButtonCenter(button);
      return {
        button,
        distance: Math.abs(center.row - currentCenter.row) + Math.abs(center.col - currentCenter.col),
      };
    })
    .sort((first, second) => first.distance - second.distance)[0]?.button ?? null;
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
