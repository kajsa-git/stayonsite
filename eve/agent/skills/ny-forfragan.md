---
description: Källsökning när en ny förfrågan kommer in från CRM:et. Matchar mot CRM:et, uthyrare med sökorter, Qasa och Facebook-grupper, och ger Kajsa en sammanfattning.
---
1. Läs förfrågan med crm_get_request (requestId står i meddelandet). Notera ort, antal personer, bäddar/sovrum, period, budget och krav (möblerat, parkering, kök, tvätt).

2. Kör de här parallellt:
   - crm_request_matches med requestId
   - crm_owner_search_leads med requestId
   - qasa_search_for_request med requestId
   - facebook_grupper med förfrågans ort

3. Skicka en kort sammanfattning med fraga_kajsa, högst fyra rader:

   Ny förfrågan #128: 4 pers i Gävle, 1 mars-1 juni.
   Bäst i CRM:et: Storgatan 1, 4 bäddar, ledigt från mars.
   Dessutom 5 på Qasa och 2 uthyrare med Gävle som sökort.

   Knappar (högst tre): "Facebook-inlägg #128", "Visa alla träffar #128", "Vänta med #128". Byt en knapp mot "Sms till uthyrarna #128" om det finns uthyrare med sökorten, eller mot "Hitta fler grupper i Gävle" om orten har högst två bostadsgrupper i facebook_grupper.

   - Nämn bara det bästa objektet. Resten när hon trycker "Visa alla träffar": högst tre CRM-objekt med det som inte stämmer (t.ex. "ledigt först 15 mars"), och de 2-3 bästa Qasa-länkarna.
   - Objekt som redan är föreslagna (alreadySuggested) räknas inte som nya träffar.
   - Saknas något i förfrågan som behövs för att söka (ort, period, antal), säg bara det.
   - Gick Qasa-sökningen inte att göra, hoppa över Qasa i texten.

4. Vänta på Kajsas svar. Gör inga utkast och skicka ingen postningslista innan hon har bett om det. Svarar hon "Vänta med #128", säg kort att du låter den vara och att hon kan skriva när hon vill ta upp den igen.
   - Postningslista: följ färdigheten facebook-inlagg.
   - SMS-utkast till uthyrare: ett utkast per uthyrare med crm_draft_message (koppla ownerId). Kort, personligt, med ort, period och antal personer, utan kundens namn. Berätta att utkasten ligger under Utkast i CRM:et.
