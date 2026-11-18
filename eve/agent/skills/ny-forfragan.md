---
description: Källsökning när en ny förfrågan kommer in från CRM:et. Matchar mot CRM:et, uthyrare med sökorter, Qasa och Facebook-grupper, och ger Kajsa en sammanfattning.
---
1. Läs förfrågan med crm_get_request (requestId står i meddelandet). Notera ort, antal personer, bäddar/sovrum, period, budget och krav (möblerat, parkering, kök, tvätt).

2. Kör de här parallellt:
   - crm_request_matches med requestId
   - crm_owner_search_leads med requestId
   - qasa_search_for_request med requestId
   - facebook_grupper med förfrågans ort

3. Skicka en sammanfattning till Kajsa med fraga_kajsa. Håll den kort, ungefär så här:

   Ny förfrågan #128: BS Logistics, 4 pers i Gävle, 1 mars-1 juni, max 25 000 kr/mån.
   CRM: 2 bra
   - Storgatan 1, Gävle, 4 bäddar, 92 p (länk)
   - ...
   Qasa: 5 träffar, bästa: (länkar till 2-3)
   Uthyrare med Gävle som sökort: Anna Hyr 070-...
   Facebook: 3 grupper i Gävle, 2 för Gävleborg, 6 i närliggande orter, 9 rikstäckande.
   Vad vill du göra? Du kan också skriva fritt.

   Knappar: "Facebook-inlägg #128", "Sms till uthyrarna #128", "Vänta med #128". Ta bara med knappar som passar: finns inga uthyrare med sökorten, hoppa över sms-knappen.

   - Visa högst tre CRM-objekt. Skriv ut vad som inte stämmer (t.ex. "ledigt först 15 mars") i stället för bara poängen.
   - Objekt som redan är föreslagna (alreadySuggested) nämns som redan skickade.
   - Saknas något i förfrågan som behövs för att söka (ort, period, antal), säg det först.
   - Gick Qasa-sökningen inte att göra, säg det på en rad och gå vidare.

4. Vänta på Kajsas svar. Gör inga utkast och skicka ingen postningslista innan hon har bett om det. Svarar hon "Vänta med #128", säg kort att du låter den vara och att hon kan skriva när hon vill ta upp den igen.
   - Postningslista: följ färdigheten facebook-inlagg.
   - SMS-utkast till uthyrare: ett utkast per uthyrare med crm_draft_message (koppla ownerId). Kort, personligt, med ort, period och antal personer, utan kundens namn. Berätta att utkasten ligger under Utkast i CRM:et.
