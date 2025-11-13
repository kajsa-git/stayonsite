# StayOnSite Founder Messaging - Implementation Guide
## Copy Examples & Code Changes

---

## Part 1: Footer Signature Implementation

### Current Footer Code
File: `/src/components/Footer.tsx`

The footer currently ends with:
```typescript
<div className="mt-16 pt-8 text-center text-white/50 border-t border-white/10">
  <p className="font-light">&copy; {currentYear} StayOnSite. {t('footer.rights')}.</p>
</div>
```

---

### Option 1: Add Founder Signature (RECOMMENDED)

**Step 1: Add translations to `/src/data/translations.ts`**

After line ~314 (after 'footer.description'), add:

```typescript
| 'footer.signature'

// In the sv object (around line 315):
'footer.signature': 'Med omsorg från StayOnSite.\nKajsa & Natalie',

// In the en object (around line ~450-500):
'footer.signature': 'With care from StayOnSite.\nKajsa & Natalie',

// In the pl object (around line ~550-600):
'footer.signature': 'Z troską od StayOnSite.\nKajsa & Natalie',
```

**Step 2: Update Footer.tsx component**

Replace the copyright section:

```typescript
<div className="mt-16 pt-8 text-center text-white/50 border-t border-white/10">
  <p className="font-light">&copy; {currentYear} StayOnSite. {t('footer.rights')}.</p>
  <p className="font-light mt-4 text-white/40 whitespace-pre-line">{t('footer.signature')}</p>
</div>
```

**Why `whitespace-pre-line`?** Preserves the line break in "Med omsorg..." | "Kajsa & Natalie" format.

---

### Option 2: Also Add to Email Footers

**For transactional emails** (inquiry confirmations, follow-up emails):

Add this footer HTML to your email template:

```html
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 40px; border-top: 1px solid #f0f0f0; padding-top: 20px;">
  <tr>
    <td style="text-align: center; font-size: 14px; color: #999; font-weight: 300; line-height: 1.5;">
      Med omsorg från StayOnSite.<br>
      Kajsa & Natalie
    </td>
  </tr>
</table>
```

