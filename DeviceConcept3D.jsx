import React,{useEffect,useMemo} from 'react';
import {Canvas} from '@react-three/fiber';
import {OrbitControls,RoundedBox,Float} from '@react-three/drei';
import * as THREE from 'three';
import {paletteForBrand,placeholderKind} from './brand-visuals.js';

/**
 * A truly rotatable procedural 3D *concept* device, not a manufacturer mesh.
 * No claim about physical dimensions, exact lenses, product availability or
 * official manufacturer rendering. Loaded on demand, never in 40-card grid.
 */
function Optic({x,y,back}){
  return <group position={[x,y,back]} rotation={[Math.PI/2,0,0]}>
    <mesh>
      <cylinderGeometry args={[.205,.205,.075,32]}/>
      <meshStandardMaterial color="#b5c4dd" metalness={.88} roughness={.18}/>
    </mesh>
    <mesh position={[0,.046,0]}>
      <cylinderGeometry args={[.158,.158,.015,32]}/>
      <meshPhysicalMaterial color="#060e20" metalness={.53} roughness={.07} clearcoat={1}/>
    </mesh>
    <mesh position={[0,.053,0]}>
      <cylinderGeometry args={[.078,.078,.018,24]}/>
      <meshStandardMaterial color="#476ba0" metalness={.86} roughness={.13}/>
    </mesh>
  </group>;
}
function DeviceShell({phone}){
  const kind=placeholderKind(phone);
  const [accent,secondary]=paletteForBrand(phone.brand);
  const isFold=kind==='fold',isFlip=kind==='flip';
  const width=isFold?2.85:isFlip?2.05:1.98;
  const height=isFold?2.85:isFlip?3.42:4.12;
  const half=width/2;
  const displayTexture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=512;
    const c=canvas.getContext('2d');
    const gradient=c.createLinearGradient(0,0,255,512);
    gradient.addColorStop(0,'#06132b');
    gradient.addColorStop(.4,secondary);
    gradient.addColorStop(.68,accent);
    gradient.addColorStop(1,'#090d23');
    c.fillStyle=gradient;c.fillRect(0,0,256,512);
    c.beginPath();c.ellipse(150,280,100,195,.25,0,Math.PI*2);
    c.strokeStyle='rgba(255,255,255,.36)';c.lineWidth=14;c.stroke();
    const texture=new THREE.CanvasTexture(canvas);
    texture.colorSpace=THREE.SRGBColorSpace;return texture;
  },[accent,secondary]);
  useEffect(()=>()=>displayTexture.dispose(),[displayTexture]);

  return <group rotation={[.09,-.42,-.06]}>
    <RoundedBox args={[width,height,.22]} radius={.17} smoothness={5}>
      <meshPhysicalMaterial color={accent} metalness={.81} roughness={.23} clearcoat={1} clearcoatRoughness={.13}/>
    </RoundedBox>
    <RoundedBox position={[0,0,.119]} args={[width-.12,height-.13,.014]} radius={.14} smoothness={4}>
      <meshStandardMaterial color="#040817" metalness={.15} roughness={.22}/>
    </RoundedBox>
    <RoundedBox position={[0,-.006,.13]} args={[width-.22,height-.28,.006]} radius={.095} smoothness={4}>
      <meshBasicMaterial map={displayTexture} toneMapped={false}/>
    </RoundedBox>
    <RoundedBox position={[0,height/2-.17,.139]} args={[.31,.066,.008]} radius={.026} smoothness={3}>
      <meshBasicMaterial color="#020816"/>
    </RoundedBox>
    <RoundedBox position={[0,0,-.119]} args={[width-.09,height-.09,.009]} radius={.13} smoothness={3}>
      <meshPhysicalMaterial color={secondary} metalness={.67} roughness={.24} clearcoat={1}/>
    </RoundedBox>
    {kind==='pixel'&&<RoundedBox position={[0,height/2-.55,-.15]} args={[width-.17,.48,.075]} radius={.14} smoothness={4}>
      <meshStandardMaterial color="#536079" metalness={.8} roughness={.21}/>
    </RoundedBox>}
    <Optic x={-half+.43} y={height/2-.43} back={-.21}/>
    <Optic x={-half+.43} y={height/2-.96} back={-.21}/>
    {kind!=='slim'&&<Optic x={-half+.89} y={height/2-.71} back={-.21}/>}
    {isFold&&<mesh position={[0,0,-.151]}>
      <boxGeometry args={[.034,height-.15,.01]}/>
      <meshStandardMaterial color="#c6d0e3" metalness={.8} roughness={.2}/>
    </mesh>}
    {isFlip&&<mesh position={[0,0,-.156]}>
      <boxGeometry args={[width-.13,.037,.015]}/>
      <meshStandardMaterial color="#e2d8ed" metalness={.85} roughness={.17}/>
    </mesh>}
    <mesh position={[half+.015,.56,0]}>
      <boxGeometry args={[.036,.46,.07]}/>
      <meshStandardMaterial color="#e7e3f5" metalness={.92} roughness={.17}/>
    </mesh>
  </group>;
}

export default function DeviceConcept3D({phone,reducedMotion=false}){
  return <Canvas camera={{position:[0,.1,6.9],fov:39}}
    dpr={[1,1.25]} frameloop={reducedMotion?'demand':'always'}
    gl={{alpha:true,antialias:true,powerPreference:'low-power'}}
    style={{background:'transparent'}} fallback={null}>
    <ambientLight intensity={1.45}/>
    <directionalLight position={[-4,6,5]} intensity={2.3} color="#fff"/>
    <directionalLight position={[5,-2,-4]} intensity={1.7} color="#b0acff"/>
    <pointLight position={[0,-2,5]} intensity={19} color="#9bdff9" distance={8}/>
    <Float speed={reducedMotion?0:.85} rotationIntensity={reducedMotion?0:.07} floatIntensity={reducedMotion?0:.17}>
      <DeviceShell phone={phone}/>
    </Float>
    <OrbitControls enablePan={false} enableZoom={false} enableDamping
      dampingFactor={.055} autoRotate={!reducedMotion} autoRotateSpeed={.4}
      minPolarAngle={.35} maxPolarAngle={2.8}/>
  </Canvas>;
}
