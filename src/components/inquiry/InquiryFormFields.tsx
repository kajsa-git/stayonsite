
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Mail, Phone, MapPin, Users, MessageSquare, Building2 } from 'lucide-react';

interface InquiryFormFieldsProps {
  isSubmitting: boolean;
  isUntilFurtherNotice: boolean;
  onUntilFurtherNoticeChange: (checked: boolean) => void;
}

const InquiryFormFields = ({ 
  isSubmitting, 
  isUntilFurtherNotice, 
  onUntilFurtherNoticeChange 
}: InquiryFormFieldsProps) => {
  const { t, language } = useLanguage();
  
  return (
    <>
      {/* FormSubmit.co configuration */}
      <input type="hidden" name="_subject" value="Ny förfrågan från StayOnSite" />
      <input type="hidden" name="_next" value={window.location.origin} />
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="_template" value="table" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-2.5">
          <Label htmlFor="companyName" className="font-light text-nordic-800">
            <span className="flex items-center gap-2">
              <Building2 size={16} className="text-nordic-500" />
              {t('inquiry.form.companyName')}
            </span>
          </Label>
          <Input id="companyName" name="companyName" type="text" required placeholder={t('inquiry.form.companyName')} className="border-nordic-200 focus-visible:ring-nordic-400 font-light" />
        </div>
        
        <div className="space-y-2.5">
          <Label htmlFor="contactName" className="font-light text-nordic-800">
            <span className="flex items-center gap-2">
              <Users size={16} className="text-nordic-500" />
              {t('inquiry.form.contactName')}
            </span>
          </Label>
          <Input id="contactName" name="contactName" type="text" required placeholder={t('inquiry.form.contactName')} className="border-nordic-200 focus-visible:ring-nordic-400 font-light" />
        </div>
        
        <div className="space-y-2.5">
          <Label htmlFor="email" className="font-light text-nordic-800">
            <span className="flex items-center gap-2">
              <Mail size={16} className="text-nordic-500" />
              {t('inquiry.form.email')}
            </span>
          </Label>
          <Input id="email" name="email" type="email" required placeholder="email@example.com" className="border-nordic-200 focus-visible:ring-nordic-400 font-light" />
        </div>
        
        <div className="space-y-2.5">
          <Label htmlFor="phone" className="font-light text-nordic-800">
            <span className="flex items-center gap-2">
              <Phone size={16} className="text-nordic-500" />
              {t('inquiry.form.phone')}
            </span>
          </Label>
          <Input id="phone" name="phone" type="tel" required placeholder="+46 70 123 45 67" className="border-nordic-200 focus-visible:ring-nordic-400 font-light" />
        </div>
        
        <div className="space-y-2.5">
          <Label htmlFor="location" className="font-light text-nordic-800">
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-nordic-500" />
              {t('inquiry.form.location')}
            </span>
          </Label>
          <Input id="location" name="location" type="text" required placeholder={language === 'sv' ? "Ex. Göteborg" : "E.g. Gothenburg"} className="border-nordic-200 focus-visible:ring-nordic-400 font-light" />
        </div>
        
        <div className="space-y-2.5">
          <Label htmlFor="workers" className="font-light text-nordic-800">
            <span className="flex items-center gap-2">
              <Users size={16} className="text-nordic-500" />
              {t('inquiry.form.workers')}
            </span>
          </Label>
          <Input id="workers" name="workers" type="number" required min="1" placeholder="" className="border-nordic-200 focus-visible:ring-nordic-400 font-light" />
        </div>
        
        <div className="space-y-2.5">
          <Label htmlFor="startDate" className="font-light text-nordic-800">
            <span className="flex items-center gap-2">
              <Calendar size={16} className="text-nordic-500" />
              {t('inquiry.form.startDate')}
            </span>
          </Label>
          <Input id="startDate" name="startDate" type="date" required className="border-nordic-200 focus-visible:ring-nordic-400 font-light" />
        </div>
        
        <div className="space-y-2.5">
          <Label htmlFor="endDate" className="font-light text-nordic-800">
            <span className="flex items-center gap-2">
              <Calendar size={16} className="text-nordic-500" />
              {t('inquiry.form.endDate')}
            </span>
          </Label>
          {isUntilFurtherNotice ? (
            <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50 border-nordic-200 text-muted-foreground">
              {t('inquiry.form.untilFurtherNotice')}
            </div>
          ) : (
            <Input 
              id="endDate" 
              name="endDate" 
              type="date" 
              required={!isUntilFurtherNotice}
              disabled={isUntilFurtherNotice}
              className="border-nordic-200 focus-visible:ring-nordic-400 font-light" 
            />
          )}
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox 
              id="untilFurtherNotice" 
              checked={isUntilFurtherNotice}
              onCheckedChange={(checked) => {
                onUntilFurtherNoticeChange(checked === true);
              }}
            />
            <label
              htmlFor="untilFurtherNotice"
              className="text-sm font-light text-muted-foreground leading-none cursor-pointer"
            >
              {t('inquiry.form.untilFurtherNotice')}
            </label>
          </div>
        </div>
      </div>
      
      <div className="space-y-2.5">
        <Label htmlFor="message" className="font-light text-nordic-800">
          <span className="flex items-center gap-2">
            <MessageSquare size={16} className="text-nordic-500" />
            {t('inquiry.form.message')}
          </span>
        </Label>
        <Textarea 
          id="message" 
          name="message" 
          rows={4} 
          placeholder={language === 'sv' ? "Beskriv era behov..." : "Describe your needs..."} 
          className="border-nordic-200 focus-visible:ring-nordic-400 font-light resize-none" 
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full md:w-auto px-8 py-2.5 h-auto bg-nordic-500 hover:bg-nordic-600 text-white font-light rounded-md transition-colors duration-500" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {language === 'sv' ? "Skickar..." : "Sending..."}
          </span>
        ) : (
          t('inquiry.form.submit')
        )}
      </Button>
    </>
  );
};

export default InquiryFormFields;
