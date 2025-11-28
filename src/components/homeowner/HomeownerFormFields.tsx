import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface HomeownerFormFieldsProps {
  isSubmitting: boolean;
}

const HomeownerFormFields = ({ isSubmitting }: HomeownerFormFieldsProps) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Form header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-nordic-900 mb-2">
          {t('homeowner.form.fieldsTitle')}
        </h3>
        <p className="text-nordic-700 font-light">
          {t('homeowner.form.fieldsSubtitle')}
        </p>
      </div>

      {/* Form fields */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-nordic-800 font-medium">
            {t('homeowner.form.firstName')}
          </Label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            required
            className="bg-gray-50 border-gray-200 focus:border-[#ff6300] focus:ring-[#ff6300]"
            placeholder={t('homeowner.form.firstNamePlaceholder')}
          />
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-nordic-800 font-medium">
            {t('homeowner.form.lastName')}
          </Label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            required
            className="bg-gray-50 border-gray-200 focus:border-[#ff6300] focus:ring-[#ff6300]"
            placeholder={t('homeowner.form.lastNamePlaceholder')}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-nordic-800 font-medium">
            {t('homeowner.form.email')}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="bg-gray-50 border-gray-200 focus:border-[#ff6300] focus:ring-[#ff6300]"
            placeholder={t('homeowner.form.emailPlaceholder')}
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-nordic-800 font-medium">
            {t('homeowner.form.phone')}
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            className="bg-gray-50 border-gray-200 focus:border-[#ff6300] focus:ring-[#ff6300]"
            placeholder={t('homeowner.form.phonePlaceholder')}
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-nordic-800 font-medium">
            {t('homeowner.form.address')}
          </Label>
          <Input
            id="address"
            name="address"
            type="text"
            required
            className="bg-gray-50 border-gray-200 focus:border-[#ff6300] focus:ring-[#ff6300]"
            placeholder={t('homeowner.form.addressPlaceholder')}
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city" className="text-nordic-800 font-medium">
            {t('homeowner.form.city')}
          </Label>
          <Input
            id="city"
            name="city"
            type="text"
            required
            className="bg-gray-50 border-gray-200 focus:border-[#ff6300] focus:ring-[#ff6300]"
            placeholder={t('homeowner.form.cityPlaceholder')}
          />
        </div>
      </div>

      {/* Submit button */}
      <div className="pt-6">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-light text-sm md:text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('homeowner.form.submitting')}
            </div>
          ) : (
            <>
              Det tar bara två minuter
              <br />
              Vi hjälper dig hitta rätt hyresgäst
            </>
          )}
        </Button>
      </div>

      {/* Additional info */}
      <div className="text-center pt-4">
        <p className="text-sm text-nordic-600 font-light">
          {t('homeowner.form.disclaimer')}
        </p>
      </div>
    </>
  );
};

export default HomeownerFormFields;