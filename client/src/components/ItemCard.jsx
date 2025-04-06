import React, { useState, useEffect, memo } from 'react';
import './BookDonationPage.css';

import { FaFilter, FaSearch, FaTimes, FaBell } from 'react-icons/fa';
const ItemCard = memo(({ userId,item, isMyDonation, onRemove, onEdit, onRequest }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);

  const backend_link = "https://hackblitz-nine.vercel.app";

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


  const requestDonation = (donationId, requestedBy, message) => {
    console.log("Request message:", message);
    return fetch(`${backend_link}/api/donations/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ donationId, requestedBy, message })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to send donation request');
        }
        return response.json();
      })
      .then(data => {
        console.log('Donation request sent:', data);
        return data;
      })
      .catch(error => {
        console.error('Error sending donation request:', error);
        throw error;
      });
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
            <div className="action-buttons363696">
              <button className="remove-button363696" onClick={handleRemoveClick}>Remove</button>
              <button className="edit-button363696" onClick={() => onEdit(item)}>Edit</button>
            </div>
          ) : (
            <div className="item-actions-container363696">
              <button className="appeal-button363696" onClick={openModal}>Request Item</button>
            </div>
          )}
        </div>
      </div>
      {showRemoveConfirmation && (
        <div className="modal-overlay263696" onClick={cancelRemove}>
          <div className="modal263696" onClick={e => e.stopPropagation()}>
            <h4>Are you sure you want to remove this item?</h4>
            <div className="modal-actions263696">
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
            <div className="modal-actions63696">
              <button onClick={()=>requestDonation(item.id,userId,"please")}>Yes, Request</button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default ItemCard;