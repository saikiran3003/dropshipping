"use client";

import React, { useState } from "react";

export default function ImageMagnifier({ src, alt, className = "" }) {
    const [showMagnifier, setShowMagnifier] = useState(false);
    const [[x, y], setXY] = useState([0, 0]);
    const [[imgWidth, imgHeight], setSize] = useState([0, 0]);

    return (
        <div className={`relative inline-block w-full overflow-hidden cursor-crosshair ${className}`}>
            <img
                src={src}
                className="w-full h-full object-cover"
                alt={alt}
                onMouseEnter={(e) => {
                    const elem = e.currentTarget;
                    const { width, height } = elem.getBoundingClientRect();
                    setSize([width, height]);
                    setShowMagnifier(true);
                }}
                onMouseMove={(e) => {
                    const elem = e.currentTarget;
                    const { top, left } = elem.getBoundingClientRect();
                    const x = e.pageX - left - window.pageXOffset;
                    const y = e.pageY - top - window.pageYOffset;
                    setXY([x, y]);
                }}
                onMouseLeave={() => setShowMagnifier(false)}
            />

            {showMagnifier && (
                <div
                    style={{
                        position: "absolute",
                        pointerEvents: "none",
                        height: "250px",
                        width: "250px",
                        top: `${y - 125}px`,
                        left: `${x - 125}px`,
                        border: "2px solid rgba(255, 255, 255, 0.8)",
                        boxShadow: "0 0 0 5000px rgba(0, 0, 0, 0.3)",
                        backgroundColor: "white",
                        backgroundImage: `url('${src}')`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: `${imgWidth * 2.5}px ${imgHeight * 2.5}px`,
                        backgroundPositionX: `${-x * 2.5 + 125}px`,
                        backgroundPositionY: `${-y * 2.5 + 125}px`,
                        zIndex: 50,
                    }}
                />
            )}
        </div>
    );
}
