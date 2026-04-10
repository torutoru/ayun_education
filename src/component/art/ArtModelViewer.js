import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function ArtModelViewer({ blob }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!blob || !mountRef.current) {
      return undefined;
    }

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#fff9ef');

    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 1.3, 3.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight('#ffffff', '#f5d3a0', 1.4);
    const dirLight = new THREE.DirectionalLight('#ffffff', 1.4);
    dirLight.position.set(3, 5, 4);
    scene.add(hemiLight, dirLight);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(2.6, 48),
      new THREE.MeshStandardMaterial({ color: '#f6ddb1', roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.15;
    scene.add(floor);

    const loader = new GLTFLoader();
    const mixerClock = new THREE.Clock();
    let mixer = null;
    let modelRoot = null;
    let frameId = 0;
    const objectUrl = URL.createObjectURL(blob);

    loader.load(
      objectUrl,
      (gltf) => {
        modelRoot = gltf.scene;

        const box = new THREE.Box3().setFromObject(modelRoot);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        modelRoot.position.x -= center.x;
        modelRoot.position.y -= box.min.y;
        modelRoot.position.z -= center.z;

        const scaleBase = size.y > 0 ? 1.8 / size.y : 1;
        modelRoot.scale.setScalar(scaleBase);
        scene.add(modelRoot);

        if (gltf.animations?.length) {
          mixer = new THREE.AnimationMixer(modelRoot);
          gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
          });
        }
      },
      undefined,
      () => {}
    );

    const renderFrame = () => {
      frameId = window.requestAnimationFrame(renderFrame);

      if (modelRoot) {
        modelRoot.rotation.y += 0.01;
      }

      if (mixer) {
        mixer.update(mixerClock.getDelta());
      }

      renderer.render(scene, camera);
    };

    const handleResize = () => {
      if (!mount) {
        return;
      }

      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    renderFrame();
    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      URL.revokeObjectURL(objectUrl);
      renderer.dispose();
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [blob]);

  return <div className="art-model-viewer" ref={mountRef} />;
}

export default ArtModelViewer;
