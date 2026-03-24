import treeWorkerImage from '../../assert/tree_worker.jpg';

function WorkerAvatar({ className }) {
  return <img className={className} src={treeWorkerImage} alt="사람 캐릭터" />;
}

export default WorkerAvatar;