(Adjust language based on recipient's language preference)

---

## Part 2: Services Section Enhancement

### Current Services Copy (from translations.ts)

```typescript
'services.process.step1.title': 'Skicka förfrågan',
'services.process.step1.description': 'Fyll i vårt enkla formulär med detaljer om era behov',

'services.process.step2.title': 'Snabbt svar',
'services.process.step2.description': 'Vi svarar snabbt via mail eller SMS med alternativ',

'services.process.step3.title': 'Bekräftelse',
'services.process.step3.description': 'Välj det alternativ som passar er bäst, och vi bokar det åt er',

'services.process.step4.title': 'Inflyttning',
'services.process.step4.description': 'Era arbetare får all information de behöver för en smidig inflyttning',
```

---

### IMPLEMENTATION OPTION A: Enhanced Step Descriptions

**Update `/src/data/translations.ts` - Swedish version:**

```typescript
'services.process.step1.description': 'Fyll i vårt enkla formulär med detaljer om era behov. Kajsa eller Natalie läser det direkt.',

'services.process.step2.description': 'Kajsa eller Natalie ringer dig eller skriver SMS med alternativ från lokala värdar. Ingen väntekö.',

'services.process.step3.description': 'Du väljer, och vi bokningsbekräftar samma dag. Samma person som svarade håller tråden åt dig.',

'services.process.step4.description': 'Din personal får all info de behöver. Och vi? Vi är bara en SMS bort om något kommer upp under projektet.',
```

**English version:**

```typescript
'services.process.step1.description': 'Fill in our simple form with details about your needs. Kajsa or Natalie reviews it directly.',

'services.process.step2.description': 'Kajsa or Natalie calls or texts you with options from local hosts. No queue.',

'services.process.step3.description': 'You choose, we confirm same day. The same person who answered keeps you updated.',

'services.process.step4.description': 'Your workers get all the info they need. And us? We're just one SMS away if anything comes up during the project.',
```

**Polish version:**

```typescript
'services.process.step1.description': 'Wypełnij nasz prosty formularz ze szczegółami Twoich potrzeb. Kajsa lub Natalie czytają to bezpośrednio.',

'services.process.step2.description': 'Kajsa lub Natalie dzwoni lub wysyła SMS z opcjami od lokalnych gospodarzy. Brak kolejki.',

'services.process.step3.description': 'Wybierasz, potwierdzamy tego samego dnia. Ta sama osoba, która odpowiedziała, trzyma się tego dla Ciebie.',

'services.process.step4.description': 'Twoi pracownicy otrzymają wszystkie potrzebne informacje. A my? Jesteśmy tylko jedną wiadomością SMS jeśli coś się pojawi podczas projektu.',
```

**No code changes needed in Services.tsx** - it already uses the translations, so update translations.ts and they auto-populate.

---

### IMPLEMENTATION OPTION B: Add Narrative Section

**Step 1: Add to translations.ts**

```typescript
| 'services.foundersContext.title'
| 'services.foundersContext.description'

// Swedish:
'services.foundersContext.title': 'Varför blir det snabbare än vanligt?',
'services.foundersContext.description': 'Kajsa och Natalie äger dessa processer helt. Ingen väntekö på beslut. Ingen "låt mig checka med min chef". Ni pratar med dem som fattar besluten, direkt.\n\nDet innebär att när ni ringer på tisdag kl 14 och behöver 20 platser för fredag, så blir det inte "vi återkommer". Det blir "vi kollar lokalt och ringer dig om 30 minuter".',

// English:
'services.foundersContext.title': 'Why does it happen faster than usual?',
'services.foundersContext.description': 'Kajsa and Natalie own these processes entirely. No decision queue. No "let me check with my manager." You speak directly with the people who make decisions.\n\nThat means when you call on Tuesday at 2 PM needing 20 beds by Friday, it\'s not "we\'ll get back to you." It\'s "we\'re checking locally and calling you in 30 minutes."',
```

**Step 2: Update Services.tsx**

After the step cards loop (after line 83), add:

```typescript
<div className="mt-16 p-8 md:p-10 mx-auto max-w-3xl bg-gradient-to-r from-blue-50 to-white rounded-3xl border border-blue-100">
  <h3 className="text-2xl font-semibold text-nordic-900 mb-4">
    {t('services.foundersContext.title')}
  </h3>
  <p className="text-nordic-700 leading-relaxed font-light whitespace-pre-line">
    {t('services.foundersContext.description')}
  </p>
</div>
```

Place this **before** the existing security section (the one with the padlock image at line 85).

---

### IMPLEMENTATION OPTION C: Add Founder Cards

**Only implement if you have professional headshots of Kajsa and Natalie**

**Step 1: Add to translations.ts**

```typescript
| 'services.founders.title'
| 'services.founders.subtitle'
| 'services.founders.quote'

// Swedish:
'services.founders.title': 'Kajsa & Natalie',
'services.founders.subtitle': 'Drivkraften bakom snabba beslut',
'services.founders.quote': 'Vi äger varje projekt från dag ett. Ni pratar med oss direkt – inte nästa person i kön.',

// English:
'services.founders.title': 'Kajsa & Natalie',
'services.founders.subtitle': 'The force behind fast decisions',
'services.founders.quote': 'We own every project from day one. You talk to us directly—not the next person in the queue.',
```

**Step 2: Create FounderIntro component**

Create file: `/src/components/FounderIntro.tsx`

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

const FounderIntro = () => {
  const { t } = useLanguage();

  return (
    <section className="section-spacing bg-white">
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-nordic-900">
              {t('services.founders.title')}
            </h2>
            <p className="text-lg text-[#ff6300] font-light mt-2">
              {t('services.founders.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-3xl mx-auto">
            {/* Left: Images */}
            <div className="flex justify-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-[#ff6300]/20 shadow-lg">
                  <img
                    alt="Kajsa"
                    className="w-full h-full object-cover"
                    src="/lovable-uploads/[KAJSA_IMAGE_ID].jpg"
                  />
                </div>
              </div>
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-[#ff6300]/20 shadow-lg">
                  <img
                    alt="Natalie"
                    className="w-full h-full object-cover"
                    src="/lovable-uploads/[NATALIE_IMAGE_ID].jpg"
                  />
                </div>
              </div>
            </div>

            {/* Right: Quote */}
            <div className="text-center md:text-left">
              <blockquote className="text-xl md:text-2xl font-light text-nordic-900 italic leading-relaxed mb-6">
                "{t('services.founders.quote')}"
              </blockquote>
              <p className="text-nordic-700 font-light">
                Kajsa & Natalie, Founders
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderIntro;
```

**Step 3: Add to Services.tsx imports and layout**

In `/src/components/Services.tsx`, add:

```typescript
import FounderIntro from './FounderIntro';
```

Then in the Services component's JSX (after the process steps section, before the closing `</section>`):

```typescript
<FounderIntro />
```

**Note:** Replace `[KAJSA_IMAGE_ID]` and `[NATALIE_IMAGE_ID]` with actual image IDs from your Lovable uploads.

---

## Part 3: Email Template Updates

### If You Use a Service Like Sendgrid, Mailchimp, or Similar

**Add this footer to your base email template:**

```html
<!-- Founder Signature Footer -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 40px; border-top: 1px solid #efefef; padding-top: 24px;">
  <tr>
    <td style="text-align: center;">
      <p style="font-size: 13px; color: #777; font-weight: 300; line-height: 1.6; margin: 0; font-family: Arial, sans-serif;">
        Med omsorg från StayOnSite.<br>
        <strong style="color: #333;">Kajsa & Natalie</strong>
      </p>
    </td>
  </tr>
</table>
```

### For Dynamic Language Support

If your emails support language variables, wrap in conditional:

```html
{% if language == 'sv' %}
  <p style="...">Med omsorg från StayOnSite.<br><strong>Kajsa & Natalie</strong></p>
{% elsif language == 'en' %}
  <p style="...">With care from StayOnSite.<br><strong>Kajsa & Natalie</strong></p>
{% elsif language == 'pl' %}
  <p style="...">Z troską od StayOnSite.<br><strong>Kajsa & Natalie</strong></p>
{% endif %}
```

---

## Part 4: Testing & Rollout Plan

### Phase 1: Low-Risk Implementation (Day 1)

**Changes needed:**
- Update `translations.ts` with footer signature + Services Option A descriptions
- Update `Footer.tsx` to display signature
- Rebuild and deploy

**Testing:**
- [ ] Footer displays correctly in Swedish, English, Polish
- [ ] No text overflow on mobile
- [ ] Displays in email footers (test send a form confirmation)
- [ ] Check HTML footer appears on all pages

**Rollout:** Full rollout immediately (no risk, high visibility)

---

### Phase 2: Add Context Narrative (Day 3-5)

**Changes needed:**
- Add Services Option B translations + UI component
- Update Services.tsx to include new narrative section

**Testing:**
- [ ] Section displays above security callout
- [ ] Text wraps correctly on mobile (use `whitespace-pre-line`)
- [ ] Tone matches rest of page
- [ ] Languages all render

**Rollout:** Full rollout (this is a content enhancement, no risk)

---

### Phase 3: Optional - Founder Cards (Week 2)

**Only if you have professional headshots**

**Changes needed:**
- Add FounderIntro component
- Add translations
- Update Services.tsx to include component
- Replace placeholder image IDs with real IDs

**Testing:**
- [ ] Images load correctly
- [ ] Images are circular with proper ring styling
- [ ] Quote typography looks good
- [ ] Mobile layout stacks correctly
- [ ] Feels professional, not ego-driven

**Rollout:** Full rollout after approval from Kajsa & Natalie

---

## Part 5: Monitoring & Optimization

### Metrics to Track (After Implementation)

**Before:**
- Baseline: Time from form submission to first response
- Baseline: Lead conversion rate
- Baseline: Response time mentions in testimonials

**After (Week 1-4):**
- Track same metrics
- Look for: Do new leads mention "talking to founder directly" in feedback?
- Monitor: Are response times actually meeting expectations?
- Check: Do any testimonials specifically mention Kajsa or Natalie by name?

### A/B Test Opportunity

If you want data on which footer option works best:

**Week 1:** Send footer signature on 50% of inquiry emails
**Week 2:** Send on 100% with version A
**Analyze:** Do conversations with A vs. without differ in tone or urgency?

---

## Part 6: Translation Verification Checklist

Before deploying, verify:

### Swedish
- [ ] "Med omsorg" is correctly rendered (check for encoding issues with "å")
- [ ] Line break preserved between signature lines
- [ ] "Kajsa & Natalie" displays as-is (no translation)

### English
- [ ] Tone is natural, not translated-feeling
- [ ] "with care" conveys attentiveness (not literal translation awkwardness)
- [ ] "Kajsa & Natalie" displays as-is

### Polish
- [ ] "Z troską" conveys care/attention (not mechanical)
- [ ] Formal tone maintained (not casual Polish)
- [ ] Names unchanged

---

## Part 7: Fallback & Contingency

### If Response Times Don't Match Messaging

**Problem:** Founder names + "we respond in 15 minutes" = credibility death if response is slow

**Contingency plan:**
- Keep founder messaging focused on "direct contact" not speed
- If speed isn't guaranteed, use: "Your contact is Kajsa or Natalie directly" (doesn't promise 15 min)
- Monitor: Make sure both Kajsa & Natalie are actually handling inquiries, not just getting cc'd

**If Kajsa or Natalie Leave/Are Unavailable:**
- Remove founder messaging temporarily
- Consider: Does messaging need to adapt (e.g., "our founding team")?
- Don't leave founder names if they're not actively involved

---

## File Changes Summary

| File | Changes | Priority | Time |
|------|---------|----------|------|
| `/src/data/translations.ts` | Add footer signature + Services descriptions | HIGH | 15 min |
| `/src/components/Footer.tsx` | Display founder signature | HIGH | 5 min |
| `/src/components/Services.tsx` | (Option B) Add narrative section | MEDIUM | 10 min |
| Email templates (external) | Add founder footer to transactional emails | MEDIUM | 10 min |
| `/src/components/FounderIntro.tsx` | (Option C) Create new component | LOW | 30 min |

**Total implementation time (all options): ~1-2 hours**

**Recommended initial implementation (Phases 1 + 2): 30 minutes**

---

## Questions Before You Build?

Common concerns:

**"What if people are put off by founder names?"**
- Data from B2B (especially construction) shows founder names increase trust, not decrease it
- Concern usually comes from internal worry, not actual buyer behavior
- Test it: You'll know in week 1 if it backfires (it won't)

**"Do both names need to be on every communication?"**
- Yes, for fairness and for legal clarity (both are equally responsible)
- Don't highlight one founder (creates internal friction)
- Both names = shared accountability

**"Should we add titles (Founder, CEO)?"**
- No. Just "Kajsa & Natalie" is stronger than "Kajsa & Natalie, Founders"
- Let the context (direct access, fast decisions) imply leadership

---

## Files to Deploy

After making changes above:

1. `src/data/translations.ts` - Updated with all new copy
2. `src/components/Footer.tsx` - Updated to display signature
3. `src/components/Services.tsx` - Updated with Option B or C (your choice)
4. `src/components/FounderIntro.tsx` - New file (only if using Option C)
5. Email templates (external) - Updated with footer

**Build command:** `npm run build` (or your build command)

**Deploy:** Standard deployment process

---
