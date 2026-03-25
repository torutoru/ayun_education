const TEXT = {
  title: '실패했어요',
  description: '물이 넘쳐서 실패했어요.',
  confirm: '확인'
};

function BeakerFailDialog({ open, onConfirm }) {
  if (!open) {
    return null;
  }

  return (
    <div className="beaker-dialog-backdrop" role="presentation">
      <div className="beaker-dialog-card" role="dialog" aria-modal="true" aria-labelledby="beaker-fail-title">
        <strong id="beaker-fail-title" className="beaker-dialog-title">{TEXT.title}</strong>
        <p className="beaker-dialog-description">{TEXT.description}</p>
        <button type="button" className="submenu-button mint beaker-dialog-button" onClick={onConfirm}>
          <strong>{TEXT.confirm}</strong>
        </button>
      </div>
    </div>
  );
}

export default BeakerFailDialog;
