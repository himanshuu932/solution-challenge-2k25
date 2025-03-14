import React, { useState, useEffect, memo } from 'react';
import './BookDonationPage.css';
import { FaFilter, FaSearch, FaTimes, FaBell } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import FilterBox from './FilterBox';
import ItemCard from './ItemCard';

const BookDonationPage = () => {
  // Local state for donations, modals, and notifications
  const [items, setItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
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
  
  // Inside your BookDonationPage component, after your fetchNotifications function is defined
  useEffect(() => {
    // Only start the interval if userId exists.
    if (userId) {
      const interval = setInterval(() => {
        fetchNotifications();
      }, 10000); // 10,000 ms = 10 seconds
      return () => clearInterval(interval);
    }
  }, [userId]);


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
          images: donation.images && donation.images.length > 0 ? donation.images : [picsumImages[0]],
          tags: donation.tags || []
        }));
        setItems(mappedItems);
      })
      .catch(error => console.error('Error fetching donations:', error));
  }, [picsumImages]);

  // Fetch notifications for current user
  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/auth/${userId}/notifications`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/auth/${userId}/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
      // Remove the deleted notification from state
      setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  // Handle bell icon click
  const handleBellClick = () => {
    setShowNotificationsModal(true);
    fetchNotifications();
  };

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
      <style>
        {`
          @keyframes bellShake {
            0% { transform: rotate(0); }
            25% { transform: rotate(10deg); }
            50% { transform: rotate(0); }
            75% { transform: rotate(-10deg); }
            100% { transform: rotate(0); }
          }
        `}
      </style>
      
      <div className="controls-section63696">
        {/* Bell Icon with notification badge */}
        <div style={{ position: 'relative', marginRight: '15px' }}>
          <FaBell 
            className="bell-icon63696" 
            onClick={handleBellClick} 
            style={{
              fontSize: '1.5rem',
              color: '#4a4a4a',
              cursor: 'pointer',
              animation: notifications.length > 0 ? 'bellShake 1s infinite' : 'none'
            }}
          />
          {notifications.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: 'red',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {notifications.length}
            </span>
          )}
        </div>
        
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
      
      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="overlay63696" onClick={() => setShowNotificationsModal(false)}>
          <div className="container63696" onClick={e => e.stopPropagation()}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid #eee',
              paddingBottom: '10px',
              marginBottom: '15px'
            }}>
              <h3 className="title63696">Notifications</h3>
              <FaTimes 
                onClick={() => setShowNotificationsModal(false)} 
                style={{
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: '#666'
                }}
              />
            </div>
            
            {notifications.length === 0 ? (
              <p>No notifications.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {notifications.map((notif) => (
                  <li key={notif._id} style={{ 
                    padding: '10px', 
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>
                      <strong>{notif.requestedBy.username}</strong>: {notif.message} (Donation: {notif.donation.item})
                    </span>
                    <button
                      onClick={() => handleDeleteNotification(notif._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff4d4d',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginLeft: '10px',
                        padding: '0 5px',
                        borderRadius: '50%',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FaTimes />
                    </button>
                  </li>
          ))}
        </ul>
      )}
      <button className="cancel-btn63696" onClick={() => setShowNotificationsModal(false)}>Close</button>
    </div>
  </div>
)}

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
                <ItemCard key={item.id} userId={userId} item={item} isMyDonation={true} onRemove={removeDonation} onEdit={openEditModal} onRequest={(item) => alert(`Requesting ${item.name}`)} />
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
                <ItemCard key={item.id} userId={userId} item={item} isMyDonation={false} onRemove={removeDonation} onEdit={openEditModal} onRequest={(item) => alert(`Requesting ${item.name}`)} />
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
