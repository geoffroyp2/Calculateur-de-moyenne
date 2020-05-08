import React from 'react';

// import Table from 'react-bootstrap/Table'

const Select = ({ className, onChange, value, values, optionKey = null, optionLabel = null }) => {
    return (
        <select className={`${className}`} onChange={onChange} value={value}>
            {values.map((val) => <option key={optionKey !== null ? val[optionKey] : val} >{optionLabel !== null ? val[optionLabel] : val}</option>)}
        </select>
    )
};

export default Select;