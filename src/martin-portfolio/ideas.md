# Design Ideas — Martin Lepage Portfolio

## Contexte
Site de portfolio professionnel pour Martin Lepage, PhD : analyste institutionnel, stratège en gouvernance IA, écrivain. Le site actuel est sombre, sobre, avec une esthétique "institutional research" très marquée. L'objectif est d'améliorer sans trahir l'identité.

---

<response>
<text>

## Approche 1 — "Archival Precision" (Minimalisme Archivistique)

**Design Movement:** Brutalisme éditorial / Swiss International Style
**Probability:** 0.07

**Core Principles:**
- Grille typographique stricte, colonnes asymétriques
- Contraste fort entre texte et fond, sans ornements superflus
- Hiérarchie visuelle par la taille et le poids typographique uniquement
- Chaque élément justifie sa présence fonctionnellement

**Color Philosophy:**
- Fond : blanc cassé chaud (#F7F4EF) — papier archivistique
- Texte primaire : noir encre (#1A1A1A)
- Accent : rouge vermillon (#C0392B) — marque d'annotation
- Secondaire : gris ardoise (#6B7280)
- Philosophie : la couleur comme signal, pas comme décoration

**Layout Paradigm:**
- Grille 12 colonnes, contenu principal sur 8 colonnes à gauche
- Sidebar fixe à droite avec navigation contextuelle
- Sections séparées par des règles typographiques (lignes horizontales fines)
- Asymétrie délibérée : les titres débordent dans la marge

**Signature Elements:**
- Numérotation des sections en style "01 / 04" en marge
- Lignes de séparation fines avec labels en petites capitales
- Monogramme ML en caractères Helvetica condensée

**Interaction Philosophy:**
- Hover : soulignement progressif, pas de changement de couleur
- Transitions : 150ms, ease-in-out strict
- Aucune animation superflue — le mouvement est réservé aux transitions de page

**Animation:**
- Entrée des sections : fade-in + translateY(8px), durée 400ms
- Pas de parallaxe, pas d'effets de scroll élaborés
- Curseur personnalisé : croix fine en rouge

**Typography System:**
- Display : Playfair Display Bold (titres)
- Body : IBM Plex Serif Regular (corps de texte)
- Labels : IBM Plex Mono (étiquettes, métadonnées)
- Hiérarchie : 48px / 32px / 20px / 14px / 11px

</text>
<probability>0.07</probability>
</response>

---

<response>
<text>

## Approche 2 — "Dark Governance" (Raffinement Institutionnel Sombre) ← CHOISIE

**Design Movement:** Contemporary Dark Editorial / Institutional Noir
**Probability:** 0.08

**Core Principles:**
- Fond sombre profond avec accents cuivrés/ambrés — autorité et précision
- Typographie display serif pour les titres, sans-serif condensé pour les labels
- Cartes avec bordures subtiles et effets de profondeur (glassmorphism léger)
- Navigation latérale fixe sur desktop, drawer sur mobile

**Color Philosophy:**
- Fond primaire : #0D1117 (noir bleuté profond)
- Fond secondaire : #161B22 (cartes et sections)
- Accent primaire : #C9A96E (or cuivré — légitimité, autorité)
- Accent secondaire : #5F7FAE (bleu ardoise — analyse, rigueur)
- Texte primaire : #E8E3DC (crème chaude)
- Texte secondaire : #8B9BB4 (gris bleuté)
- Philosophie : l'obscurité comme sérieux, l'or comme précision

**Layout Paradigm:**
- Hero asymétrique : texte à gauche (60%), panneau "Start Here" à droite (40%)
- Navigation horizontale sticky avec effet blur
- Sections en alternance pleine largeur / colonnes
- Timeline verticale pour le parcours biographique

**Signature Elements:**
- Lignes horizontales fines en or cuivré comme séparateurs de section
- Icône losange ◆ comme marqueur de section (repris du site original)
- Monogramme ML dans un cadre avec gradient sombre

**Interaction Philosophy:**
- Hover sur les cartes : élévation légère + bordure cuivrée
- Liens : soulignement en or au hover
- Boutons : fond cuivré avec texte sombre, transition smooth

**Animation:**
- Entrée des éléments : staggered fade-in + slide-up (framer-motion)
- Scroll reveal pour les sections
- Hover sur les cartes : scale(1.02) + box-shadow
- Durée : 300-500ms, easing custom

**Typography System:**
- Display : Cormorant Garamond Bold (titres — élégance institutionnelle)
- Body : DM Sans Regular (lisibilité moderne)
- Labels/Mono : JetBrains Mono (métadonnées, codes)
- Hiérarchie : 56px / 36px / 24px / 16px / 12px

</text>
<probability>0.09</probability>
</response>

---

<response>
<text>

## Approche 3 — "Luminous Scholar" (Clarté Académique Lumineuse)

**Design Movement:** Contemporary Academic / Editorial Light
**Probability:** 0.06

**Core Principles:**
- Fond clair avec accents de couleur profonds — accessibilité et autorité
- Typographie serif pour les titres, sans-serif pour le corps
- Espacement généreux, sections bien aérées
- Mise en valeur des publications et travaux comme objets éditoriaux

**Color Philosophy:**
- Fond : #FAFAF8 (blanc chaud légèrement crème)
- Texte : #1C2B3A (bleu marine profond)
- Accent primaire : #2D5A8E (bleu institutionnel)
- Accent secondaire : #8B4513 (brun sépia — académique)
- Muted : #6B7B8D
- Philosophie : la lumière comme ouverture intellectuelle

**Layout Paradigm:**
- Grille éditoriale avec marges généreuses
- Sidebar de navigation contextuelle sur les pages intérieures
- Hero avec grande typographie et image de fond subtile
- Cards avec ombres douces et coins légèrement arrondis

**Signature Elements:**
- Numéros de section en grand format en arrière-plan
- Lignes de citation avec bordure gauche colorée
- Footer avec grille de liens organisée

**Interaction Philosophy:**
- Hover : transitions douces, pas d'effets agressifs
- Focus visible pour l'accessibilité
- Animations d'entrée subtiles

**Animation:**
- Fade-in progressif au scroll
- Hover sur les liens : underline animé
- Transitions de page : crossfade 200ms

**Typography System:**
- Display : Libre Baskerville Bold
- Body : Source Sans Pro
- Mono : Fira Code
- Hiérarchie : 52px / 36px / 22px / 16px / 13px

</text>
<probability>0.06</probability>
</response>

---

## Décision finale : Approche 2 — "Dark Governance"

Cette approche conserve l'identité sombre et institutionnelle du site original tout en l'améliorant significativement avec :
- Une typographie plus raffinée (Cormorant Garamond + DM Sans)
- Des animations fluides avec framer-motion
- Une meilleure hiérarchie visuelle
- Des interactions plus riches et polies
- Une navigation améliorée
