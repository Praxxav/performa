import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true // For faster queries by userId
  },
  invoiceNumber: {
    type: String,
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  clientAddress: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  companyAddress: {
    type: String
  },
  description: String,
  amountNumeric: {
    type: Number,
    required: true
  }, // Storing numeric value for sorting and calculations
  invoiceDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  paymentLink: String,
  invoiceUrl: {
    type: String,
    required: true
  },
  invoiceFileName: String,
  paymentId: String,
  payerId: String,
  paidAt: Date,
  paymentMethod: {
    type: String,
    enum: ['paypal', 'credit_card', 'bank_transfer'],
    default: 'paypal'
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled', 'overdue'],
    default: 'pending'
  },
  sentDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add compound index for faster queries
InvoiceSchema.index({ userId: 1, status: 1 });
InvoiceSchema.index({ userId: 1, invoiceDate: -1 });

const Invoice = mongoose.model('Invoice', InvoiceSchema);

export default Invoice;
