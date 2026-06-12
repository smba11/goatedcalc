import { characters } from '../data/characters.js';

export default function CharacterSelect({ selectedId, onSelect, onStart, hasStarted }) {
  return (
    <aside className="character-select" aria-label="Character select">
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
      <button className="start-button" type="button" onClick={onStart}>
        {hasStarted ? 'Restart' : 'Start'}
      </button>
    </aside>
  );
}
