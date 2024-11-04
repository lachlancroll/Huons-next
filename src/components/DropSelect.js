"use client";

import React, { useState } from 'react';
const DropSelect = ({ index, options, onChange }) => {
    const [isOpened, setIsOpened] = useState(false);

    return (
        <div style={{ padding: "10px" }}>
            <select className="dropdown" id="dropdown" value={options[index]} onChange={onChange}>
                {options.map((option, index) =>
                    (
                        <option id={option} value={index}>{option}</option>
                    )
                )}
            </select>
        </div>
    )
}
export default (DropSelect)