import WaterCupGame from '../component/math/WaterCupGame';

function BeakerFillPage({ onNavigate }) {
  return <WaterCupGame title={'물잔 채우기(쉬움)'} onNavigate={onNavigate} showGuideCells showCellNumbers />;
}

export default BeakerFillPage;
