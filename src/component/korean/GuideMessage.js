function GuideMessage({ message, status }) {
  return <div className={`guide-message-card ${status}`}>{message}</div>;
}

export default GuideMessage;