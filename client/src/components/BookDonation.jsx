import React, { useState } from 'react';
import './BookDonationPage.css';

const BookCard = ({ book, currentUser, onRemove }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const prevImage = () =>
    setCarouselIndex((prev) =>
      prev === 0 ? book.images.length - 1 : prev - 1
    );
  const nextImage = () =>
    setCarouselIndex((prev) =>
      prev === book.images.length - 1 ? 0 : prev + 1
    );

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const handleConfirmAppeal = () => {
    alert(`You appealed for the book "${book.name}" posted by ${book.postedBy}`);
    closeModal();
  };

  return (
    <div className="book-card">
      <div className="book-carousel">
        <img
          src={book.images[carouselIndex]}
          alt={book.name}
          className="carousel-image"
        />
        {book.images.length > 1 && (
          <>
            <button className="carousel-nav left" onClick={prevImage} aria-label="Previous image">
              &lt;
            </button>
            <button className="carousel-nav right" onClick={nextImage} aria-label="Next image">
              &gt;
            </button>
            <div className="carousel-dots">
              {book.images.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${carouselIndex === index ? 'active' : ''}`}
                  onClick={() => setCarouselIndex(index)}
                  role="button"
                  aria-label={`Image ${index + 1}`}
                ></span>
              ))}
            </div>
          </>
        )}
        <div className="book-badge">{book.bookClass}</div>
      </div>
      <div className="book-card-content">
        <h3 className="book-title">{book.name}</h3>
        <p className="book-info">
          <span className="posted-by">Posted by: {book.postedBy}</span>
        </p>
        <div className="book-actions-container">
          <button className="appeal-button" onClick={openModal}>
            Request Book
          </button>
          {currentUser === book.postedBy && (
            <button
              className="remove-button"
              onClick={() => onRemove(book.id)}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4>Request Book</h4>
            <p>Would you like to request "{book.name}" from {book.postedBy}?</p>
            <div className="modal-actions">
              <button onClick={handleConfirmAppeal}>Yes, Request</button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BookDonationPage = () => {
  const [books, setBooks] = useState([
    {
      id: 1,
      name: 'Data Structures & Algorithms',
      bookClass: 'Computer Science',
      postedBy: 'Alice',
      images: [
        'https://picsum.photos/seed/1/250/150',
        'https://picsum.photos/seed/2/250/150'
      ]
    },
    {
      id: 2,
      name: 'Complete Works of Shakespeare',
      bookClass: 'Literature',
      postedBy: 'Bob',
      images: [
        'https://picsum.photos/seed/3/250/150',
        'https://picsum.photos/seed/4/250/150'
      ]
    },
    {
      id: 3,
      name: 'Fundamentals of Physics',
      bookClass: 'Science',
      postedBy: 'Charlie',
      images: [
        'https://picsum.photos/seed/5/250/150',
        'https://picsum.photos/seed/6/250/150'
      ]
    },
    {
      id: 4,
      name: 'Introduction to Psychology',
      bookClass: 'Social Sciences',
      postedBy: 'Alice',
      images: [
        'https://picsum.photos/seed/7/250/150'
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const currentUser = 'Alice';

  // States for Add Book Modal
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [newBookName, setNewBookName] = useState('');
  const [newBookClass, setNewBookClass] = useState('');
  const [newBookImage, setNewBookImage] = useState('');

  // Predefined Picsum images for selection
  const picsumImages = [
    'https://picsum.photos/seed/100/250/150',
    'https://picsum.photos/seed/101/250/150',
    'https://picsum.photos/seed/102/250/150'
  ];

  // Opens the Add Book Modal and sets a default image
  const openAddBookModal = () => {
    setNewBookName('');
    setNewBookClass('');
    setNewBookImage(picsumImages[0]);
    setShowAddBookModal(true);
  };

  // Handle the submission of the new book form
  const handleAddBookSubmit = (e) => {
    e.preventDefault();
    const newBook = {
      id: books.length + 1,
      name: newBookName,
      bookClass: newBookClass,
      postedBy: currentUser,
      images: [newBookImage]
    };
    setBooks([...books, newBook]);
    setShowAddBookModal(false);
  };

  // Function to remove a specific book
  const removeBook = (id) => {
    setBooks(books.filter((book) => book.id !== id));
  };

  // Remove all books posted by the current user
  const removeMyPosts = () => {
    if (window.confirm('Are you sure you want to remove all your book donations?')) {
      setBooks(books.filter((book) => book.postedBy !== currentUser));
    }
  };

  // Filter books based on search and filter
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         book.bookClass.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'mine') return matchesSearch && book.postedBy === currentUser;
    if (filter === 'others') return matchesSearch && book.postedBy !== currentUser;
    
    return matchesSearch;
  });

  return (
    <div className="book-donation-page">
      <div className="book-container">
        <div className="controls-section">
          <div className="book-actions">
            <button className="btn btn-post" onClick={openAddBookModal}>
              <span className="icon">+</span> Donate a Book
            </button>
            {books.some(book => book.postedBy === currentUser) && (
              <button
                className="btn remove-my-posts-button"
                onClick={removeMyPosts}
              >
                Remove All My Donations
              </button>
            )}
          </div>
          
          <div className="search-filter-section">
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search books..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-options">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Books</option>
                <option value="mine">My Donations</option>
                <option value="others">Others' Donations</option>
              </select>
            </div>
          </div>
        </div>

        <h2>Available Books {filteredBooks.length > 0 && `(${filteredBooks.length})`}</h2>
        
        {filteredBooks.length === 0 ? (
          <div className="no-books-message">
            <p>No books match your criteria. Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="book-card-container">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                currentUser={currentUser}
                onRemove={removeBook}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div className="modal-overlay" onClick={() => setShowAddBookModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4>Add New Book</h4>
            <form onSubmit={handleAddBookSubmit}>
              <div className="form-group">
                <label>Book Name</label>
                <input 
                  type="text" 
                  value={newBookName} 
                  onChange={(e) => setNewBookName(e.target.value)}
                  placeholder="Enter book name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Book Category</label>
                <input 
                  type="text" 
                  value={newBookClass} 
                  onChange={(e) => setNewBookClass(e.target.value)}
                  placeholder="Enter book category"
                  required
                />
              </div>
              <div className="form-group">
                <label>Select Image</label>
                <select 
                  value={newBookImage} 
                  onChange={(e) => setNewBookImage(e.target.value)}
                  required
                >
                  {picsumImages.map((img, index) => (
                    <option key={index} value={img}>Image {index + 1}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit">Add Book</button>
                <button type="button" onClick={() => setShowAddBookModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDonationPage;
