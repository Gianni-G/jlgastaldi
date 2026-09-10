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

## Actualités

**25.08** &emsp; Mise en ligne du site du cours.

## Programme

| Séance | Date | Module | Thème | Lectures | Slides | TD |
|:---:|:---|:---:|:---|:---|:---|:---|
| **1** | 14/09 | **Introduction** | Représentation des<br> connaissances et<br> sciences humaines | · **{% cite nietzsche1873delaverite %}**<br>· {% cite brachman2004knowledgerepresentation -L chapter -l 1 %} | | |
| **2** | 21/09 | **M1:<br>Propositions** | Logique<br>propositionnelle | · **{% cite lifschitz2008knowledgerepresentation %}** | | |
| **3** | 28/09 | **M1:<br>Propositions** | Logique de<br>premier ordre | · **{% cite lifschitz2008knowledgerepresentation %}**<br>· {% cite brachman2004knowledgerepresentation -L chapter -l 2 %} | | |
| **4** | 05/10 | **M1:<br>Propositions** | Logiques de<br>description | · **{% cite brachman2004knowledgerepresentation -L chapter -l 9 %}**<br>· {% cite baader2008descriptionlogics %} | | |
| **5** | 12/10 | **M1:<br>Objets** | Ontologies | · **{% cite guarino2009whatisontology %}**<br>· {% cite pan2009rdf %}<br>· {% cite antoniou2009wol %} | | |
| **6** | 19/10 | **M1:<br>Graphes** | Graphes de connaissances | · **{% cite hogan2022knowledgegraphs %}**<br>· {% cite vrandecic2014wikidata %}  | | Contrôle continu |
| **7** | 02/11 | **M2:<br>Vecteurs** | Représentations vectorielles | · **{% cite turney2010fromfrequency %}**<br>· {% cite barbut1967mathématiquesetscienceshumaines1 -L chapter -l XI %}<br>· {% cite goodfellow2016deeplearning -L section -l 2.1-8 %} | | |
| **8** | 09/11 | **M2:<br>Vecteurs** | Embeddings<br>neuronaux | · **{% cite mikolov2013efficientestimation %}**<br>· {% cite levy2014implicitfactorization %} | | |
| **9** | 16/11 | **M3:<br>Types** | Correspondance propositions-types | · **{%cite wadler2015propositionsastypes%}**<br>· {% cite milewski2019category  %}| | |
| **10** | 23/11 | **M3:<br>Types** | Théorie des types | · **{%cite merigoux2021catala%}**<br>· {%cite merigoux2024rulescomputationpolitics%}| | |
| **11** | 30/11 | **M4:<br>Catégories** | Catégories et<br>foncteurs | · **{% cite spivak2014categorytheoryforthesciences %}**<br>· {% cite milewski2019category  %} | | |
| **12** | 07/12 | **M4:<br>Catégories** | Ologs et<br>profoncteurs | · **{% cite spivak2012ologs %}**<br>· {% cite  bradley2024structureofmeaning %} | | Contrôle continu |
| **13** | 14/12 | **Révision** | Révision | | | |

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

### Générale

{% bibliography --query @*[keywords ~= general] %}

### Introduction

{% bibliography --query @*[keywords ~= intro] %}

### Module 1 --- Propositions, objets, graphes

#### Propositions
{% bibliography --query @*[keywords ~= propositions] %}

#### Objets
{% bibliography --query @*[keywords ~= objets] %}

#### Graphes
{% bibliography --query @*[keywords ~= graphes] %}

### Module 2 --- Vecteurs

{% bibliography --query @*[keywords ~= module2] %}

### Module 3 --- Types

{% bibliography --query @*[keywords ~= module3] %}

### Module 4 --- Catégories

{% bibliography --query @*[keywords ~= module4] %}

### Literature critique

{% bibliography --query @*[keywords ~= critique] %}


## Ressources utiles

- [Visual Studio Code](https://code.visualstudio.com)
- [Python](https://www.python.org)
- [Z3 guide](https://microsoft.github.io/z3guide/docs/logic/intro/), [repo](https://github.com/z3prover/z3)
- [Lean Game Server](https://adam.math.hhu.de)

## Contact

*(À compléter : modalités de contact — forum de la plateforme du cours, adresse
électronique, permanences.)*
