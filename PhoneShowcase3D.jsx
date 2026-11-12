import React,{useEffect,useMemo} from 'react';
import {Canvas} from '@react-three/fiber';
import {Float,OrbitControls,RoundedBox} from '@react-three/drei';
import * as THREE from 'three';

// A procedural concept model, NOT an image or 3D representation of any catalog phone.
// No external meshes or assets: avoids loading/licensing other manufacturers' designs.
function makeDisplayTexture(){
  const canvas=document.createElement('canvas');
  canvas.width=256;canvas.height=512;
  const ctx=canvas.getContext('2d');
  const background=ctx.createLinearGradient(20,0,250,512);
  background.addColorStop(0,'#070a21');
  background.addColorStop(.45,'#2b1a78');
  background.addColorStop(1,'#08091f');
  ctx.fillStyle=background;ctx.fillRect(0,0,256,512);
  const glow=ctx.createRadialGradient(168,240,8,156,275,225);
  glow.addColorStop(0,'rgba(253,181,248,0.96)');
  glow.addColorStop(.3,'rgba(142,105,255,0.88)');
  glow.addColorStop(.68,'rgba(73,39,171,0.4)');
  glow.addColorStop(1,'rgba(26,17,66,0)');
  ctx.fillStyle=glow;ctx.fillRect(0,0,256,512);
  ctx.save();ctx.translate(112,279);ctx.rotate(-.37);
  for(let i=0;i<5;i++){
    ctx.beginPath();ctx.ellipse(0,0,55+i*18,140+i*23,0,0,Math.PI*2);
    ctx.strokeStyle='rgba(214,177,255,'+(0.2-i*.033)+')';
    ctx.lineWidth=12-i*1.6;ctx.stroke();
  }
  ctx.restore();
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=4;
  return texture;
}

function CameraLens({x,y}){
  return <group position={[x,y,-.172]} rotation={[Math.PI/2,0,0]}>
    <mesh>
      <cylinderGeometry args={[.245,.245,.07,40]}/>
      <meshStandardMaterial color="#b6add8" metalness={.91} roughness={.2}/>
    </mesh>
    <mesh position={[0,.048,0]}>
      <cylinderGeometry args={[.19,.19,.018,40]}/>
      <meshPhysicalMaterial color="#070d1d" metalness={.65} roughness={.08} clearcoat={1}/>
    </mesh>
    <mesh position={[0,.06,0]}>
      <cylinderGeometry args={[.086,.086,.02,32]}/>
      <meshStandardMaterial color="#365280" metalness={.75} roughness={.08}/>
    </mesh>
  </group>;
}

function ConceptPhone(){
  const displayTexture=useMemo(makeDisplayTexture,[]);
  useEffect(()=>()=>displayTexture.dispose(),[displayTexture]);

  return <group rotation={[.06,-.3,-.12]}>
    <RoundedBox args={[2.12,4.28,.25]} radius={.2} smoothness={5}>
      <meshPhysicalMaterial color="#9d94c8" metalness={.88} roughness={.19} clearcoat={1}/>
    </RoundedBox>
    <RoundedBox position={[0,0,.136]} args={[1.98,4.13,.025]} radius={.15} smoothness={4}>
      <meshStandardMaterial color="#050813" metalness={.25} roughness={.2}/>
    </RoundedBox>
    <RoundedBox position={[0,-.02,.157]} args={[1.91,4.02,.008]} radius={.11} smoothness={4}>
      <meshBasicMaterial map={displayTexture} toneMapped={false}/>
    </RoundedBox>
    <RoundedBox position={[0,1.77,.172]} args={[.48,.11,.016]} radius={.054} smoothness={4}>
      <meshBasicMaterial color="#040716"/>
    </RoundedBox>
    <mesh position={[1.065,.82,0]}>
      <boxGeometry args={[.035,.55,.07]}/>
      <meshStandardMaterial color="#e1d5ff" metalness={.9} roughness={.16}/>
    </mesh>
    <mesh position={[-1.065,.48,0]}>
      <boxGeometry args={[.035,.38,.07]}/>
      <meshStandardMaterial color="#e1d5ff" metalness={.9} roughness={.16}/>
    </mesh>
    <CameraLens x={-.52} y={1.56}/>
    <CameraLens x={.02} y={1.56}/>
    <CameraLens x={-.52} y={1.01}/>
    <mesh position={[.02,1.02,-.175]} rotation={[Math.PI/2,0,0]}>
      <cylinderGeometry args={[.085,.085,.015,24]}/>
      <meshStandardMaterial color="#f8e8cd" emissive="#866b49" emissiveIntensity={.3}/>
    </mesh>
  </group>;
}

export default function PhoneShowcase3D({onReady,active=true,reducedMotion=false}){
  return <div className="hero-3d-stage" aria-hidden="true">
    <Canvas camera={{position:[0,0,7.5],fov:35}} dpr={[1,1.25]} frameloop={active&&!reducedMotion?'always':'demand'}
      gl={{alpha:true,antialias:true,powerPreference:'low-power'}}
      onCreated={onReady} style={{background:'transparent'}} fallback={null}>
      <ambientLight intensity={1.35}/>
      <directionalLight position={[-3,5,7]} intensity={2.5} color="#ffffff"/>
      <directionalLight position={[4,-1,-5]} intensity={1.9} color="#ad9cff"/>
      <pointLight position={[0,-3,4]} intensity={32} color="#9f75ff" distance={8}/>
      <Float speed={active&&!reducedMotion?1.1:0} rotationIntensity={active&&!reducedMotion?.12:0} floatIntensity={active&&!reducedMotion?.28:0}>
        <ConceptPhone/>
      </Float>
      <OrbitControls enableZoom={false} enablePan={false}
        enableDamping dampingFactor={.06}
        autoRotate={active&&!reducedMotion} autoRotateSpeed={.42}
        minPolarAngle={.35} maxPolarAngle={2.8}/>
    </Canvas>
  </div>;
}
