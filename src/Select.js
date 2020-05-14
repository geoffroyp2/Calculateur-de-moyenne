import React from 'react';

// import Table from 'react-bootstrap/Table'

const Select = ({ className, onChange, value, values }) => {
    return (
        <select className={`${className}`} onChange={onChange} value={value}>
            {values.map((val) => <option key={val} >{val}</option>)}
        </select>
    )
};

export default Select;