export default function Avatar({ character, position, direction, isWalking, isPressing }) {
  const style = {
    '--avatar-x': position.col,
    '--avatar-y': position.row,
    '--avatar-body': character.palette.body,
    '--avatar-belly': character.palette.belly,
    '--avatar-accent': character.palette.accent,
    '--avatar-cheek': character.palette.cheek,
  };

  return (
    <div
      className={[
        'avatar',
        `facing-${direction}`,
        isWalking ? 'is-walking' : '',
        isPressing ? 'is-pressing' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      aria-label={`${character.name} standing on the calculator`}
    >
      <div className="avatar-shadow" />
      <div className="avatar-sprite" aria-hidden="true">
        <span className="ear ear-left" />
        <span className="ear ear-right" />
        <span className="face">
          <i className="eye eye-left" />
          <i className="eye eye-right" />
          <i className="mouth" />
          <i className="cheek cheek-left" />
          <i className="cheek cheek-right" />
        </span>
        <span className="belly" />
        <span className="foot foot-left" />
        <span className="foot foot-right" />
      </div>
    </div>
  );
}
