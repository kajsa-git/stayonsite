import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Send, Phone } from 'lucide-react';

interface HomeownerFormFieldsProps {
  isSubmitting: boolean;
}

const HomeownerFormFields = ({ isSubmitting }: HomeownerFormFieldsProps) => {
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 md:space-y-8"
    >
      <div className="space-y-4 md:space-y-6">
        {/* Phone */}
        <motion.div variants={itemVariants} className="space-y-3">
          <Label htmlFor="phone" className="text-primary/60 font-bold uppercase tracking-widest text-[10px] ml-1">
            {t('homeowner.form.phone')}
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            className="h-[3.25rem] md:h-16 px-4 md:px-5 rounded-xl md:rounded-2xl bg-white border-primary/10 focus:border-accent shadow-sm transition-all duration-300 text-primary text-base md:text-lg font-medium placeholder:text-primary/30"
            placeholder={t('homeowner.form.phonePlaceholder')}
          />
        </motion.div>

        {/* City */}
        <motion.div variants={itemVariants} className="space-y-3">
          <Label htmlFor="city" className="text-primary/60 font-bold uppercase tracking-widest text-[10px] ml-1">
            {t('homeowner.form.city')}
          </Label>
          <Input
            id="city"
            name="city"
            type="text"
            required
            autoComplete="address-level2"
            className="h-[3.25rem] md:h-16 px-4 md:px-5 rounded-xl md:rounded-2xl bg-white border-primary/10 focus:border-accent shadow-sm transition-all duration-300 text-primary text-base md:text-lg font-medium placeholder:text-primary/30"
            placeholder={t('homeowner.form.cityPlaceholder')}
          />
        </motion.div>
      </div>

      {/* Submit button */}
      <motion.div variants={itemVariants}>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-[#ff6300] to-[#ff8533] hover:shadow-[#ff6300]/40 text-white font-bold h-14 md:h-18 rounded-xl md:rounded-2xl shadow-xl transition-all duration-500 hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-4 group overflow-hidden relative"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg md:text-xl font-bold">{t('homeowner.form.submitting')}</span>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <span className="text-lg md:text-xl font-bold leading-tight">{t('homeowner.form.submitLine1')}</span>
                <span className="text-xs md:text-sm font-medium text-white/80">{t('homeowner.form.submitLine2')}</span>
              </div>
              <Send size={22} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </>
          )}
        </Button>
      </motion.div>

      {/* Or call directly */}
      <motion.div variants={itemVariants} className="text-center">
        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px bg-primary/10" />
          <span className="text-xs text-primary/40 font-bold uppercase tracking-widest">
            {t('homeowner.form.disclaimer')}
          </span>
          <div className="flex-1 h-px bg-primary/10" />
        </div>

        <a
          href="tel:+46762498486"
          className="group inline-flex items-center gap-3 text-primary/60 hover:text-accent font-bold transition-colors duration-300 mt-2"
        >
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
            <Phone size={18} />
          </div>
          <span className="text-lg">076-249 84 86</span>
        </a>
      </motion.div>
    </motion.div>
  );
};

export default HomeownerFormFields;
