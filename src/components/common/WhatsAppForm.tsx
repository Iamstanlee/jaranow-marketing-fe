import React from 'react';
import EnquiryForm, {type EnquiryFormProps, type FormField} from './EnquiryForm';
import {openWhatsApp} from './ui';
import {trackLead} from '../../utils/metaPixel';

export type {FormField};

interface WhatsAppFormProps extends Omit<EnquiryFormProps, 'onSubmit' | 'failure'> {
    /** First line of the WhatsApp message, e.g. "Hi Jaranow! I'd like a fleet quote." */
    intro: string;
    /** Names this form in the Meta Pixel Lead event, e.g. "Rug pickup". */
    leadName: string;
}

const WhatsAppForm: React.FC<WhatsAppFormProps> = ({intro, leadName, fields, ...rest}) => (
    <EnquiryForm
        {...rest}
        fields={fields}
        onSubmit={(values) => {
            const lines = fields.filter((f) => values[f.name]).map((f) => `${f.label}: ${values[f.name]}`);
            trackLead(leadName);
            openWhatsApp(`${intro}\n\n${lines.join('\n')}`);
        }}
    />
);

export default WhatsAppForm;
