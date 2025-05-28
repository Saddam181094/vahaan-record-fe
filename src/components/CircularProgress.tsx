// import React from "react";

const CircularProgress = ({ size = 50, thickness = 5, color = '#323232' }) => {
    // console.log('real',color);

    return (
        <div
            className="relative inline-block"
            style={{
                width: `${size}px`,
                height: `${size}px`,
            }}
        >
            <div
                className={`absolute inset-0 border-4 border-[${color}] border-t-transparent rounded-full animate-spin`}
                style={{
                    borderWidth: thickness,
                }}
            ></div>
        </div>
    );
};

export default CircularProgress;
