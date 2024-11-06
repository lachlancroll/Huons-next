"use client";

import React, { useState } from 'react';
const DropSelect = ({ value, options, onChange }) => {

    return (
        <div style={{ padding: "10px" }}>
            <select className="dropdown" id="dropdown" value={value} onChange={onChange}>
                {options.map(({option, value}) =>
                    (
                        <option key={value} value={value}>{option}</option>
                    )
                )}
            </select>
        </div>
    )
}
export default (DropSelect);