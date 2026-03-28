import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Legal() {
  const location = useLocation();
  const path = location.pathname;

  let title = "";
  let content = null;

  if (path === '/privacy') {
    title = "Privacy Policy";
    content = (
      <>
        <h3 className="text-xl font-bold mt-4 text-white">1. Information We Collect</h3>
        <p className="mb-4">We collect your Google email for account creation and basic profile details.</p>
        <h3 className="text-xl font-bold mt-4 text-white">2. How We Use Information</h3>
        <p className="mb-4">We use your data strictly to manage your website dashboard, process payments via Razorpay, and calculate referral commissions.</p>
      </>
    );
  } else if (path === '/terms') {
    title = "Terms & Conditions";
    content = (
      <>
        <h3 className="text-xl font-bold mt-4 text-white">1. Platform Usage</h3>
        <p className="mb-4">By purchasing a website franchise on Meri Kamai, you agree not to promote illegal, adult, or banned apps on your provided subdomain.</p>
        <h3 className="text-xl font-bold mt-4 text-white">2. Account Suspension</h3>
        <p className="mb-4">We reserve the right to suspend subdomains that violate government regulations without prior notice.</p>
      </>
    );
  } else if (path === '/refund') {
    title = "Refund & Fair Use Policy";
    content = (
      <>
        <h3 className="text-xl font-bold mt-4 text-white">1. Digital Products</h3>
        <p className="mb-4">Since the franchise setup (subdomain) and English courses are instantly delivered digital goods, we do not offer refunds once the payment is successful.</p>
        <h3 className="text-xl font-bold mt-4 text-white">2. Fair Commission Use</h3>
        <p className="mb-4">Any attempt to manipulate the referral system using bots or fake accounts will result in immediate wallet freeze and account termination.</p>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-brandDark text-gray-300 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-brandCard border border-gray-800 rounded-2xl p-6 sm:p-10">
        <h1 className="text-3xl font-extrabold text-brandGreen mb-6 border-b border-gray-800 pb-4">{title}</h1>
        <div className="space-y-4 text-sm sm:text-base leading-relaxed">
          {content}
          <p className="mt-8 text-xs text-gray-500">Last Updated: March 2026</p>
          <p className="text-xs text-gray-500">Contact: support@merikamai.in</p>
        </div>
      </div>
    </div>
  );
}