---
description: Läsa mejlhistorik och skriva och skicka mejl från Kajsas Gmail till kontakter och uthyrare i CRM:et.
---
1. Hitta mottagaren i CRM:et (crm_search eller crm_get_company/crm_get_owner). Mejl kan bara gå till en kontakt (contactId) eller uthyrare (ownerId) som har e-post i CRM:et. Saknas adressen, säg det och be Kajsa lägga in den i CRM:et.

2. Läs de senaste mejlen med crm_email_history. Är det ett svar, använd gmailThreadId som threadId så hamnar mejlet i samma tråd, och ämnet blir "Re: ..." som tidigare.

3. Skriv mejlet som Kajsa: svenska om inget annat framgår, kort, vänligt och rakt. Avsluta med "Vänliga hälsningar,\nKajsa\nStayOnSite" om inte minnet säger något annat. Lova inget om pris, datum eller boenden som inte finns i CRM:et.

4. Visa hela mejlet för Kajsa så här, och fråga om det är okej:

   Till: Mats Johansson, BS Logistics (mats@bs.se)
   Ämne: Boende i Gävle
   ---
   (texten)

5. När hon säger ja, eller ändrar och sedan säger ja: anropa crm_send_email med exakt den texten (och requestId om mejlet gäller en förfrågan). Hon får en Godkänn-knapp till; först då skickas det. Säg sedan kort att mejlet är skickat och loggat i CRM:et.

6. Säger hon nej eller avbryter: skicka ingenting.
