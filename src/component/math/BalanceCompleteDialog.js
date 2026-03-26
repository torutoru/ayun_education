const TEXT = {
  title: '끝났어요',
  description: '양팔 저울 문제 5개를 모두 맞혔어요.',
  confirm: '다시 하기'
};

function BalanceCompleteDialog({ open, onConfirm }) {
  if (!open) {
    return null;
  }

  return (
    <div className="beaker-dialog-backdrop" role="presentation">
      <div className="beaker-dialog-card" role="dialog" aria-modal="true" aria-labelledby="balance-complete-title">
        <strong id="balance-complete-title" className="beaker-dialog-title">{TEXT.title}</strong>
        <p className="beaker-dialog-description">{TEXT.description}</p>
        <button type="button" className="submenu-button mint beaker-dialog-button" onClick={onConfirm}>
          <strong>{TEXT.confirm}</strong>
        </button>
      </div>
    </div>
  );
}

export default BalanceCompleteDialog;
