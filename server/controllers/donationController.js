import Donation from '../models/Dontaion.js';
import User from '../models/User.js';

// Create a new donation
export const createDonation = async (req, res) => {
  try {
    const { item, type, tags, description, donatedBy } = req.body;
    
    // Verify that the donating user exists
    const user = await User.findById(donatedBy);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const donation = new Donation({ item, type, tags, description, donatedBy });
    await donation.save();
    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all donations with user info populated
export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find().populate('donatedBy', 'username email');
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a donation by ID
export const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('donatedBy', 'username email');
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a donation
export const updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    // Update the donation fields if provided
    donation.item = req.body.item || donation.item;
    donation.type = req.body.type || donation.type;
    donation.tags = req.body.tags || donation.tags;
    donation.description = req.body.description || donation.description;
    await donation.save();
    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a donation
export const deleteDonation = async (req, res) => {
  console.log("Delete Donation");
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    console.log("Donation removed");
    res.json({ message: 'Donation removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Request a donation
// This function expects in req.body: donationId, requestedBy (user id of the requester), and message.
export const requestDonation = async (req, res) => {
    try {
      const { donationId, requestedBy, message } = req.body;
      console.log("Request Donation:", req.body);
  
      // Find the donation using donationId and populate the donor details
      const donation = await Donation.findById(donationId).populate('donatedBy', 'username email'); 
      if (!donation) {
        return res.status(404).json({ message: 'Donation not found' });
      }
  
      // Find the donor using the donatedBy field from the donation
      const donor = await User.findById(donation.donatedBy);
      if (!donor) {
        return res.status(404).json({ message: 'Donor not found' });
      }
      const requester = await User.findById(requestedBy);
      if (!requester) {
        return res.status(404).json({ message: 'requester not found' });
      }
  
      // Construct a detailed message
      const notificationMessage = `I would like to request this donation: ${donation.item} of type ${donation.type}. Description: ${donation.description} Contact: ${requester.email}`;
  
      // Ensure notifications array exists
      if (!donor.notifications) {
        donor.notifications = [];
      }
  
      // Add a new notification
      donor.notifications.push({ 
        requestedBy, 
        message: notificationMessage, 
        donation: donation._id 
      });
  
      await donor.save();
  
      // Send response including donation details
      res.json({ 
        message: 'Donation request sent successfully', 
        donation: {
          id: donation._id,
          item: donation.item,
          type: donation.type,
          tags: donation.tags,
          description: donation.description,
          donatedBy: donation.donatedBy, // Contains populated user info (username, email)
        }
      });
  
    } catch (error) {
      console.error("Error in requestDonation:", error);
      res.status(500).json({ message: error.message });
    }
  };
  
