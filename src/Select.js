import React from 'react';

const Select = ({className, label, onChange, value, values, optionKey = null, optionLabel = null}) => {
    return (
        <div className={className}>
            <label className={`${className}-label`}>{label}</label>
            <select className={`${className}-select`} onChange={onChange} value={value}>
                {values.map((val) => <option key={optionKey !== null ? val[optionKey] : val} >{optionLabel !== null ? val[optionLabel] : val}</option>)}
            </select>
        </div>
    )
};

export default Select;