import WaterCupGame from '../component/math/WaterCupGame';

function BeakerFillMediumPage({ onNavigate }) {
  return <WaterCupGame title="물잔 채우기(중간)" onNavigate={onNavigate} showGuideCells={false} />;
}

export default BeakerFillMediumPage;
