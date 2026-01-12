import React, {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {ChevronDown} from 'lucide-react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "10-Minute Guarantee",
      question: "How do you guarantee 10-minute delivery?",
      answer: "We have strategically located micro-fulfillment centers throughout Gwarinpa with pre-stocked essential items. Our AI predicts demand patterns, and our logistics system optimizes routes for maximum efficiency. If we're ever late, your next delivery is free."
    },
    {
      category: "Jara AI Shopping",
      question: "How accurate is the AI shopping assistant?",
      answer: "Jara AI has a 98% accuracy rate in understanding your shopping needs. It recognizes Nigerian brands, local products, and even understands context like 'ingredients for jollof rice.' The AI learns from each interaction to serve you better. If something's wrong, we fix it immediately."
    },
    {
      category: "Service Coverage",
      question: "Is Jaranow available in my area?",
      answer: "Currently, we serve Gwarinpa in Abuja with plans to expand to Dawaki, Maitama, Jahi, and Life Camp by Q2-Q3 2026. We're also launching in Lagos in 2026. Plus, check out our premium <a href='/wash' class='text-red-600 hover:text-red-700 underline font-medium'>laundry service</a> coming soon. Join our waitlist to be notified when we reach your area."
    },
    {
      category: "Pricing & Payments",
      question: "Are there any hidden fees or surge pricing?",
      answer: "No hidden fees, ever. You pay ₦1,000 service charge + ₦500 delivery fee = ₦1,500 total per order, plus the cost of your groceries (no markup). No surge pricing during peak hours, holidays, or bad weather. What you see is what you pay."
    },
    {
      category: "Payment Security",
      question: "How secure are my payments and personal data?",
      answer: "We use bank-level encryption and are PCI DSS compliant. All transactions are processed through secure payment gateways. We never store your full card details, and your personal data is protected according to international privacy standards. Your trust is our priority."
    },
    {
      category: "Order Minimums",
      question: "Is there a minimum order value?",
      answer: "No minimum order! Whether you need just a bottle of water or a full grocery haul, we'll deliver it in 10 minutes for the same ₦1,500 fee. Perfect for those emergency items or when you just need a few things."
    },
    {
      category: "Product Quality",
      question: "What if I'm not satisfied with the products?",
      answer: "We guarantee fresh, quality products. If anything doesn't meet your standards, contact us immediately for a full refund or replacement. Our professional shoppers are trained to select the best items, and we have a 99.5% customer satisfaction rate."
    },
    {
      category: "Voice Ordering",
      question: "What languages does Jara AI understand?",
      answer: "Jara understands English, Pidgin English, Hausa, Yoruba, and Igbo. You can mix languages in the same sentence - whatever feels natural to you. The AI is trained on Nigerian speech patterns and local product names."
    },
    {
      category: "Operating Hours",
      question: "What are your operating hours?",
      answer: "We operate 24/7 in Gwarinpa! Yes, that means you can get groceries delivered at 2 AM if needed. Our night service covers emergencies, late-night cravings, and early morning needs. The 10-minute guarantee applies around the clock."
    },
    {
      category: "Technical Issues",
      question: "What if the app doesn't understand my request?",
      answer: "If Jara doesn't understand your request, you can rephrase it, take a photo of what you need, or type it out. Our customer support team is available 24/7 to help via phone or chat. We're constantly improving the AI based on user feedback."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
      <section id="faq" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked <span className="text-[#ff0023]">Questions</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about Jaranow's 10-minute grocery delivery service
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors duration-200"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                      {faq.category}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                        <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: faq.answer }}>
                        </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still Have Questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div
              className="bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl p-8 border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still Have Questions?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our team is available 24/7 to help you with any questions about Jaranow's services, 
              pricing, or how our AI shopping works.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-3 bg-white rounded-lg px-6 py-3 border border-red-200">
                <div className="text-[#ff0023]">💬</div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Live Chat</div>
                  <div className="text-sm text-gray-600">Available 24/7</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white rounded-lg px-6 py-3 border border-blue-200">
                <div className="text-blue-600">📱</div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">WhatsApp</div>
                  <div className="text-sm text-gray-600">+234 903 862 2012</div>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white rounded-lg px-6 py-3 border border-purple-200">
                <div className="text-purple-600">📧</div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Email</div>
                  <div className="text-sm text-gray-600">support@jaranow.com</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;