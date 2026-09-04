---
layout: course
lang: fr
title: "Représentation des connaissances <br> pour les SHS"
permalink: /courses/l5soreco-2026/

# Rendus dans la bannière par _layouts/course.html
code: L5SORECO
# institution: Sorbonne Université
institution_url: https://www.sorbonne-universite.fr/
semester: Semestre 5 · 2026/2027
logo: /assets/img/sorbonne_full.svg
logo_alt: Sorbonne Université

# Bibliographie par défaut de cette page : les balises cite/bibliography
# n'ont alors pas besoin de --file (jekyll-scholar fusionne ce bloc
# par-dessus la configuration du site).
scholar:
  bibliography: l5soreco-2026.bib
  # Citations narratives « Auteur (année) » ; la bibliographie reste en APA.
  style: _csl/apa-narrative.csl
# catalog_url:   # lien vers le descriptif du catalogue, à compléter
---

## Présentation du cours

**Comment un ordinateur peut-il "comprendre" que Paris est une capitale, qu'un chat est un animal, ou qu'un texte du XVIIe siècle parle d'amour? Derrière ces questions se cache un défi central de l'informatique et de la linguistique: représenter des connaissances de manière à ce que les machines puissent les manipuler et effectuer des inférences. Ce cours explore des formalismes qui permettent de relever ce défi. Il mettra l'accent sur les approches classiques et structurées: ontologies et logiques formelles, avec leurs langages, leurs outils et leurs applications en sciences humaines. La perspective s'élargira ensuite pour donner un aperçu des approches plus récentes: les représentations vectorielles, qui permettent de capturer le sens de façon géométrique; la théorie des types, orientée vers l'inférence et la vérification formelle; ou la théorie des catégories, qui offre un cadre général pour penser la structure et la composition des connaissances. En mettant ces grandes familles de formalismes en dialogue, nous nous interrogerons sur ce que signifie représenter un concept "formellement" et sur ce que cette démarche fait gagner, ou perdre. Le cours vise ainsi à donner aux étudiant·e·s en sciences humaines une vision cohérente et critique d'un paysage au cœur des transformations actuelles, au carrefour de la linguistique, des sciences formelles et de l'intelligence artificielle, en les préparant à des débouchés en ingénierie des connaissances, en traitement automatique des langues et en humanités numériques.**

## Organisation

**Cours Magistraux:**
Lundis 14h-16h, Malesherbes C220

**Travaux dirigés :**
Lundis 16h-18h, Malesherbes C220

**Communication :**
[Moodle](https://moodle-lettres-26.sorbonne-universite.fr/course/view.php?id=1642#)

Les étudiant·es sont
responsables de la consultation des messages qui y sont diffusés.

## Évaluation

La note finale sera établie selon la répartition suivante :

- **50% Contrôle continu**
- **50% Examen final**

### Contrôle continu

- Dates: 19/10; 30/11

### Examen final

- Date: À définir 


## Documents de cours

- *(Syllabus — à compléter)*
- *(Consignes des travaux hebdomadaires — à compléter)*
- *(Grille d'évaluation — à compléter)*

## Actualités

**25.08** &emsp; Mise en ligne du site du cours.

## Programme

| Séance | Date | Module | Thème | Lectures | Slides | TD |
|:---:|:---|:---:|:---|:---|:---|:---|
| **1** | 14.09.26 | **Introduction** | Introduction | {% cite nietzsche1873delaverite %} | | |
| **2** | 21.09.26 | **Module 1 : Propositions** | Logique propositionnelle | {% cite lifschitz2008knowledgerepresentation %} | | |
| **3** | 28.09.26 | **Module 1 : Propositions** | Logique de premier ordre | {% cite lifschitz2008knowledgerepresentation %} | | |
| **4** | 05.10.26 | **Module 1 : Propositions** | Logiques de description | {% cite brachman2004knowledgerepresentation --label chapter --locator 9 %}; {% cite baader2008descriptionlogics %} | | |
| **5** | 12.10.26 | **Module 1 : Objets** | Ontologies | **{% cite schreiber2008knowledgeengineering %}** | | |
| **6** | 19.10.26 | **Module 1 : Graphes** | Graphes conceptuels et de connaissance | {% cite sowa2008conceptualgraphs %} | | Contrôle continu |
| **7** | 02.11.26 | **Module 2 : Vecteurs** | Représentations vectorielles I | {% cite turney2010fromfrequency %} | | |
| **8** | 09.11.26 | **Module 2 : Vecteurs** | Représentations vectorielles II |  {% cite mikolov2013efficientestimation levy2014implicitfactorization%} | | |
| **9** | 16.11.26 | **Module 3 : Types** | Théorie des types I | | | |
| **10** | 23.11.26 | **Module 3 : Types** | Théorie des types II | | | |
| **11** | 30.11.26 | **Module 4 : Catégories** | Catégories I | {% cite fong2019invitation %} | | |
| **12** | 07.12.26 | **Module 4 : Catégories** | Catégories II | {% cite spivak2012ologs %} | | Contrôle continu |
| **13** | 14.12.26 | **Révision** | Révision | | | |

## Bibliographie

<!-- Les références proviennent de _bibliography/l5soreco-2026.bib et sont mises
     en forme au moment de la construction du site (jekyll-scholar, style APA).
     Chaque section ci-dessous ne retient que les entrées portant le mot-clé
     correspondant (champ `keywords` du fichier .bib).
     Pour afficher toute la bibliographie d'un seul bloc, supprimer l'option
     --query et ne garder que --file.
     Attention : la valeur de --query ne doit PAS être entre guillemets ;
     jekyll-scholar les conserverait littéralement et la requête ne renverrait
     alors aucune entrée. -->

### Introduction

{% bibliography --query @*[keywords ~= intro] %}

### Module 1 --- Propositions

{% bibliography --query @*[keywords ~= module1] %}

### Module 2 --- Vecteurs

{% bibliography --query @*[keywords ~= module2] %}

### Module 3 --- Types

{% bibliography --query @*[keywords ~= module3] %}

### Module 4 --- Catégories

{% bibliography --query @*[keywords ~= module4] %}


## Ressources utiles

- [Visual Studio Code](https://code.visualstudio.com)
- [Python](https://www.python.org)
- [Z3 guide](https://microsoft.github.io/z3guide/docs/logic/intro/), [repo](https://github.com/z3prover/z3)

## Contact

*(À compléter : modalités de contact — forum de la plateforme du cours, adresse
électronique, permanences.)*
