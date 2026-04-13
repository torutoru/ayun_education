import { useEffect, useState } from 'react';
import { downloadStoredGlb, getStoredImageUrl, listStoredArtJobs } from '../../art/artPipelineApi';
import ArtModelViewer from './ArtModelViewer';

function sortJobs(jobs) {
  return [...jobs].sort((left, right) => right.updatedAt - left.updatedAt);
}

function ArtGallery() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedBlob, setSelectedBlob] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedJob = jobs.find((job) => job.id === selectedJobId) || null;

  useEffect(() => {
    let mounted = true;

    const loadJobs = async () => {
      try {
        const response = await listStoredArtJobs();
        const readyJobs = sortJobs((response.items || []).filter((job) => job.glbObjectKey && job.status === 'ready'));

        if (!mounted) {
          return;
        }

        setJobs(readyJobs);

        if (readyJobs.length > 0) {
          setSelectedJobId((prev) => prev || readyJobs[0].id);
        }
      } catch (error) {
        if (mounted) {
          setErrorMessage('저장된 3D 그림 목록을 불러오지 못했어요.');
        }
      }
    };

    loadJobs();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadSelectedBlob = async () => {
      if (!selectedJob?.id) {
        if (mounted) {
          setSelectedBlob(null);
        }
        return;
      }

      try {
        const blob = await downloadStoredGlb(selectedJob.id);

        if (mounted) {
          setSelectedBlob(blob);
        }
      } catch (error) {
        if (mounted) {
          setSelectedBlob(null);
          setErrorMessage('선택한 3D 파일을 불러오지 못했어요.');
        }
      }
    };

    loadSelectedBlob();

    return () => {
      mounted = false;
    };
  }, [selectedJob]);

  if (errorMessage) {
    return <div className="detail-card art-gallery-empty">{errorMessage}</div>;
  }

  if (jobs.length === 0) {
    return (
      <div className="detail-card art-gallery-empty">
        아직 저장된 3D 그림이 없어요. 그림판 놀이터에서 3D 캐릭터를 먼저 만들어 보세요.
      </div>
    );
  }

  return (
    <section className="art-gallery-layout">
      <div className="detail-card art-gallery-list-card">
        <div className="art-gallery-header">
          <div>
            <span className="eyebrow">FIRESTORE LIST</span>
            <h2>저장된 3D 그림</h2>
          </div>
          <span className="art-gallery-count">{jobs.length}개</span>
        </div>

        <div className="art-gallery-list">
          {jobs.map((job) => (
            <button
              type="button"
              key={job.id}
              className={selectedJobId === job.id ? 'art-gallery-item active' : 'art-gallery-item'}
              onClick={() => setSelectedJobId(job.id)}
            >
              <div className="art-gallery-thumb">
                {job.previewImageKey ? (
                  <img
                    src={getStoredImageUrl(job.id, job.updatedAt)}
                    alt="stored art preview"
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div className="art-gallery-copy">
                <strong>{job.actionLabel || '3D 캐릭터'}</strong>
                <span>{new Date(job.updatedAt).toLocaleString('ko-KR')}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="detail-card art-gallery-viewer-card">
        <div className="art-gallery-header">
          <div>
            <span className="eyebrow">3D VIEWER</span>
            <h2>{selectedJob?.actionLabel || '3D 캐릭터'}</h2>
          </div>
        </div>

        {selectedBlob ? (
          <ArtModelViewer blob={selectedBlob} />
        ) : (
          <div className="art-gallery-empty">선택한 3D 파일을 준비하는 중이에요.</div>
        )}
      </div>
    </section>
  );
}

export default ArtGallery;
