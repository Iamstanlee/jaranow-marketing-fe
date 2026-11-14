import React from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight} from 'lucide-react';
import {btn, CtaBand, Lift, whatsappUrl} from '../common/ui';

const ClosingCta: React.FC = () => {
    return (
        <CtaBand
            title="Ready when you are."
            body="Bring your car to 6th Avenue, Gwarinpa today, or send us a WhatsApp message and we will arrange your first laundry pickup."
        >
            <Lift>
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={`${btn.paper} group w-full`}>
                    Message us on WhatsApp
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5"/>
                </a>
            </Lift>
            <Lift>
                <Link to="/pricing" className={`${btn.ghostOnAccent} w-full`}>
                    See all prices
                </Link>
            </Lift>
        </CtaBand>
    );
};

export default ClosingCta;
