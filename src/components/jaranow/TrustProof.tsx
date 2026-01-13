import React from 'react';
import { motion } from 'framer-motion';
import { Users, Award, Shield, Star, Briefcase, MapPin } from 'lucide-react';

const TrustProof: React.FC = () => {
  const founders = [
    {
      name: "Stanley Akpama",
      role: "CEO & Co-Founder",
      bio: "Serial Entreprenuer & Former Engineer at Moniepoint with 5+ years in fintech.",
      experience: "Serial Entreprenuer, Product Engineer(Ex-Moniepoint, OurPass)",
      expertise: "Fintech & Scalable Systems",
      image: "👨🏾‍💼" // Placeholder - would be actual image
    },
    {
      name: "Timothy Ofie", 
      role: "CTO & Co-Founder",
      bio: "Technology leader with extensive fintech background. Expert in AI/ML systems and mobile-first product development.",
      experience: "Fintech Veteran",
      expertise: "AI/ML & Product Development", 
      image: "👨🏾‍💻" // Placeholder - would be actual image
    }
  ];

  const testimonials = [
    {
      name: "Adaora Okafor",
      role: "Marketing Manager, Abuja",
      comment: "Jaranow has completely transformed how I shop. I just tell Jara what I need on my way home from work, and everything is waiting for me in exactly 10 minutes!",
      rating: 5
    },
    {
      name: "Emeka Nwachukwu", 
      role: "Software Developer, Gwarinpa",
      comment: "The AI is incredibly accurate. I took a photo of my shopping list and it got everything right, even the brands I prefer. This is the future of grocery shopping.",
      rating: 5
    },
    {
      name: "Fatima Hassan",
      role: "Business Owner, Abuja", 
      comment: "As a busy mom and entrepreneur, Jaranow saves me hours every week. The quality is perfect and the delivery is always on time. Worth every naira!",
      rating: 5
    }
  ];

  const certifications = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Payment Security",
      description: "PCI DSS Compliant"
    },
    {
      icon: <Award className="w-8 h-8 text-[#2563eb]" />,
      title: "Food Safety",
      description: "NAFDAC Registered"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600" />,
      title: "Customer Trust", 
      description: "4.9/5 Rating"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Trusted by <span className="text-[#2563eb]">Thousands</span> of Nigerians
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built by experienced fintech leaders who understand Nigerian consumer needs
          </p>
        </motion.div>

        {/* Founders Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-12 text-center">
            Meet the Founders
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {founders.map((founder, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{founder.image}</div>
                  <h4 className="text-2xl font-bold text-gray-900">{founder.name}</h4>
                  <p className="text-[#2563eb] font-semibold">{founder.role}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700 font-medium">{founder.experience}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-[#2563eb]" />
                    <span className="text-gray-700 font-medium">{founder.expertise}</span>
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed">{founder.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Customer Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-12 text-center">
            What Our Customers Say
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Star Rating */}
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, starIndex) => (
                    <Star key={starIndex} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.comment}"
                </p>

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-12 text-center">
            Security & Certifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center bg-gray-50 rounded-xl p-6 border border-gray-100"
              >
                <div className="flex justify-center mb-4">{cert.icon}</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{cert.title}</h4>
                <p className="text-gray-600">{cert.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-8 border border-primary-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Have Questions? We're Here to Help
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our team is available 24/7 to answer your questions and ensure you have the best experience with Jaranow.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-white rounded-lg p-4 border border-primary-200">
                <h4 className="font-semibold text-gray-900 mb-2">📧 Email Support</h4>
                <p className="text-[#2563eb] font-medium">support@jaranow.com</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-primary-200">
                <h4 className="font-semibold text-gray-900 mb-2">📱 Phone Support</h4>
                <p className="text-[#2563eb] font-medium">+234 903 862 2012</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Based in Abuja, Nigeria • Expanding Nationwide</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustProof;