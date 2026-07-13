import BlogLayout from '../BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import Link from 'next/link';

const ForetagsbostaderNyaReglerJuli2026GuideEn = () => {
  const post = getBlogPost('foretagsbostader-nya-regler-juli-2026-guide')!;
  return (
    <BlogLayout post={post}>
      <p>
        On July 1, 2026, sweeping regulatory changes take effect that fundamentally change the conditions for companies that need to arrange housing for employees. After several years of legal uncertainty and difficult processes for both property owners and companies, the rules for corporate housing and blockhyra (block rental) in Sweden are now being modernized.
      </p>

      <p>
        In this guide, we go through exactly what is changing, how it affects you as an employer, and which practical steps you need to take to secure worker accommodation under the new rules.
      </p>

      <h2>What is corporate housing and why is it needed?</h2>

      <p>
        Corporate housing refers to homes that a company rents in order to provide them to its employees. It can range from construction workers on a project in another part of the country, to newly recruited managers from abroad who need housing during their onboarding period.
      </p>

      <p>
        The need for corporate housing in Sweden is substantial. With major ongoing investments in infrastructure, green industries and housing construction, companies need to be able to offer flexible accommodation options in order to recruit and retain skilled staff. According to forecasts from Byggfakta, housing construction is expected to increase from around 30,900 housing starts in 2025 to 37,000 in 2026, creating additional demand for worker and staff accommodation.
      </p>

      <p>
        For many construction companies, the shortage of available corporate housing has been a bottleneck. In{' '}
        <Link href="/en/corporate-housing/kiruna">Kiruna</Link>,{' '}
        <Link href="/en/corporate-housing/gallivare">Gällivare</Link>,{' '}
        <Link href="/en/corporate-housing/lulea">Luleå</Link>{' '}
        and{' '}
        <Link href="/en/corporate-housing/boden">Boden</Link>{' '}
        &mdash; where large infrastructure projects are underway &mdash; access to housing is often decisive for whether a project can go ahead at all.
      </p>

      <blockquote>
        <p>&quot;Block rental is crucial for municipalities, companies and associations to gain access to housing for employees, student housing and apartments for health and social care.&quot;</p>
        <footer>&mdash; Johan Kleveland, legal counsel at Fastighetsägarna (the Swedish Property Federation)</footer>
      </blockquote>

      <h2>The three major changes from July 1, 2026</h2>

      <p>
        In May 2026, the Riksdag (the Swedish Parliament) passed the government bill &quot;En mer flexibel hyresmarknad&quot; (A More Flexible Rental Market). The legislative changes take effect on July 1, 2026 and contain three main changes that affect corporate housing:
      </p>

      <h3>1. Simplified block rental for corporate housing</h3>

      <p>
        Under a block rental, at least three apartments are rented from a property owner as a &quot;block&quot;, where the block tenant in turn sublets the apartments to, for example, its employees. Previously, this was very difficult in practice after the Svea Court of Appeal's decision in March 2022, which established that rental companies without their own need for the apartments did not meet the requirement for the block rental exemption.
      </p>

      <p>
        The new rules mean that:
      </p>

      <ul>
        <li>Hyresnämnden (the Rent Tribunal) reviews the purpose, not the individual contract terms</li>
        <li>The process is significantly simplified compared to before</li>
        <li>Adjusted rent can be agreed &mdash; an alternative rent-setting model that takes into account the nature of the block rental agreement, its service content and short-term character</li>
        <li>A subtenant cannot claim a first-hand lease if the rental period is shorter than one year</li>
      </ul>

      <p>
        Read more about how you can use{' '}
        <Link href="/blogg/blockhyra-nya-regler-juli-2026-guide-foretag">block rental under the new rules</Link>.
      </p>

      <h3>2. Co-living homes are legalized</h3>

      <p>
        Co-living homes, where tenants each rent their own room and share common areas such as the kitchen and living room, are an increasingly common form of housing. The new rules create clear permit grounds to facilitate this type of housing, which is particularly relevant for construction projects where several fitters or employees need housing in the same area.
      </p>

      <h3>3. Greater contractual freedom between parties</h3>

      <p>
        The new privatuthyrningslagen (the Private Rental Act) provides greater freedom of contract between landlord and company. The parties gain more scope to agree on terms adapted to the commercial and practical conditions of the tenancy, making it easier to tailor accommodation agreements to the specific needs of each project.
      </p>

      <p>
        The Private Rental Act now covers renting out up to two residential homes at the same time, giving private individuals greater freedom to rent out to companies without it being classified as business activity.
      </p>

      <h2>Difference between corporate housing and private rental</h2>

      <p>
        It is important to understand the difference between corporate housing and ordinary private rental, especially in light of the new rules:
      </p>

      <div className="overflow-x-auto my-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Aspect</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Corporate housing (block rental)</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Private rental</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>Number of homes</strong></td>
              <td className="border border-gray-300 px-4 py-2">At least 3 apartments</td>
              <td className="border border-gray-300 px-4 py-2">Up to 2 homes</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>Tenant</strong></td>
              <td className="border border-gray-300 px-4 py-2">Company/organization</td>
              <td className="border border-gray-300 px-4 py-2">Private individual</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>Permits</strong></td>
              <td className="border border-gray-300 px-4 py-2">The Rent Tribunal reviews the purpose</td>
              <td className="border border-gray-300 px-4 py-2">No permit required (for houses/tenant-owned apartments)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>Security of tenure (besittningsskydd)</strong></td>
              <td className="border border-gray-300 px-4 py-2">Limited for subtenants</td>
              <td className="border border-gray-300 px-4 py-2">Full security of tenure under hyreslagen (the Rent Act)</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>Rent setting</strong></td>
              <td className="border border-gray-300 px-4 py-2">Adjusted rent possible (reviewed by the Rent Tribunal)</td>
              <td className="border border-gray-300 px-4 py-2">Freer rent setting, protection against unreasonably high rents</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>Purpose</strong></td>
              <td className="border border-gray-300 px-4 py-2">Worker accommodation, co-living homes</td>
              <td className="border border-gray-300 px-4 py-2">General housing</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        For more details on the differences, see our guide on{' '}
        <Link href="/blogg/privatuthyrningslagen-reform-2026">the Private Rental Act 2026</Link>.
      </p>

      <h2>Practical steps: How to arrange employee housing under the new rules</h2>

      <p>
        If your company needs to arrange housing for employees &mdash; whether for a construction site in{' '}
        <Link href="/en/corporate-housing/skelleftea">Skellefteå</Link>, an infrastructure project in{' '}
        <Link href="/en/corporate-housing/ostersund">Östersund</Link>{' '}
        or a recruitment to{' '}
        <Link href="/en/corporate-housing/stockholm">Stockholm</Link>{' '}
        &mdash; there are a few important steps to follow:
      </p>

      <h3>Step 1: Assess your accommodation needs</h3>

      <p>
        Map out how many employees need housing, for how long, and in which regions. Consider:
      </p>

      <ul>
        <li>The length of the project (shorter or longer than 12 months)</li>
        <li>The number of people who need housing at the same time</li>
        <li>Geographic location and proximity to the workplace</li>
        <li>Standard and service level (basic accommodation or a higher standard)</li>
      </ul>

      <p>
        See our{' '}
        <Link href="/blogg/infrastruktur-personalboende-karta-2026">map of infrastructure projects and where demand for worker accommodation is highest in 2026</Link>.
      </p>

      <h3>Step 2: Choose the right accommodation solution</h3>

      <p>
        There are several options for corporate housing:
      </p>

      <ul>
        <li><strong>Block rental via a property owner:</strong> Rent several apartments directly from a property owner</li>
        <li><strong>Worker accommodation provider:</strong> Partner with a specialized company like StayOnSite that handles everything from sourcing to administration</li>
        <li><strong>Hotels/hostels:</strong> For shorter projects (see our{' '}
        <Link href="/en/blog/worker-accommodation-vs-hotel-cost-comparison">cost comparison of worker accommodation vs hotels</Link>)</li>
        <li><strong>Caravan accommodation:</strong> For projects in remote areas where other options are unavailable</li>
      </ul>

      <h3>Step 3: Ensure contracts are drafted correctly</h3>

      <p>
        With the new rules from July 1, 2026, it is important that agreements are correctly drafted. Make sure that:
      </p>

      <ul>
        <li>The purpose of the block rental is clearly specified</li>
        <li>The agreement includes terms on liability for damage and maintenance</li>
        <li>The rent is reasonable and can be justified in the event of a review</li>
        <li>The contract period is clearly stated</li>
      </ul>

      <p>
        Read more in our{' '}
        <Link href="/blogg/avtalskrav-personalboende-guide-2026">guide on contract requirements for worker accommodation</Link>.
      </p>

      <h3>Step 4: Handle insurance and liability issues</h3>

      <p>
        Make sure the right insurance policies are in place. This includes:
      </p>

      <ul>
        <li>Property insurance that covers block rental</li>
        <li>Liability insurance for damage</li>
        <li>Home insurance for the residents (the employer's or the employees' responsibility)</li>
      </ul>

      <p>
        For more information, see our{' '}
        <Link href="/blogg/forsakring-ansvar-personalboende-guide-2026">guide on insurance and liability for worker accommodation</Link>.
      </p>

      <h3>Step 5: Plan logistics and support</h3>

      <p>
        Well-functioning accommodation requires more than just a roof over your head:
      </p>

      <ul>
        <li>Transport between the accommodation and the workplace</li>
        <li>Furnishings and equipment (bed linen, kitchenware)</li>
        <li>Fault reporting and maintenance routines</li>
        <li>Information and onboarding for the residents</li>
      </ul>

      <h2>Frequently asked questions and pitfalls to avoid</h2>

      <h3>Are the new rules mandatory from July 1, 2026?</h3>

      <p>
        Yes, the legislative changes take effect on July 1, 2026. Existing agreements remain valid, but new agreements must comply with the new rules.
      </p>

      <h3>Can we rent fewer than three apartments as corporate housing?</h3>

      <p>
        If you rent fewer than three apartments, it does not count as block rental. However, as a company you can rent one or two homes directly from a private individual under the Private Rental Act, or from a professional property owner under regular tenancy rules.
      </p>

      <h3>Do we as a company need a permit from the Rent Tribunal?</h3>

      <p>
        With block rental, it is the property owner who applies for a permit from the Rent Tribunal. The Rent Tribunal reviews the purpose of the block rental, not the individual contract terms. As a company, you therefore need to work with the property owner to ensure that the permit is applied for and granted.
      </p>

      <h3>What happens if an employee wants to stay on after the project ends?</h3>

      <p>
        Under the new rules, a subtenant cannot claim a first-hand lease if the rental period is shorter than one year. After one year, however, security of tenure may start to apply. It is therefore important to have clearly time-limited agreements and to communicate this to your employees.
      </p>

      <h3>How is corporate housing taxed?</h3>

      <p>
        For the employee, the benefit value of free housing may be taxable if the housing is considered a benefit. For the employer, the rental cost is deductible. For the property owner, rental income is taxed, but a standard deduction (schablonavdrag) of SEK 50,000 per year may apply for private rentals. Read more in our{' '}
        <Link href="/blogg/schablonavdrag-skatt-blockhyra-husagare-2026">guide on tax and the standard deduction for block rental</Link>.
      </p>

      <h3>Common pitfalls to avoid:</h3>

      <ul>
        <li><strong>Vague agreements:</strong> Make sure the agreement clearly specifies purpose, responsibilities and contract period</li>
        <li><strong>Insufficient documentation:</strong> Keep all documentation of the property's condition at move-in and move-out</li>
        <li><strong>Inadequate insurance:</strong> Check that insurance policies cover block rental and corporate housing</li>
        <li><strong>Unclear liability for damage:</strong> Clearly define who is responsible for what in the agreement</li>
        <li><strong>Incorrect rent setting:</strong> Set a reasonable rent that can be justified and hold up under review</li>
      </ul>

      <blockquote>
        <p>&quot;The rules for corporate housing and co-living homes are being modernized to better meet companies' need for housing for their staff.&quot;</p>
        <footer>&mdash; SVT Nyheter on the legislative changes of July 1, 2026</footer>
      </blockquote>

      <h2>Checklist for construction companies that need worker accommodation</h2>

      <p>
        If you work in the construction sector and need to arrange worker accommodation, use this checklist to make sure everything is in place:
      </p>

      <h3>Before the project starts:</h3>

      <ul>
        <li>☐ Map the number of employees and accommodation needs</li>
        <li>☐ Identify the geographic area (e.g.{' '}
        <Link href="/en/corporate-housing/lulea">Luleå</Link>,{' '}
        <Link href="/en/corporate-housing/umea">Umeå</Link>,{' '}
        <Link href="/en/corporate-housing/gavle">Gävle</Link>)</li>
        <li>☐ Decide on an accommodation strategy (block rental, accommodation provider, hotel)</li>
        <li>☐ Budget for accommodation costs</li>
        <li>☐ Contact an accommodation provider or property owner (StayOnSite can help)</li>
        <li>☐ Verify that insurance policies cover worker accommodation</li>
      </ul>

      <h3>When drafting the agreement:</h3>

      <ul>
        <li>☐ Make sure the purpose of the block rental is clear</li>
        <li>☐ Define the contract period with start and end dates</li>
        <li>☐ Specify responsibility for damage, maintenance and cleaning</li>
        <li>☐ Confirm that the property owner has a permit from the Rent Tribunal (for block rental)</li>
        <li>☐ Verify that the rent is reasonable and in line with the market</li>
        <li>☐ Include routines for fault reporting and support</li>
      </ul>

      <h3>During the project:</h3>

      <ul>
        <li>☐ Stay in contact with the residents and the property owner</li>
        <li>☐ Document any damage or problems</li>
        <li>☐ Make sure the rent is paid on time</li>
        <li>☐ Inform employees well in advance of the end of the agreement</li>
      </ul>

      <h3>At the end of the project:</h3>

      <ul>
        <li>☐ Carry out a final inspection together with the property owner</li>
        <li>☐ Document the condition of the property</li>
        <li>☐ Return keys and equipment</li>
        <li>☐ Make sure any damage is handled and paid for</li>
        <li>☐ Close out the agreement properly</li>
      </ul>

      <p>
        For more detailed information on worker accommodation for construction companies, see our guides on{' '}
        <Link href="/blogg/personalboende-guide-2026">worker accommodation 2026</Link>,{' '}
        <Link href="/en/blog/worker-accommodation-sweden-faq">frequently asked questions about worker accommodation</Link>{' '}
        and{' '}
        <Link href="/blogg/kompetens-rekrytering-byggsektorn-guide-2026">recruitment in the construction sector</Link>.
      </p>

      <h2>How StayOnSite can help your company</h2>

      <p>
        The new rules from July 1, 2026 make it easier than ever for companies to arrange worker accommodation &mdash; but there are still many details to keep track of. StayOnSite is Sweden's leading B2B accommodation company, specializing in simplifying the process for construction companies and other employers that need housing for their employees.
      </p>

      <h3>Why companies choose StayOnSite:</h3>

      <ul>
        <li><strong>0% fees:</strong> No commission &mdash; we take no share of your rent or your costs</li>
        <li><strong>Guaranteed rent:</strong> Fixed monthly rent with no surprises</li>
        <li><strong>Professional tenants:</strong> All our tenants are verified companies with a Swedish company registration number</li>
        <li><strong>Fast response:</strong> We always get back to you within one business day &ndash; often within hours</li>
        <li><strong>Everything handled for you:</strong> We manage contracts, key handover, fault reporting and communication</li>
      </ul>

      <p>
        We have experience from projects all over Sweden &mdash; from{' '}
        <Link href="/en/corporate-housing/kiruna">Kiruna</Link>{' '}
        in the north to{' '}
        <Link href="/en/corporate-housing/malmo">Malmö</Link>{' '}
        in the south. Whether you need housing for a single infrastructure project or ongoing worker accommodation across multiple locations, we can help.
      </p>

      <p>
        Read more about how{' '}
        <Link href="/blogg/sa-fungerar-det-fran-intresse-till-forsta-hyran">the process works from first contact to first rent</Link>, or see our{' '}
        <Link href="/blogg/hyra-ut-jamforelse-stayonsite-vs-andra-2026">comparison with other alternatives</Link>.
      </p>

      <h2>Summary: New opportunities from July 1, 2026</h2>

      <p>
        The new rules for corporate housing from July 1, 2026 are a welcome reform for the Swedish construction sector and for every company that needs flexible accommodation options for its employees. With simplified block rental, clearer rules for co-living homes and greater contractual freedom, arranging worker accommodation becomes both easier and more secure.
      </p>

      <p>
        If you work in the construction sector, recruit internationally, or run projects that require staff from other parts of the country, the new rules open up significant opportunities. At the same time, it is important to know the details of the legislation and to make sure that agreements, insurance and routines are in place.
      </p>

      <p>
        Want to know more about how the new rules affect your specific business? Contact StayOnSite for a free review of your accommodation needs.
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8">
        <h3 className="text-xl font-bold mb-4">Do you need corporate housing?</h3>
        <p className="mb-4">
          StayOnSite helps construction companies and other employers find secure, hassle-free and cost-effective worker accommodation across Sweden &mdash; with no fees and guaranteed rent.
        </p>
        <p className="mb-4">
          Call us on{' '}
          <a href="tel:0762498486" className="text-blue-600 font-semibold hover:underline">
            076-249 84 86
          </a>{' '}
          or visit our pages:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <Link href="/en/corporate-housing-sweden" className="text-blue-600 hover:underline font-semibold">
              For companies &mdash; find worker accommodation
            </Link>
          </li>
          <li>
            <Link href="/for-husagare" className="text-blue-600 hover:underline font-semibold">
              For homeowners &mdash; rent out to companies
            </Link>
          </li>
        </ul>
        <p className="mt-4 text-sm text-gray-600">
          We offer: 0% fees, guaranteed rent, professional tenants, and we always get back to you within one business day &ndash; often within hours.
        </p>
      </div>

      <h3>Related articles:</h3>
      <ul>
        <li>
          <Link href="/blogg/blockhyra-infrastrukturprojekt-ostlanken-norrbotnibanan-2026">Block rental for infrastructure projects: Ostlänken and Norrbotniabanan 2026</Link>
        </li>
        <li>
          <Link href="/blogg/infrastrukturplan-2026-2037-personalboende-guide">Infrastructure plan 2026&ndash;2037: Worker accommodation guide</Link>
        </li>
        <li>
          <Link href="/blogg/arbetskraftsinvandring-juni-2026-guide-byggforetag">Labor immigration June 2026: Guide for construction companies</Link>
        </li>
        <li>
          <Link href="/blogg/nya-hyreslagen-juli-2026-foretag-personalboende-guide">The new Rent Act July 2026: Guide for companies and worker accommodation</Link>
        </li>
        <li>
          <Link href="/blogg/kompetensbristen-byggsektorn-2026-praktisk-rekryteringsguide">The skills shortage in construction 2026: A practical recruitment guide</Link>
        </li>
      </ul>
    </BlogLayout>
  );
};

export default ForetagsbostaderNyaReglerJuli2026GuideEn;
