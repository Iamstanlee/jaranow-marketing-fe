import React from 'react';
import {motion} from 'framer-motion';
import {ArrowRight, CalendarDays, Clock, MessageCircle, Shirt} from 'lucide-react';
import {fadeInUp, staggerContainer} from '../../utils/animations';
import {btn, Container, Eyebrow, FactPanel, InkBackdrop} from '../common/ui';

interface HeroProps {
  onSchedulePickup: () => void;
  onFindPlan?: () => void;
}

const facts = [
  {icon: <CalendarDays size={17} />, label: 'Pickup days', value: 'Tuesday & Saturday · Thursday too on Premium'},
  {icon: <Clock size={17} />, label: 'Turnaround', value: 'Back within 48 hours of pickup'},
  {icon: <Shirt size={17} />, label: 'Included', value: 'Washed, dried, ironed and folded'},
  {icon: <MessageCircle size={17} />, label: 'Arranged on', value: 'WhatsApp - no app, no account'},
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
            <motion.div variants={fadeInUp}>
              <Eyebrow tone="dark">Laundry by Jaranow · Abuja</Eyebrow>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="heading-display mt-6 text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl"
            >
              Laundry, off your list<span className="text-primary-600">.</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="mt-7 max-w-xl text-lg leading-relaxed text-paper/75 sm:text-xl">
              We collect from your door, sort, wash, iron and fold, and bring it back within 48 hours. Every item is
              checked before it leaves us.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-10 flex flex-col gap-3 sm:flex-row">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <button onClick={onSchedulePickup} className={`${btn.primary} group w-full`}>
                  See the plans
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
