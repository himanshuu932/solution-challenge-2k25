import React, { useState } from 'react';
import './BookDonationPage.css';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';

const ItemCard = ({ item, currentUser, onRemove, isMyDonation }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false); // For Request Item Modal
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false); // For Remove Confirmation Modal
  const [tagsExpanded, setTagsExpanded] = useState(false);

  const prevImage = () =>
    setCarouselIndex((prev) => (prev === 0 ? item.images.length - 1 : prev - 1));
  const nextImage = () =>
    setCarouselIndex((prev) => (prev === item.images.length - 1 ? 0 : prev + 1));

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleConfirmAppeal = () => {
    alert(`You requested the item "${item.name}" posted by ${item.postedBy}`);
    closeModal();
  };

  const handleRemoveClick = () => {
    setShowRemoveConfirmation(true); // Show the confirmation modal
  };

  const handleRemoveItem = () => {
    onRemove(item.id); // Call the onRemove function to remove the item
    setShowRemoveConfirmation(false); // Close the confirmation modal
  };

  const cancelRemove = () => {
    setShowRemoveConfirmation(false); // Close the confirmation modal without removing the item
  };

  return (
    <>
      <div className={`item-card63696 ${tagsExpanded ? 'hover63696' : ''}`}>
        <div className="item-carousel63696">
          <img src={item.images[carouselIndex]} alt={item.name} className="carousel-image63696" />
          {item.images.length > 1 && (
            <>
              <button className="carousel-nav63696 left63696" onClick={prevImage} aria-label="Previous image">
                &lt;
              </button>
              <button className="carousel-nav63696 right63696" onClick={nextImage} aria-label="Next image">
                &gt;
              </button>
              <div className="carousel-dots63696">
                {item.images.map((_, index) => (
                  <span
                    key={index}
                    className={`dot63696 ${carouselIndex === index ? 'active63696' : ''}`}
                    onClick={() => setCarouselIndex(index)}
                    role="button"
                    aria-label={`Image ${index + 1}`}
                  ></span>
                ))}
              </div>
            </>
          )}
          <div className="item-badge63696">{item.type}</div>
        </div>

        <div className="item-card-content63696">
          <h3 className="item-title63696">{item.name}</h3>
          <p className="item-info63696">
            <span className="posted-by63696">Posted by: {item.postedBy}</span>
          </p>

          {/* Tags Section */}
          <div className={`item-tags63696 ${tagsExpanded ? 'expanded63696' : ''}`}>
            {item.tags.slice(0, tagsExpanded ? item.tags.length : 3).map((tag, index) => (
              <span key={index} className="tag63696">
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <button className="expand-tags63696" onClick={() => setTagsExpanded(!tagsExpanded)}>
                {tagsExpanded ? 'Show Less' : 'Expand Tags'}
              </button>
            )}
          </div>

          {/* Remove Button for My Donations */}
          {isMyDonation && (
            <button className="remove-button63696" onClick={handleRemoveClick}>
              Remove
            </button>
          )}

          {/* Request Item Button for Others' Donations */}
          {!isMyDonation && (
            <div className="item-actions-container63696">
              <button className="appeal-button63696" onClick={openModal}>
                Request Item
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      {showRemoveConfirmation && (
        <div className="modal-overlay263696" onClick={cancelRemove}>
          <div className="modal263696" onClick={(e) => e.stopPropagation()}>
            <h4>Are you sure you want to remove this item?</h4>
            <div className="modal-actions63696">
              <button onClick={handleRemoveItem}>Yes, Remove</button>
              <button onClick={cancelRemove}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Request Item Modal */}
      {modalOpen && (
        <div className="modal-overlay263696" onClick={closeModal}>
          <div className="modal263696" onClick={(e) => e.stopPropagation()}>
            <h4>Request Item</h4>
            <p>
             Would you like to request "{item.name}" from {item.postedBy}?
            </p>
            <div className="modal-actions263696">
              <button onClick={handleConfirmAppeal}>Yes, Request</button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const FilterBox = ({
  filterType,
  setFilterType,
  selectedTags,
  setSelectedTags,
  allTags,
  onApply,
  onClose,
}) => {
  // Stop event propagation when interacting with the filter dropdown
  const handleTagClick = (tag, e) => {
    e.stopPropagation(); // Prevent event from bubbling up to the parent
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleFilterTypeChange = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up to the parent
    setFilterType(e.target.value);
  };

  return (
    <div className="filter-dropdown63696" onClick={(e) => e.stopPropagation()}>
      {/* Close Icon */}
      <FaTimes className="close-icon63696" onClick={onClose} />

      {/* Filter by Type */}
      <label>Filter by Type:</label>
      <select
        value={filterType}
        onChange={handleFilterTypeChange}
      >
        <option value="all">All</option>
        <option value="book">Book</option>
        <option value="equipment">Equipment</option>
        <option value="stationery">Stationery</option>
        <option value="other">Other</option>
      </select>

      {/* Filter by Tags */}
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

      {/* Apply Button */}
      <button className="apply-button63696" onClick={onApply}>
        Apply
      </button>
    </div>
  );
};
const BookDonationPage = () => {
  const [items, setItems] = useState([
    // Sample data (30 items)
    { id: 1, type: 'Book', name: 'Data Structures & Algorithms', postedBy: 'Alice', images: ['https://picsum.photos/seed/1/250/150', 'https://picsum.photos/seed/2/250/150'], tags: ['Computer Science', 'Programming'] },
    { id: 2, type: 'Equipment', name: 'Scientific Calculator', postedBy: 'Bob', images: ['https://picsum.photos/seed/3/250/150'], tags: ['Math', 'Tools','Math', 'Tools'] },
    { id: 3, type: 'Stationery', name: 'Notebooks (Pack of 5)', postedBy: 'Charlie', images: ['https://picsum.photos/seed/4/250/150'], tags: ['Writing', 'Supplies'] },
    { id: 4, type: 'Book', name: 'Introduction to Psychology', postedBy: 'Alice', images: ['https://picsum.photos/seed/5/250/150'], tags: ['Social Sciences', 'Psychology'] },
    { id: 5, type: 'Book', name: 'The Great Gatsby', postedBy: 'David', images: ['https://picsum.photos/seed/6/250/150'], tags: ['Literature', 'Fiction'] },
    { id: 6, type: 'Equipment', name: 'Microscope', postedBy: 'Eve', images: ['https://picsum.photos/seed/7/250/150'], tags: ['Science', 'Lab'] },
    { id: 7, type: 'Stationery', name: 'Pens (Pack of 10)', postedBy: 'Frank', images: ['https://picsum.photos/seed/8/250/150'], tags: ['Writing', 'Supplies'] },
    { id: 8, type: 'Book', name: 'To Kill a Mockingbird', postedBy: 'Grace', images: ['https://picsum.photos/seed/9/250/150'], tags: ['Literature', 'Fiction'] },
    { id: 9, type: 'Equipment', name: 'Graphing Calculator', postedBy: 'Hank', images: ['https://picsum.photos/seed/10/250/150'], tags: ['Math', 'Tools'] },
    { id: 10, type: 'Stationery', name: 'Sticky Notes', postedBy: 'Ivy', images: ['https://picsum.photos/seed/11/250/150'], tags: ['Writing', 'Supplies'] },
    { id: 11, type: 'Book', name: '1984', postedBy: 'Jack', images: ['https://picsum.photos/seed/12/250/150'], tags: ['Literature', 'Fiction'] },
    { id: 12, type: 'Equipment', name: 'Telescope', postedBy: 'Kara', images: ['https://picsum.photos/seed/13/250/150'], tags: ['Science', 'Astronomy'] },
    { id: 13, type: 'Stationery', name: 'Highlighter', postedBy: 'Leo', images: ['https://picsum.photos/seed/14/250/150'], tags: ['Writing', 'Supplies'] },
    { id: 14, type: 'Book', name: 'Pride and Prejudice', postedBy: 'Mona', images: ['https://picsum.photos/seed/15/250/150'], tags: ['Literature', 'Fiction'] },
    { id: 15, type: 'Equipment', name: 'Lab Coat', postedBy: 'Nina', images: ['https://picsum.photos/seed/16/250/150'], tags: ['Science', 'Lab'] },
    { id: 16, type: 'Stationery', name: 'Markers', postedBy: 'Oscar', images: ['https://picsum.photos/seed/17/250/150'], tags: ['Writing', 'Supplies'] },
    { id: 17, type: 'Book', name: 'The Catcher in the Rye', postedBy: 'Paul', images: ['https://picsum.photos/seed/18/250/150'], tags: ['Literature', 'Fiction'] },
    { id: 18, type: 'Equipment', name: 'Bunsen Burner', postedBy: 'Quincy', images: ['https://picsum.photos/seed/19/250/150'], tags: ['Science', 'Lab'] },
    { id: 19, type: 'Stationery', name: 'Rulers', postedBy: 'Rachel', images: ['https://picsum.photos/seed/20/250/150'], tags: ['Writing', 'Supplies'] },
    { id: 20, type: 'Book', name: 'Brave New World', postedBy: 'Steve', images: ['https://picsum.photos/seed/21/250/150'], tags: ['Literature', 'Fiction'] },
    { id: 21, type: 'Equipment', name: 'Test Tubes', postedBy: 'Tina', images: ['https://picsum.photos/seed/22/250/150'], tags: ['Science', 'Lab'] },
    { id: 22, type: 'Stationery', name: 'Erasers', postedBy: 'Uma', images: ['https://picsum.photos/seed/23/250/150'], tags: ['Writing', 'Supplies'] },
    { id: 23, type: 'Book', name: 'The Hobbit', postedBy: 'Victor', images: ['https://picsum.photos/seed/24/250/150'], tags: ['Literature', 'Fiction'] },
    { id: 24, type: 'Equipment', name: 'Microscope Slides', postedBy: 'Wendy', images: ['https://picsum.photos/seed/25/250/150'], tags: ['Science', 'Lab'] },
    { id: 25, type: 'Stationery', name: 'Pencils', postedBy: 'Xander', images: ['https://picsum.photos/seed/26/250/150'], tags: ['Writing', 'Supplies'] },
    { id: 26, type: 'Book', name: 'The Lord of the Rings', postedBy: 'Yara', images: ['https://picsum.photos/seed/27/250/150'], tags: ['Literature', 'Fiction'] },
    { id: 27, type: 'Equipment', name: 'Beakers', postedBy: 'Zack', images: ['https://picsum.photos/seed/28/250/150'], tags: ['Science', 'Lab'] },
    { id: 28, type: 'Stationery', name: 'Scissors', postedBy: 'Alice', images: ['https://picsum.photos/seed/29/250/150'], tags: ['Writing', 'Supplies'] },
    { id: 29, type: 'Book', name: 'The Alchemist', postedBy: 'Bob', images: ['https://picsum.photos/seed/30/250/150'], tags: ['Literature', 'Fiction'] },
    { id: 30, type: 'Equipment', name: 'Safety Goggles', postedBy: 'Charlie', images: ['https://picsum.photos/seed/31/250/150'], tags: ['Science', 'Lab'] },
  ]);
  const picsumImages = [
    'https://picsum.photos/seed/100/250/150',
    'https://picsum.photos/seed/101/250/150',
    'https://picsum.photos/seed/102/250/150'
  ];
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('Book');
  const [newItemTags, setNewItemTags] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const openAddItemModal = () => {
    setNewItemName('');
    setNewItemType('Book');
    setNewItemTags('');
    setNewItemImage(picsumImages[0]);
    setShowAddItemModal(true);
  };
  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      id: items.length + 1,
      type: newItemType,
      name: newItemName,
      postedBy: currentUser,
      images: [newItemImage],
      tags: newItemTags.split(',').map(tag => tag.trim())
    };
    setItems([...items, newItem]);
    setShowAddItemModal(false);
  };
  
  const [searchTerm, setSearchTerm] = useState('');

  // Temporary filter states (user selections)
  const [myDonationsFilterType, setMyDonationsFilterType] = useState('all');
  const [myDonationsSelectedTags, setMyDonationsSelectedTags] = useState([]);
  const [othersDonationsFilterType, setOthersDonationsFilterType] = useState('all');
  const [othersDonationsSelectedTags, setOthersDonationsSelectedTags] = useState([]);

  // Applied filter states (used for filtering)
  const [appliedMyDonationsFilterType, setAppliedMyDonationsFilterType] = useState('all');
  const [appliedMyDonationsSelectedTags, setAppliedMyDonationsSelectedTags] = useState([]);
  const [appliedOthersDonationsFilterType, setAppliedOthersDonationsFilterType] = useState('all');
  const [appliedOthersDonationsSelectedTags, setAppliedOthersDonationsSelectedTags] = useState([]);

  const [showFilterDropdown1, setShowFilterDropdown1] = useState(false); // Filter dropdown for "My Donations"
  const [showFilterDropdown2, setShowFilterDropdown2] = useState(false); // Filter dropdown for "Others' Donations"
  const currentUser = 'Alice';

  // Extract all unique tags for filtering
  const allTags = [...new Set(items.flatMap((item) => item.tags))];

  // Apply filters for "My Donations" section
  const applyMyDonationsFilters = () => {
    setAppliedMyDonationsFilterType(myDonationsFilterType);
    setAppliedMyDonationsSelectedTags(myDonationsSelectedTags);
    setShowFilterDropdown1(false); // Close the dropdown
  };

  // Apply filters for "Others' Donations" section
  const applyOthersDonationsFilters = () => {
    setAppliedOthersDonationsFilterType(othersDonationsFilterType);
    setAppliedOthersDonationsSelectedTags(othersDonationsSelectedTags);
    setShowFilterDropdown2(false); // Close the dropdown
  };

  // Filter items for "My Donations" section
  const myDonations = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = appliedMyDonationsFilterType === 'all' || item.type.toLowerCase() === appliedMyDonationsFilterType.toLowerCase();
    const matchesTags = appliedMyDonationsSelectedTags.length === 0 || appliedMyDonationsSelectedTags.every((tag) => item.tags.includes(tag));

    return item.postedBy === currentUser && matchesSearch && matchesType && matchesTags;
  });

  // Filter items for "Others' Donations" section
  const othersDonations = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = appliedOthersDonationsFilterType === 'all' || item.type.toLowerCase() === appliedOthersDonationsFilterType.toLowerCase();
    const matchesTags = appliedOthersDonationsSelectedTags.length === 0 || appliedOthersDonationsSelectedTags.every((tag) => item.tags.includes(tag));

    return item.postedBy !== currentUser && matchesSearch && matchesType && matchesTags;
  });

  return (
    <div className="book-donation-page63696">
      <div className="controls-section63696">
        <div className="search-container63696">
          <FaSearch className="search-icon63696" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input63696"
          />
        </div>
      </div>

      <div className="donation-sections63696">
        {/* My Donations Section */}
        <div className="donation-section63696">
  <div className="section-header63696">
    <h2>My Donations</h2>
    <div className="filter-icon63696" onClick={() => setShowFilterDropdown1(!showFilterDropdown1)}>
      <FaFilter />
      {showFilterDropdown1 && (
        <FilterBox
          filterType={myDonationsFilterType}
          setFilterType={setMyDonationsFilterType}
          selectedTags={myDonationsSelectedTags}
          setSelectedTags={setMyDonationsSelectedTags}
          allTags={allTags}
          onApply={applyMyDonationsFilters}
          onClose={() => setShowFilterDropdown1(false)}
        />
      )}
      <div><text>Filter</text></div>
    </div>
  </div>
  <div className="item-card-container63696">
    {/* Add Donation Card */}
    <div className="add-item-card63696" onClick={openAddItemModal}>
      <span className="add-icon63696">+</span>
      <p>Add Donation</p>
    </div>

    {/* Donation Items */}
    {myDonations.length === 0 ? (
      <div className="no-items-message63696">
        <p>No donations yet. Click the "+" button to add an item.</p>
      </div>
    ) : (
      myDonations.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          currentUser={currentUser}
          onRemove={(id) => setItems(items.filter((item) => item.id !== id))}
          isMyDonation={true}
        />
      ))
    )}
  </div>
  {showAddItemModal && (
  <div className="overlay63696" onClick={() => setShowAddItemModal(false)}>
    <div className="container63696" onClick={(e) => e.stopPropagation()}>
      <h3 className="title63696">Add New Item</h3>
      <form onSubmit={handleAddItemSubmit} className="modal-form63696">
        <div className="input-group63696">
          <label>Item Name</label>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Enter item name"
            required
          />
        </div>
        <div className="input-group63696">
          <label>Item Type</label>
          <select
            value={newItemType}
            onChange={(e) => setNewItemType(e.target.value)}
            required
          >
            <option value="Book">Book</option>
            <option value="Equipment">Equipment</option>
            <option value="Stationery">Stationery</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="input-group63696">
          <label>Tags (comma-separated)</label>
          <input
            type="text"
            value={newItemTags}
            onChange={(e) => setNewItemTags(e.target.value)}
            placeholder="e.g., Math, Science"
            required
          />
        </div>
        <div className="input-group63696">
          <label>Select Image</label>
          <select
            value={newItemImage}
            onChange={(e) => setNewItemImage(e.target.value)}
            required
          >
            {picsumImages.map((img, index) => (
              <option key={index} value={img}>Image {index + 1}</option>
            ))}
          </select>
        </div>
        <div className="actions63696">
          <button type="submit" className="add-btn63696">Add Item</button>
          <button type="button" className="cancel-btn63696" onClick={() => setShowAddItemModal(false)}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
)}




        {/* Others' Donations Section */}

          <div className="section-header63696">
            <h2>Others' Donations</h2>
            <div className="filter-icon63696" onClick={() => setShowFilterDropdown2(!showFilterDropdown2)}>
              <FaFilter />
              {showFilterDropdown2 && (
                <FilterBox
                  filterType={othersDonationsFilterType}
                  setFilterType={setOthersDonationsFilterType}
                  selectedTags={othersDonationsSelectedTags}
                  setSelectedTags={setOthersDonationsSelectedTags}
                  allTags={allTags}
                  onApply={applyOthersDonationsFilters}
                  onClose={() => setShowFilterDropdown2(false)}
                />
              )}
              <div><text>Filter</text></div>
            </div>
          </div>
          <div className="item-card-container63696">
            {othersDonations.length === 0 ? (
              <div className="no-items-message63696">
                <p>No donations from others at the moment.</p>
              </div>
            ) : (
              othersDonations.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  currentUser={currentUser}
                  onRemove={(id) => setItems(items.filter((item) => item.id !== id))}
                  isMyDonation={false}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDonationPage;