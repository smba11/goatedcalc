import { characters } from '../data/characters.js';
import { themes } from '../data/themes.js';

export default function CharacterSelect({
  selectedId,
  selectedThemeId,
  onSelect,
  onThemeSelect,
  onStart,
  hasStarted,
}) {
  return (
    <aside className="settings-panel" aria-label="Game settings">
      <div>
        <h1>GoatedCalc</h1>
        <p>Choose your buddy</p>
      </div>
      <div className="character-options">
        {characters.map((character) => (
          <button
            className={character.id === selectedId ? 'character-card selected' : 'character-card'}
            key={character.id}
            type="button"
            onClick={() => onSelect(character.id)}
            aria-pressed={character.id === selectedId}
          >
            <span
              className="character-mini"
              style={{
                '--avatar-body': character.palette.body,
                '--avatar-belly': character.palette.belly,
                '--avatar-accent': character.palette.accent,
                '--avatar-cheek': character.palette.cheek,
              }}
            >
              <i />
            </span>
            <span>{character.name}</span>
          </button>
        ))}
      </div>
      <div className="theme-settings">
        <p>Aesthetic</p>
        <div className="theme-options">
          {themes.map((theme) => (
            <button
              className={theme.id === selectedThemeId ? 'theme-card selected' : 'theme-card'}
              key={theme.id}
              type="button"
              onClick={() => onThemeSelect(theme.id)}
              aria-pressed={theme.id === selectedThemeId}
            >
              <span className={`theme-swatch swatch-${theme.id}`} aria-hidden="true" />
              <span>
                <strong>{theme.name}</strong>
                <small>{theme.description}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
      <button className="start-button" type="button" onClick={onStart}>
        {hasStarted ? 'Restart' : 'Start'}
      </button>
    </aside>
  );
}
