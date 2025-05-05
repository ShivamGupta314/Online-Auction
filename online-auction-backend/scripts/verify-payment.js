#!/usr/bin/env node

import { prisma } from '../src/prismaClient.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Main function to verify payment system
async function verifyPaymentSystem() {
  console.log('\n===== PAYMENT SYSTEM VERIFICATION =====\n');

  try {
    // Check Payment Methods
    const paymentMethods = await prisma.paymentMethod.findMany({
      take: 5
    });
    console.log(`Payment Methods: ${paymentMethods.length} found`);
    if (paymentMethods.length > 0) {
      console.log('Sample Payment Method:');
      console.log({
        id: paymentMethods[0].id,
        type: paymentMethods[0].type,
        lastFourDigits: paymentMethods[0].lastFourDigits,
        isDefault: paymentMethods[0].isDefault
      });
    }

    // Check Payments
    const payments = await prisma.payment.findMany({
      take: 5,
      include: {
        transactions: true,
        auctionPayment: true
      }
    });
    console.log(`\nPayments: ${payments.length} found`);
    if (payments.length > 0) {
      console.log('Sample Payment:');
      console.log({
        id: payments[0].id,
        amount: payments[0].amount,
        status: payments[0].status,
        transactionCount: payments[0].transactions.length
      });
    }

    // Check Auction Payments (Escrow)
    const auctionPayments = await prisma.auctionPayment.findMany({
      take: 5
    });
    console.log(`\nAuction Payments (Escrow): ${auctionPayments.length} found`);
    if (auctionPayments.length > 0) {
      console.log('Sample Auction Payment:');
      console.log({
        id: auctionPayments[0].id,
        status: auctionPayments[0].status,
        escrowHeld: auctionPayments[0].escrowHeld
      });
    }

    // Check Package Purchases
    const userPackages = await prisma.userPackage.findMany({
      take: 5,
      include: {
        package: true
      }
    });
    console.log(`\nPackage Purchases: ${userPackages.length} found`);
    if (userPackages.length > 0) {
      console.log('Sample Package Purchase:');
      console.log({
        id: userPackages[0].id,
        packageName: userPackages[0].package.name,
        startDate: userPackages[0].startDate,
        endDate: userPackages[0].endDate,
        isActive: userPackages[0].isActive
      });
    }

    // Check Transactions
    const transactions = await prisma.transaction.findMany({
      take: 5
    });
    console.log(`\nTransactions: ${transactions.length} found`);
    if (transactions.length > 0) {
      console.log('Sample Transaction:');
      console.log({
        id: transactions[0].id,
        amount: transactions[0].amount,
        status: transactions[0].status,
        type: transactions[0].type
      });
    }

    console.log('\n===== VERIFICATION COMPLETE =====\n');
    console.log('Payment gateway appears to be set up correctly in the database.');
    console.log('To test the full payment flow, use the frontend interface or API endpoints.');

  } catch (error) {
    console.error('Error verifying payment system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyPaymentSystem(); 