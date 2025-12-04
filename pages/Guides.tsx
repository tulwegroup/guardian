import React from 'react';
import { useLocation } from 'react-router-dom';

const Guides: React.FC = () => {
  const location = useLocation();
  const isBuying = location.pathname.includes('buying');

  return (
    <div className="pt-32 pb-20 min-h-screen bg-white">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl font-serif text-slate-900 mb-8 text-center">
          {isBuying ? 'Buying Guide' : 'Selling Guide'}
        </h1>
        
        <div className="prose prose-lg mx-auto text-gray-600">
          <p className="lead text-xl text-center mb-12 italic text-gray-500">
            {isBuying 
              ? "Navigating the Dubai real estate market can be complex. Here is our step-by-step guide to purchasing your dream property."
              : "Maximize your investment with our expert tips on selling property in the UAE market."
            }
          </p>

          <div className="space-y-12">
             <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 bg-slate-100 text-slate-900 group-hover:bg-gold-500 group-hover:text-white transition-colors rounded-full flex items-center justify-center font-bold font-serif text-xl border border-slate-200">1</div>
                <div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2">{isBuying ? 'Determine Your Budget' : 'Property Valuation'}</h3>
                   <p>{isBuying 
                     ? "Consider your savings, mortgage eligibility, and additional costs like registration fees (4% DLD), agency fees (2%), and deposits." 
                     : "Get a realistic market appraisal. We provide comparative market analysis to price your property competitively."}
                   </p>
                </div>
             </div>

             <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 bg-slate-100 text-slate-900 group-hover:bg-gold-500 group-hover:text-white transition-colors rounded-full flex items-center justify-center font-bold font-serif text-xl border border-slate-200">2</div>
                <div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2">{isBuying ? 'Find the Right Property' : 'Marketing Your Home'}</h3>
                   <p>{isBuying 
                     ? "Browse our listings and shortlist communities. Consider proximity to schools, work, and lifestyle amenities." 
                     : "We use high-quality photography, virtual tours, and premium portal listings to showcase your property to the widest audience."}
                   </p>
                </div>
             </div>

             <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 bg-slate-100 text-slate-900 group-hover:bg-gold-500 group-hover:text-white transition-colors rounded-full flex items-center justify-center font-bold font-serif text-xl border border-slate-200">3</div>
                <div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2">{isBuying ? 'Make an Offer & MOU' : 'Negotiation & Agreement'}</h3>
                   <p>{isBuying 
                     ? "Once you find the one, we negotiate the best price and sign a Memorandum of Understanding (Form F) with a 10% security deposit." 
                     : "We vet potential buyers and negotiate offers on your behalf to secure the best price and terms."}
                   </p>
                </div>
             </div>

             <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 bg-slate-100 text-slate-900 group-hover:bg-gold-500 group-hover:text-white transition-colors rounded-full flex items-center justify-center font-bold font-serif text-xl border border-slate-200">4</div>
                <div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2">{isBuying ? 'Transfer Ownership' : 'Transfer & Handover'}</h3>
                   <p>{isBuying 
                     ? "The final step happens at the Dubai Land Department trustee office where the title deed is transferred to your name." 
                     : "Receive your payment via Manager's Cheque at the transfer office and hand over the keys to the new owner."}
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guides;