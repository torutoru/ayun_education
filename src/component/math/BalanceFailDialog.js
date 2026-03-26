const TEXT = {
  title: '저울이 맞지 않아요',
  description: '추가한 돌의 무게가 목표와 다르네요. 다시 골라보세요.',
  confirm: '확인'
};

function BalanceFailDialog({ open, onConfirm }) {
  if (!open) {
    return null;
  }

  return (
    <div className="beaker-dialog-backdrop" role="presentation">
      <div className="beaker-dialog-card" role="dialog" aria-modal="true" aria-labelledby="balance-fail-title">
        <strong id="balance-fail-title" className="beaker-dialog-title">{TEXT.title}</strong>
        <p className="beaker-dialog-description">{TEXT.description}</p>
        <button type="button" className="submenu-button mint beaker-dialog-button" onClick={onConfirm}>
          <strong>{TEXT.confirm}</strong>
        </button>
      </div>
    </div>
  );
}

export default BalanceFailDialog;
