# Arbres de Décision Cliniques - ICOPE (Recommandations CHU de Toulouse)

> **🤖 NOTE POUR LES AGENTS IA :** 
> Ce document contient les règles métiers et la "vérité terrain" de l'arbre décisionnel. Toute modification du fichier `data.json` ou de la logique de l'application concernant le traitement des alertes ICOPE doit **impérativement** respecter les règles définies ci-dessous.

Ce document définit les questions de second niveau (approfondissement) à poser obligatoirement lorsqu'une alerte est levée lors des tests de dépistage initiaux (niveau 1).

---

## 1. ITEM : MOBILITÉ (Test du lever de chaise)

**Condition de déclenchement :** Le test de lever de chaise initial est supérieur à 14 secondes ou n'a pas été réalisé. Le patient n'a pas réussi à faire les 5 levers de chaise correctement.

**Questions complémentaires à poser au patient :**
- Marchez-vous plus lentement ?
- Avez-vous des difficultés à porter vos courses ?
- Avez-vous des difficultés à monter un escalier ?
- La personne est-elle incapable de se lever seule d'une chaise sans l'aide d'autrui ?

**Règles de décision post-questionnaire :**
- **SI "NON" à toutes les questions :** Alerte non confirmée, pas de contact avec le médecin traitant.
- **SI "OUI" à au moins une question :** Poser une question supplémentaire : *"Le problème est-il nouveau ?"*
  - **Si "OUI" (problème nouveau) :** Envoyer un mail au médecin traitant.
  - **Si "NON" (problème ancien) :** Alerte non confirmée, pas de contact médecin.

---

## 2. ITEM : NUTRITION

**Condition de déclenchement :** Le test initial relève une alerte sur le poids (perte de 3 kg en 3 mois), le senior appelle pour contrôler le poids, et constate qu'il n'y a pas de perte de poids confirmée, mais une perte d'appétit déclarée.

**Questions complémentaires à poser au patient :**
- La perte d'appétit a-t-elle un impact sur les quantités consommées ?
- La personne saute-t-elle un ou des repas ?

**Règles de décision post-questionnaire :**
- **SI "OUI" (à l'une des questions) :** Envoyer un mail au médecin traitant.
- **SI "NON" :** Alerte non confirmée, pas de contact avec le médecin traitant.

---

## 3. ITEM : PSYCHOLOGIE

**Condition de déclenchement :** Le patient a répondu "Oui" à au moins une des questions de dépistage initial.

### Phase A : Confirmation du risque de dépression (ET/OU)
- Si le patient a signalé une sensation de dépression ou d'être sans espoir, demander : *"Est-ce que c'est tous les jours depuis au moins 15 jours ?"*
- Si le patient a signalé peu d'intérêt et de plaisir à faire les choses, demander : *"Est-ce qu'il y a un impact sur le fonctionnement quotidien ?"*

**Règles de décision (Phase A) :**
- **Si "NON" à ces confirmations :** Alerte non confirmée.
- **Si "OUI" à ces confirmations :** Passer à la Phase B.

### Phase B : Évaluation du risque suicidaire
**Questions complémentaires à poser au patient :**
- Avez-vous des idées noires ?
- Avez-vous des idées de mort ?
- Est-ce que vous souffrez au point de vouloir mettre fin à vos jours ?

**Règles de décision post-questionnaire (Phase B) :**
- **SI "NON" :** Envoyer un mail au médecin traitant.
- **SI "OUI" :** Évaluer l'urgence (faible, moyenne, élevée) pour déterminer l'action médicale immédiate (Appel au gériatre d'astreinte ou Appel au 15 si urgence élevée avec accès direct aux moyens de se suicider).

---

## 4. ITEM : COGNITION

**Condition de déclenchement :** Les tests cognitifs initiaux (orientation temporelle et test des 3 mots) ont été refaits suite à une alerte, et il y a un doute clinique malgré la passation.

**Refaire passer le test des 3 mots :** le test des 3 mots consiste à donner 3 mots du lui faire répeter à haute voix puis de lui redemander les 3 mots  quelques minutes plus tard pour voir si la personne s'en souvient. Voici 3 exemples de 3 mots possibles 
Test de mémoire :
- Drapeau Fleur Porte
- Fauteuil Tulipe Canard
- Citron Clé Ballon
Le participant a il réussi à redonner les 3 mots ?

**Questions complémentaires à poser à l'entourage (Évaluation de l'impact) :**
- Ces problèmes sont-ils récents (moins de 5 ans) ?
- Vous inquiètent-ils ?
- Inquiètent-ils votre entourage ?
- Justifient-ils pour vous ou votre entourage une consultation ?
- Y a-t-il un impact sur le quotidien ? (Évaluer via les questions de l'IADL)

**Règles de décision post-questionnaire :**
- **SI "OUI" à une ou plusieurs questions :** Envoyer un mail au médecin traitant.
- **SI "NON" :** Alerte non confirmée, pas de contact avec le médecin traitant.

---

## 5. ITEM : VISION

**Condition de déclenchement :** Le patient a signalé (1) des problèmes de vue, des maladies de l'œil, ou un traitement pour HTA/diabète ET (2) il a l'impression que sa vue a baissé au cours des 6 derniers mois.

**Question complémentaire à poser (Vérification de la prise en charge) :**
- Le problème est-il en cours de prise en charge ?

**Règles de décision post-questionnaire :**
- **SI "OUI" :** Alerte non avérée, ne pas contacter le médecin traitant.
- **SI "NON" :** Envoyer un mail au médecin traitant.

---

## 6. ITEM : AUDITION

**Condition de déclenchement :** Le patient déclare une baisse de l'audition ET le test clinique de chuchotement est anormal (ou la donnée est manquante).

**Question complémentaire à poser (Vérification de la prise en charge) :**
- Le problème est-il en cours de prise en charge ?

**Règles de décision post-questionnaire :**
- **SI "OUI" :** Alerte non avérée, ne pas contacter le médecin traitant.
- **SI "NON" :** Envoyer un mail au médecin traitant.
