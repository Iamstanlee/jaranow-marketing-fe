import React from 'react';
import {motion} from 'framer-motion';
import {ArrowRight, CalendarDays, Clock, MessageCircle, Shirt} from 'lucide-react';
import {fadeInUp, staggerContainer} from '../../utils/animations';
import {btn, Container, FactPanel, HeroTitle, InkBackdrop} from '../common/ui';

interface HeroProps {
  onSchedulePickup: () => void;
  onFindPlan?: () => void;
}

const facts = [
  {icon: <CalendarDays size={17} />, label: 'Pickup days', value: 'Tuesday & Saturday · Thursday too on Premium'},
  {icon: <Clock size={17} />, label: 'Turnaround', value: 'Back at your door within 48 hours'},
  {icon: <Shirt size={17} />, label: 'Included', value: 'Washed, dried, ironed and folded'},
  {icon: <MessageCircle size={17} />, label: 'Arranged on', value: 'WhatsApp - pickups, changes, questions'},
];

const Hero: React.FC<HeroProps> = ({ onSchedulePickup, onFindPlan }) => {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <InkBackdrop />

      <Container className="relative pt-32 pb-20 sm:pt-40 lg:pb-28">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-14 lg:grid-cols-12 lg:items-end lg:gap-12"
        >
          <div className="lg:col-span-7">
            <HeroTitle kicker="Laundry pickup & delivery in Abuja">
              Laundry, off your list<span className="text-primary-600">.</span>
            </HeroTitle>

            <motion.p variants={fadeInUp} className="mt-7 max-w-xl text-lg leading-relaxed text-paper/75 sm:text-xl">
              We collect from your door, wash, iron and fold, and have everything back with you within 48 hours.
              Choose a monthly plan or pay per item - all arranged on WhatsApp.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-10 flex flex-col gap-3 sm:flex-row">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <button onClick={onSchedulePickup} className={`${btn.primary} group w-full`}>
                  See plans and prices
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </motion.div>
              {onFindPlan && (
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <button onClick={onFindPlan} className={`${btn.ghostOnDark} w-full`}>
                    Help me choose
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>

          <motion.div variants={fadeInUp} className="lg:col-span-5">
            <FactPanel facts={facts} />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default Hero;
