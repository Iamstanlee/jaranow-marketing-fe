import React, { useState } from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'What services does Jaranow offer?',
      answer: 'Jaranow currently offers two main services: a fixed-price car wash in Gwarinpa and premium subscription-based laundry service. We\'re constantly expanding to bring more convenience services to your day.'
    },
    {
      question: 'Where is Jaranow available?',
      answer: 'We currently operate in Abuja, Nigeria. Our car wash is located at 6th Avenue, Gwarinpa. Our laundry service is available across multiple locations in Abuja. We\'re planning to launch in Lagos, Port Harcourt, and Ibadan soon.'
    },
    {
      question: 'How do I book or place an order?',
      answer: 'For the car wash, just drive in to 6th Avenue, Gwarinpa - no appointment needed - or book ahead via WhatsApp or our website form. For laundry service, you can sign up for a subscription plan or book a pickup through our website.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept bank transfers to our business account, card payments, and mobile wallets. For the car wash, you pay the fixed price after the wash and drive off.'
    },
    {
      question: 'How much does it cost?',
      answer: 'Our car wash is fixed price: ₦2,000 for an exterior wash and ₦3,000 for a full interior + exterior wash - no negotiation, no hidden charges. For our laundry service, you can choose from subscription plans starting at ₦14,999/month.'
    },
    {
      question: 'How long does it take?',
      answer: 'A car wash is done while you wait - most washes take well under an hour. For our laundry service, we pick up your items and return them within 24-48 hours, fully washed, dried, ironed, and folded.'
    },
    {
      question: 'How will I know the status?',
      answer: 'Yes! You\'ll receive updates via WhatsApp. For the car wash, we confirm your booking and let you know when we\'re ready. For laundry orders, we\'ll notify you at every stage of the process.'
    },
    {
      question: 'What if I have an issue with my order?',
      answer: 'Customer satisfaction is our priority. If you have any issues, simply reach out to us via WhatsApp at +234 816 260 5753, and our support team will resolve it quickly.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Got questions? We've got answers. Can't find what you're looking for?{' '}
              <a
                href="https://wa.me/2349038622012"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 font-semibold hover:underline"
              >
                Chat with us
              </a>
            </p>
          </div>

          {/* FAQ Items */}
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:border-primary-300 transition-colors">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-8">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <Minus size={20} className="text-primary-600" />
                    ) : (
                      <Plus size={20} className="text-gray-400" />
                    )}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <a
              href="https://wa.me/2349038622012"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
