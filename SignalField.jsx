import React from 'react';

/** Original SVG beam treatment: the light follows an editorial network path.
 * Static fallback remains visible with animation disabled.
 */
export default function SignalField({active=true}){
  return <div className={'relay-signal-field'+(!active?' relay-signal-field--paused':'')} aria-hidden="true">
    <svg viewBox="0 0 640 560" preserveAspectRatio="xMidYMid slice" focusable="false">
      <defs>
        <linearGradient id="relay-beam" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667c65" stopOpacity="0"/>
          <stop offset="48%" stopColor="#c8f7a0" stopOpacity=".65"/>
          <stop offset="100%" stopColor="#667c65" stopOpacity="0"/>
        </linearGradient>
        <radialGradient id="relay-halo">
          <stop offset="0%" stopColor="#b5e68a" stopOpacity=".24"/>
          <stop offset="100%" stopColor="#b5e68a" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="364" cy="282" r="218" fill="url(#relay-halo)"/>
      <g className="relay-signal-field__geometry">
        <circle cx="365" cy="270" r="175" fill="none" stroke="#a9c3a6" strokeOpacity=".11"/>
        <circle cx="365" cy="270" r="234" fill="none" stroke="#a9c3a6" strokeOpacity=".075" strokeDasharray="2 12"/>
        <path d="M-50 410 C108 375 98 135 252 164 S460 420 685 30" fill="none" stroke="#9dad9e" strokeWidth="1" strokeOpacity=".19"/>
        <path d="M-60 480 C112 450 190 395 258 287 S433 99 700 72" fill="none" stroke="#9dad9e" strokeWidth="1" strokeOpacity=".2"/>
        <path d="M-60 290 C120 302 195 455 341 455 S560 341 695 287" fill="none" stroke="#9dad9e" strokeWidth="1" strokeOpacity=".12"/>
      </g>
      <g className="relay-signal-field__beams">
        <path d="M-50 410 C108 375 98 135 252 164 S460 420 685 30" stroke="url(#relay-beam)" strokeWidth="2.5" fill="none" strokeDasharray="80 780" strokeLinecap="round"/>
        <path d="M-60 480 C112 450 190 395 258 287 S433 99 700 72" stroke="url(#relay-beam)" strokeWidth="2" fill="none" strokeDasharray="100 840" strokeLinecap="round"/>
      </g>
      <g className="relay-signal-field__points">
        <circle cx="252" cy="164" r="5" fill="#b6e78d"/>
        <circle cx="258" cy="287" r="3" fill="#b6e78d" opacity=".7"/>
        <circle cx="341" cy="455" r="3" fill="#b6e78d" opacity=".5"/>
        <circle cx="500" cy="216" r="3.5" fill="#b6e78d" opacity=".75"/>
      </g>
    </svg>
  </div>;
}
