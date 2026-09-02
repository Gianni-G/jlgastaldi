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
Moodle. Les étudiant·es sont
responsables de la consultation des messages qui y sont diffusés.

## Évaluation

La note finale sera établie selon la répartition suivante :

- **50% Contrôle continu**
- **50% Examen final**

### Contrôle continu

- Dates: 02/11; 30/11

### Examen final

- Date: À définir 


## Documents de cours

- *(Syllabus — à compléter)*
- *(Consignes des travaux hebdomadaires — à compléter)*
- *(Grille d'évaluation — à compléter)*

## Actualités

**25.08** &emsp; Mise en ligne du site du cours.

## Programme

<!-- 13 séances, tous les lundis du 14.09.26 au 14.12.26, sauf le 26.10.26
     (vacances de la Toussaint).
     La cellule « Module » est fusionnée verticalement via rowspan="N" : elle
     n'apparaît que sur la première séance du module, et N doit être égal au
     nombre de séances de ce module. En ajoutant ou en supprimant une séance à
     l'intérieur d'un module, penser à ajuster ce rowspan. -->

<table class="table">
  <thead>
    <tr>
      <th scope="col" style='white-space:nowrap'>Séance</th>
      <th scope="col" style='white-space:nowrap'>Date</th>
      <th scope="col" style='white-space:nowrap'>Module</th>
      <th scope="col" style='white-space:nowrap'>Thème</th>
      <th scope="col" style='white-space:nowrap'>Lectures</th>
      <th scope="col" style='white-space:nowrap'>Slides</th>
      <th scope="col" style='white-space:nowrap'>TD</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td style='white-space:nowrap'>14.09.26</td>
      <td style="vertical-align : middle;text-align:center;" align="center"><b>Introduction</b></td>
      <td>Introduction</td>
      <td>{% cite nietzsche1873delaverite %}</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td style='white-space:nowrap'>21.09.26</td>
      <td rowspan="5" style="vertical-align : middle;text-align:center;" align="center"><b>Module 1 :<br>Propositions</b></td>
      <td>Logique propositionnelle</td>
      <td>{% cite lifschitz2008knowledgerepresentation %}</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td style='white-space:nowrap'>28.09.26</td>
      <td>Logique de premier ordre</td>
      <td>{% cite lifschitz2008knowledgerepresentation %}</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <th scope="row">4</th>
      <td style='white-space:nowrap'>05.10.26</td>
      <td>Logiques de description</td>
      <td>{% cite baader2008descriptionlogics %}</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <th scope="row">6</th>
      <td style='white-space:nowrap'>12.10.26</td>
      <td>Ingénierie des connaissances (Ontologies)</td>
      <td>{% cite schreiber2008knowledgeengineering %}</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <th scope="row">5</th>
      <td style='white-space:nowrap'>19.10.26</td>
      <td>Graphes de connaissance</td>
      <td>{% cite sowa2008conceptualgraphs %}</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <th scope="row">7</th>
      <td style='white-space:nowrap'>02.11.26</td>
      <td rowspan="2" style="vertical-align : middle;text-align:center;" align="center"><b>Module 2 :<br>Vecteurs</b></td>
      <td>Représentations vectorielles I</td>
      <td></td>
      <td></td>
      <td>Contrôle continu</td>
    </tr>
    <tr>
      <th scope="row">8</th>
      <td style='white-space:nowrap'>09.11.26</td>
      <td>Représentations vectorielles II</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <th scope="row">9</th>
      <td style='white-space:nowrap'>16.11.26</td>
      <td rowspan="2" style="vertical-align : middle;text-align:center;" align="center"><b>Module 3 :<br>Types</b></td>
      <td>Théorie des types I</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <th scope="row">10</th>
      <td style='white-space:nowrap'>23.11.26</td>
      <td>Théorie des types II</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <th scope="row">11</th>
      <td style='white-space:nowrap'>30.11.26</td>
      <td rowspan="2" style="vertical-align : middle;text-align:center;" align="center"><b>Module 4 :<br>Catégories</b></td>
      <td>Catégories I</td>
      <td>{% cite fong2019invitation %}</td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <th scope="row">12</th>
      <td style='white-space:nowrap'>07.12.26</td>
      <td>Catégories II</td>
      <td>{% cite spivak2012ologs %}</td>
      <td></td>
      <td>Contrôle continu</td>
    </tr>
    <tr>
      <th scope="row">13</th>
      <td style='white-space:nowrap'>14.12.26</td>
      <td style="vertical-align : middle;text-align:center;" align="center"><b>Révision</b></td>
      <td>Révision</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

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
