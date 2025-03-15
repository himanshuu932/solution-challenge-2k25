import React from 'react';
import './styles/ProfileBookModal.css';

function ProfileBookModal({ onClose, profileData }) {
  // Placeholder edit handler – replace with your own logic.
  const handleEdit = (e) => {
    e.stopPropagation();
    alert('Edit Personal Details');
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
      <div className="book">
          <div className="page left">
            <div className="header-container">
              <h2>Personal Details</h2>
              <button className="edit-button" onClick={handleEdit} title="Edit Personal Details">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M12.146.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-9 9a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l9-9zM11.207 2.5 13.5 4.793 12.207 6.086 9.914 3.793 11.207 2.5zM10.5 3.207 7.793 5.914 6.5 4.621l2.707-2.707L10.5 3.207zM6.793 6.914l2.707 2.707-4 4L2.793 10.914l4-4z" />
                </svg>
              </button>
            </div>
            <p><strong>Name:</strong> {profileData.name}</p>
            <p><strong>Email:</strong> {profileData.email}</p>
            <p><strong>Phone:</strong> {profileData.phone}</p>
          </div>
          <div className="page right">
            <div className="header-container">
              <h2>Academic Details</h2>
            </div>
            <p><strong>Tests Attempted:</strong> {profileData.testsAttempted}</p>
            <p><strong>Average Score:</strong> {profileData.averageScore}</p>
            <p><strong>Other Info:</strong> {profileData.otherInfo}</p>
          </div>
        </div>
        <button className="close-button" onClick={onClose}>&times;</button>
      </div>
    </div>
  );
}

export default ProfileBookModal;
