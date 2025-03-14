import React, { useState, useEffect, memo } from 'react';
import './BookDonationPage.css';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

// FilterBox Component
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

// Memoized ItemCard Component
const ItemCard = memo(({ userId,item, isMyDonation, onRemove, onEdit, onRequest }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);

  const prevImage = () =>
    setCarouselIndex(prev => (prev === 0 ? item.images.length - 1 : prev - 1));
  const nextImage = () =>
    setCarouselIndex(prev => (prev === item.images.length - 1 ? 0 : prev + 1));

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleConfirmAppeal = () => {
    onRequest(item);
    closeModal();
  };

  // Prevent multiple state updates on rapid clicks
  const handleRemoveClick = () => {
    if (!showRemoveConfirmation) {
      setShowRemoveConfirmation(true);
    }
  };

  const handleRemoveItem = () => {
    onRemove(item.id);
    setShowRemoveConfirmation(false);
  };

  const cancelRemove = () => setShowRemoveConfirmation(false);
  const requestDonation = async (donationId, requestedBy, message) => {
    console.log("Request message:", message);
    setModalOpen(false);
    try {
      const response = await fetch('http://localhost:5000/api/donations/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId, requestedBy, message })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send donation request');
      }
      
      const data = await response.json();
      console.log('Donation request sent:', data);
    
      return data;
    } catch (error) {
      console.error('Error sending donation request:', error);
      throw error;
    }
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
          <div className={`item-tags63696 ${tagsExpanded ? 'expanded63696' : ''}`}>
            {item.tags.slice(0, tagsExpanded ? item.tags.length : 3).map((tag, index) => (
              <span key={index} className="tag63696">{tag}</span>
            ))}
            {item.tags.length > 3 && (
              <button className="expand-tags63696" onClick={() => setTagsExpanded(!tagsExpanded)}>
                {tagsExpanded ? 'Show Less' : 'Expand Tags'}
              </button>
            )}
          </div>
          {isMyDonation ? (
            <div className="action-buttons63696">
              <button className="remove-button63696" onClick={handleRemoveClick}>Remove</button>
              <button className="edit-button63696" onClick={() => onEdit(item)}>Edit</button>
            </div>
          ) : (
            <div className="item-actions-container63696">
              <button className="appeal-button63696" onClick={openModal}>Request Item</button>
            </div>
          )}
        </div>
      </div>
      {showRemoveConfirmation && (
        <div className="modal-overlay263696" onClick={cancelRemove}>
          <div className="modal263696" onClick={e => e.stopPropagation()}>
            <h4>Are you sure you want to remove this item?</h4>
            <div className="modal-actions63696">
              <button onClick={handleRemoveItem}>Yes, Remove</button>
              <button onClick={cancelRemove}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {modalOpen && (
        <div className="modal-overlay263696" onClick={closeModal}>
          <div className="modal263696" onClick={e => e.stopPropagation()}>
            <h4>Request Item</h4>
            <p>Would you like to request "{item.name}" from {item.postedBy}?</p>
            <div className="modal-actions263696">
              <button onClick={()=>requestDonation(item.id,userId,"please")}>Yes, Request</button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

const BookDonationPage = () => {
  // Local state for donations and modals
  const [items, setItems] = useState([]);
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

  // Edit donation state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemType, setEditItemType] = useState('');
  const [editItemTags, setEditItemTags] = useState('');
  const [editItemImage, setEditItemImage] = useState('');

  // Decode token from local storage
  const token = localStorage.getItem('token');
  let userId = null, classId = null;
  let currentUser = { _id: null, username: 'Guest' };
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id;
      classId = decodedToken.classId;
      currentUser = decodedToken;
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  // Fetch donations from backend on mount
  useEffect(() => {
    fetch('/api/donations')
      .then(res => res.json())
      .then(data => {
        const mappedItems = data.map(donation => ({
          id: donation._id,
          name: donation.item,
          type: donation.type,
          postedBy: donation.donatedBy?.username || 'Unknown',
          donatedBy: donation.donatedBy?._id,
          // If donation.images is undefined, use a fallback image.
          images: donation.images && donation.images.length > 0 ? donation.images : [picsumImages[0]],
          tags: donation.tags || []
        }));
        setItems(mappedItems);
      })
      .catch(error => console.error('Error fetching donations:', error));
  }, [picsumImages]);

  const removeDonation = (id) => {
    fetch(`/api/donations/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => setItems(items.filter(item => item.id !== id)))
      .catch(error => console.error('Error deleting donation:', error));
  };

  const openAddItemModal = () => {
    setNewItemName('');
    setNewItemType('Book');
    setNewItemTags('');
    setNewItemImage(picsumImages[0]);
    setShowAddItemModal(true);
  };

  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    const donationData = {
      item: newItemName,
      type: newItemType,
      tags: newItemTags.split(',').map(tag => tag.trim()),
      description: '',
      donatedBy: userId
    };

    fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donationData)
    })
      .then(res => res.json())
      .then(data => {
        const newDonation = {
          id: data._id,
          name: data.item,
          type: data.type,
          postedBy: data.donatedBy?.username || currentUser.username,
          donatedBy: data.donatedBy?._id,
          images: data.images && data.images.length > 0 ? data.images : [newItemImage],
          tags: data.tags || []
        };
        setItems([...items, newDonation]);
        setShowAddItemModal(false);
      })
      .catch(error => console.error('Error adding donation:', error));
  };

  
  // EDIT functionality
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditItemName(item.name);
    setEditItemType(item.type);
    setEditItemTags(item.tags.join(', '));
    setEditItemImage(item.images[0] || picsumImages[0]);
    setIsEditModalOpen(true);
  };

  const handleEditItemSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      item: editItemName,
      type: editItemType,
      tags: editItemTags.split(',').map(tag => tag.trim()),
      description: '',
      donatedBy: userId
    };

    fetch(`/api/donations/${editingItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    })
      .then(res => res.json())
      .then(data => {
        const updatedDonation = {
          id: data._id,
          name: data.item,
          type: data.type,
          postedBy: data.donatedBy?.username || currentUser.username,
          donatedBy: data.donatedBy?._id,
          images: data.images && data.images.length > 0 ? data.images : [editItemImage],
          tags: data.tags || []
        };
        setItems(items.map(item => (item.id === updatedDonation.id ? updatedDonation : item)));
        setIsEditModalOpen(false);
        setEditingItem(null);
      })
      .catch(error => console.error('Error updating donation:', error));
  };

  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [myDonationsFilterType, setMyDonationsFilterType] = useState('all');
  const [myDonationsSelectedTags, setMyDonationsSelectedTags] = useState([]);
  const [othersDonationsFilterType, setOthersDonationsFilterType] = useState('all');
  const [othersDonationsSelectedTags, setOthersDonationsSelectedTags] = useState([]);
  const [appliedMyDonationsFilterType, setAppliedMyDonationsFilterType] = useState('all');
  const [appliedMyDonationsSelectedTags, setAppliedMyDonationsSelectedTags] = useState([]);
  const [appliedOthersDonationsFilterType, setAppliedOthersDonationsFilterType] = useState('all');
  const [appliedOthersDonationsSelectedTags, setAppliedOthersDonationsSelectedTags] = useState([]);
  const [showFilterDropdown1, setShowFilterDropdown1] = useState(false);
  const [showFilterDropdown2, setShowFilterDropdown2] = useState(false);

  const allTags = [...new Set(items.flatMap(item => item.tags))];

  const applyMyDonationsFilters = () => {
    setAppliedMyDonationsFilterType(myDonationsFilterType);
    setAppliedMyDonationsSelectedTags(myDonationsSelectedTags);
    setShowFilterDropdown1(false);
  };

  const applyOthersDonationsFilters = () => {
    setAppliedOthersDonationsFilterType(othersDonationsFilterType);
    setAppliedOthersDonationsSelectedTags(othersDonationsSelectedTags);
    setShowFilterDropdown2(false);
  };

  // Filter donations using donatedBy (userId) comparison
  const myDonations = items.filter(item => {
    const matchesSearch =
      (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => (tag || '').toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType =
      appliedMyDonationsFilterType === 'all' ||
      (item.type || '').toLowerCase() === appliedMyDonationsFilterType.toLowerCase();
    const matchesTags =
      appliedMyDonationsSelectedTags.length === 0 ||
      appliedMyDonationsSelectedTags.every(tag => item.tags.includes(tag));
    return item.donatedBy === userId && matchesSearch && matchesType && matchesTags;
  });

  const othersDonations = items.filter(item => {
    const matchesSearch =
      (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => (tag || '').toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType =
      appliedOthersDonationsFilterType === 'all' ||
      (item.type || '').toLowerCase() === appliedOthersDonationsFilterType.toLowerCase();
    const matchesTags =
      appliedOthersDonationsSelectedTags.length === 0 ||
      appliedOthersDonationsSelectedTags.every(tag => item.tags.includes(tag));
    return item.donatedBy !== userId && matchesSearch && matchesType && matchesTags;
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
            onChange={e => setSearchTerm(e.target.value)}
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
              <div>
                <span>Filter</span>
              </div>
            </div>
          </div>
          <div className="item-card-container63696">
            <div className="add-item-card63696" onClick={openAddItemModal}>
              <span className="add-icon63696">+</span>
              <p>Add Donation</p>
            </div>
            {myDonations.length === 0 ? (
              <div className="no-items-message63696">
                <p>No donations yet. Click the "+" button to add an item.</p>
              </div>
            ) : (
              myDonations.map(item => (
                <ItemCard userId={userId} key={item.id} item={item} isMyDonation={true} onRemove={removeDonation} onEdit={openEditModal} onRequest={(item) => alert(`Requesting ${item.name}`)} />
              ))
            )}
          </div>
          {showAddItemModal && (
            <div className="overlay63696" onClick={() => setShowAddItemModal(false)}>
              <div className="container63696" onClick={e => e.stopPropagation()}>
                <h3 className="title63696">Add New Item</h3>
                <form onSubmit={handleAddItemSubmit} className="modal-form63696">
                  <div className="input-group63696">
                    <label>Item Name</label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      placeholder="Enter item name"
                      required
                    />
                  </div>
                  <div className="input-group63696">
                    <label>Item Type</label>
                    <select value={newItemType} onChange={e => setNewItemType(e.target.value)} required>
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
                      onChange={e => setNewItemTags(e.target.value)}
                      placeholder="e.g., Math, Science"
                      required
                    />
                  </div>
                  <div className="input-group63696">
                    <label>Select Image</label>
                    <select value={newItemImage} onChange={e => setNewItemImage(e.target.value)} required>
                      {picsumImages.map((img, index) => (
                        <option key={index} value={img}>
                          Image {index + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="actions63696">
                    <button type="submit" className="add-btn63696">Add Item</button>
                    <button type="button" className="cancel-btn63696" onClick={() => setShowAddItemModal(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
        {/* Others' Donations Section */}
        <div className="donation-section63696">
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
              <div>
                <span>Filter</span>
              </div>
            </div>
          </div>
          <div className="item-card-container63696">
            {othersDonations.length === 0 ? (
              <div className="no-items-message63696">
                <p>No donations from others at the moment.</p>
              </div>
            ) : (
              othersDonations.map(item => (
                <ItemCard  userId={userId} key={item.id} item={item} isMyDonation={false} onRemove={removeDonation} onEdit={openEditModal} onRequest={(item) => alert(`Requesting ${item.name}`)} />
              ))
            )}
          </div>
        </div>
      </div>
      {/* Edit Donation Modal */}
      {isEditModalOpen && (
        <div className="overlay63696" onClick={() => setIsEditModalOpen(false)}>
          <div className="container63696" onClick={e => e.stopPropagation()}>
            <h3 className="title63696">Edit Donation</h3>
            <form onSubmit={handleEditItemSubmit} className="modal-form63696">
              <div className="input-group63696">
                <label>Item Name</label>
                <input
                  type="text"
                  value={editItemName}
                  onChange={e => setEditItemName(e.target.value)}
                  placeholder="Enter item name"
                  required
                />
              </div>
              <div className="input-group63696">
                <label>Item Type</label>
                <select value={editItemType} onChange={e => setEditItemType(e.target.value)} required>
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
                  value={editItemTags}
                  onChange={e => setEditItemTags(e.target.value)}
                  placeholder="e.g., Math, Science"
                  required
                />
              </div>
              <div className="input-group63696">
                <label>Select Image</label>
                <select value={editItemImage} onChange={e => setEditItemImage(e.target.value)} required>
                  {picsumImages.map((img, index) => (
                    <option key={index} value={img}>
                      Image {index + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div className="actions63696">
                <button type="submit" className="add-btn63696">Update Item</button>
                <button type="button" className="cancel-btn63696" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDonationPage;
