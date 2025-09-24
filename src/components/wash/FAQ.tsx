import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "Which areas in Abuja do you deliver to?",
    answer: "We offer FREE pickup and delivery in Gwarinpa, Kubwa, Dutse, Jahi, Life Camp, Maitama, Jabi, Mpape, and Katampe (Main & Extension). For other areas like Lugbe, Apo, Wuse, Garki, and Asokoro, we charge a shared delivery cost that's split among customers in your zone (capped at ₦3,000)."
  },
  {
    question: "How do you calculate delivery costs for areas outside the free zones?",
    answer: "For areas outside our free delivery zones, we use a cost-sharing model. The total delivery cost for your zone is divided by the number of scheduled pickups that day. For example, if 5 customers are scheduled in Lugbe and the zone cost is ₦8,000, each customer pays ₦1,600. The maximum you'll ever pay is ₦3,000 per delivery."
  },
  {
    question: "What days can I schedule pickup and delivery?",
    answer: "Lite Plan members can schedule pickups on Tuesdays and Saturdays, with delivery 48 hours later. Premium Plan members have more flexibility with pickups on Tuesdays, Thursdays, and Saturdays, plus priority same-day service when scheduled before 10 AM."
  },
  {
    question: "How quickly will I get my clothes back?",
    answer: "Our standard turnaround is 48 hours. Premium subscribers can request same-day service when scheduled before 10 AM. We'll always confirm your delivery time during pickup and send you tracking updates via SMS and email."
  },
  {
    question: "What happens if I'm not satisfied with the service?",
    answer: "We offer a 100% satisfaction guarantee! If you're not completely happy, we'll re-clean your items for free or provide a full refund. Our customer success team will personally follow up within 2 hours of delivery to ensure everything meets your expectations."
  },
  {
    question: "Can I pause or modify my subscription?",
    answer: "Absolutely! Life happens, and we're flexible. You can pause your subscription anytime through the app or by calling us. You can also upgrade/downgrade between Lite and Premium plans, or adjust your pickup schedule to better fit your needs. No penalties, no hassles."
  },
  {
    question: "How do I know where my clothes are during the cleaning process?",
    answer: "Every item is tagged with a unique ID when we pick it up. You'll receive SMS and email updates at each stage: pickup confirmed, cleaning in progress, quality check complete, and out for delivery. You can also track your order real-time through our mobile app."
  },
  {
    question: "What if my clothes get damaged or lost?",
    answer: "While extremely rare, we're fully insured for such incidents. We take photos during pickup, handle each item with expert care, and have strict quality control processes. If anything happens, we'll compensate you fairly and immediately investigate to prevent future occurrences."
  },
  {
    question: "Do I need to be home during pickup and delivery?",
    answer: "Not necessarily! We can arrange pickup from your doorman, security, or a trusted neighbor. Just let us know your preferred arrangement when scheduling. We'll always confirm the plan with you and send real-time updates when our team is en route."
  },
  {
    question: "How do I contact customer support if I need help?",
    answer: "We're here to help! You can reach us via phone (7 AM - 8 PM, Mon-Sat), WhatsApp (response within 15 minutes), email (response within 2 hours), or in-app chat. Every customer gets a dedicated success manager during their first month for personalized support."
  },
  {
    question: "Can I request specific handling for delicate or expensive items?",
    answer: "Yes! Premium Plan members get expert care for suits, formal wear, duvets, curtains, and other special items. For both plans, you can add special instructions during scheduling or mention them to our pickup team. We're trained in professional fabric care for all garment types."
  },
  {
    question: "What happens if you miss my scheduled pickup?",
    answer: "If we miss your pickup (which is extremely rare), we'll contact you within 30 minutes to reschedule, complete the pickup within 24 hours, and provide a service credit as an apology. Your satisfaction is our priority, and we'll make it right immediately."
  }
]

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 sm:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-4 font-graphik-bold">
            Frequently Asked <span className="text-primary-600">Questions</span>
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Jaranow wash's premium laundry service.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-100 transition-colors duration-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-8">
                  {faq.question}
                </h3>
                <motion.svg
                  className="w-6 h-6 text-primary-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
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
                    <div className="px-8 pb-6">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="bg-primary-50 border border-primary-200 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our customer support team is here to help you 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:hello@jaranow.com"
                className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Support
              </a>
              <a
                href="https://wa.me/2349038622012"
                className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.700"/>
                </svg>
                WhatsApp Chat
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;