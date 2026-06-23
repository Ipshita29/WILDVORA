const Inquiry = require('../models/Inquiry');
const Experience = require('../models/Experience');
const Notification = require('../models/Notification');

// @route GET /api/inquiries/experience/:experienceId
// Get or create an inquiry thread for the authenticated customer
const getOrCreateInquiry = async (req, res) => {
  try {
    const { experienceId } = req.params;

    const experience = await Experience.findById(experienceId).select('host hostName title');
    if (!experience) return res.status(404).json({ success: false, message: 'Experience not found' });
    if (!experience.host) return res.status(400).json({ success: false, message: 'Experience has no host' });

    let inquiry = await Inquiry.findOne({ experience: experienceId, customer: req.user._id });
    if (!inquiry) {
      inquiry = await Inquiry.create({
        experience: experienceId,
        customer:   req.user._id,
        host:       experience.host,
        messages:   [],
      });
    }

    res.json({ success: true, inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/inquiries/:id/messages
// Add a message to an existing inquiry thread (customer or operator)
const addMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const inquiry = await Inquiry.findById(req.params.id).populate('experience', 'title');
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });

    const isCustomer = inquiry.customer.toString() === req.user._id.toString();
    const isHost     = inquiry.host.toString()     === req.user._id.toString();

    if (!isCustomer && !isHost) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const role = isCustomer ? 'customer' : 'operator';
    inquiry.messages.push({ sender: req.user._id, role, text: text.trim(), sentAt: new Date() });
    await inquiry.save();

    const newMsg      = inquiry.messages[inquiry.messages.length - 1];
    const recipientId = isCustomer ? inquiry.host : inquiry.customer;

    try {
      await Notification.create({
        recipient:   recipientId,
        type:        'booking',
        title:       isCustomer
          ? `Question about "${inquiry.experience?.title}"`
          : `Host replied – "${inquiry.experience?.title}"`,
        desc:        `${req.user.name}: ${text.length > 60 ? text.slice(0, 60) + '…' : text}`,
        referenceId: inquiry._id,
        badges: [
          { text: 'Inquiry', color: 'bg-blue-50 text-blue-600 border border-blue-100' },
        ],
      });
    } catch (_) {}

    res.status(201).json({ success: true, message: newMsg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getOrCreateInquiry, addMessage };
