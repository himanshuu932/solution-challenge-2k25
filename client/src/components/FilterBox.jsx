import React, { useState, useEffect, memo } from 'react';
import './BookDonationPage.css';

import { FaFilter, FaSearch, FaTimes, FaBell } from 'react-icons/fa';
const FilterBox = ({ filterType, setFilterType, selectedTags, setSelectedTags, allTags, onApply, onClose }) => {
  const handleTagClick = (tag, e) => {
    e.stopPropagation();
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleFilterTypeChange = (e) => {
    e.stopPropagation();
    setFilterType(e.target.value);
  };

  return (
    <div className="filter-dropdown63696" onClick={(e) => e.stopPropagation()}>
      <FaTimes className="close-icon63696" onClick={onClose} />
      <label>Filter by Type:</label>
      <select value={filterType} onChange={handleFilterTypeChange}>
        <option value="all">All</option>
        <option value="book">Book</option>
        <option value="equipment">Equipment</option>
        <option value="stationery">Stationery</option>
        <option value="other">Other</option>
      </select>
      <label>Filter by Tags:</label>
      <div className="tag-filters63696">
        {allTags.map((tag, index) => (
          <button
            key={index}
            className={`tag-filter63696 ${selectedTags.includes(tag) ? 'active63696' : ''}`}
            onClick={(e) => handleTagClick(tag, e)}
          >
            {tag}
          </button>
        ))}
      </div>
      <button className="apply-button63696" onClick={onApply}>Apply</button>
    </div>
  );
};

export default FilterBox;