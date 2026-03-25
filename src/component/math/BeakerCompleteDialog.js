const TEXT = {
  title: '\uB05D\uB0AC\uC5B4\uC694',
  description: '\uBB3C\uC794 \uCC44\uC6B0\uAE30 \uBB38\uC81C 5\uAC1C\uB97C \uBAA8\uB450 \uB9DE\uD614\uC5B4\uC694.',
  confirm: '\uB2E4\uC2DC \uD558\uAE30'
};

function BeakerCompleteDialog({ open, onConfirm }) {
  if (!open) {
    return null;
  }

  return (
    <div className="beaker-dialog-backdrop" role="presentation">
      <div className="beaker-dialog-card" role="dialog" aria-modal="true" aria-labelledby="beaker-complete-title">
        <strong id="beaker-complete-title" className="beaker-dialog-title">{TEXT.title}</strong>
        <p className="beaker-dialog-description">{TEXT.description}</p>
        <button type="button" className="submenu-button mint beaker-dialog-button" onClick={onConfirm}>
          <strong>{TEXT.confirm}</strong>
        </button>
      </div>
    </div>
  );
}

export default BeakerCompleteDialog;
