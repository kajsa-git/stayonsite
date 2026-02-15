
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare } from 'lucide-react';

interface InquiryFormFieldsProps {
  isSubmitting: boolean;
}

const InquiryFormFields = ({
  isSubmitting
}: InquiryFormFieldsProps) => {
  const { t, language } = useLanguage();

  return (
    <>
      {/* FormSubmit.co configuration */}
      <input type="hidden" name="_subject" value="Ny förfrågan från StayOnSite" />
      <input type="hidden" name="_next" value={typeof window !== 'undefined' ? window.location.origin : 'https://www.stayonsite.se'} />
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="_template" value="table" />

      <div className="space-y-5 md:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="font-light text-nordic-800">
            <span className="flex items-center gap-2">
              <Mail size={16} className="text-nordic-500" />
              {t('inquiry.form.email')}
            </span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="email@example.com"
            className="h-12 border-nordic-200 focus-visible:ring-nordic-400 font-light"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="font-light text-nordic-800">
            <span className="flex items-center gap-2">
              <MessageSquare size={16} className="text-nordic-500" />
              {t('inquiry.form.message')}
            </span>
          </Label>
          <Textarea
            id="message"
            name="message"
            rows={5}
            required
            minLength={10}
            enterKeyHint="send"
            placeholder={language === 'sv' ? "Berätta om ert behov av boende..." : language === 'en' ? "Tell us about your accommodation needs..." : "Opowiedz nam o swoich potrzebach zakwaterowania..."}
            className="min-h-[140px] md:min-h-[220px] border-nordic-200 focus-visible:ring-nordic-400 font-light resize-none"
          />
        </div>

        <Button
          type="submit"
          className="w-full px-8 h-12 md:h-14 bg-gradient-to-r from-[#ff6300] to-[#ff8533] hover:shadow-[#ff6300]/40 text-white font-bold rounded-full transition-all duration-300 shadow-xl active:scale-[0.98]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {language === 'sv' ? "Skickar..." : language === 'en' ? "Sending..." : "Wysyłanie..."}
            </span>
          ) : (
            t('inquiry.form.submit')
          )}
        </Button>

      </div>
    </>
  );
};

export default InquiryFormFields;
