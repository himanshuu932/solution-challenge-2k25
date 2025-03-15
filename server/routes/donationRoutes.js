import express from 'express';
import { 
  createDonation, 
  getAllDonations, 
  getDonationById, 
  updateDonation, 
  deleteDonation,
  requestDonation
} from '../controllers/donationController.js';

const router = express.Router();

router.post('/', createDonation);
router.get('/', getAllDonations);
router.get('/:id', getDonationById);
router.put('/:id', updateDonation);
router.delete('/:id', deleteDonation);
router.post('/request', requestDonation);

export default router;
