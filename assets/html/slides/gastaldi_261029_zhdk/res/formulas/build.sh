#!/bin/sh
# Renders the formulas and commutative diagrams of the slides that LaTeX
# sets better than MathJax (tikz-cd) to SVG in media/: latex, then
# dvisvgm, TikZ using its dvisvgm driver; the glyphs become paths, so the
# pictures need no fonts. The variants of cd_sets are the layers of the
# square's steps, all of one box, to be stacked.
# Usage, from Slides/: sh res/formulas/build.sh
set -e
here=$(cd "$(dirname "$0")" && pwd)
media="$here/../../media"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cd "$tmp"
svg() {  # svg <name> <source> <variant>
  TEXINPUTS="$here:" latex -interaction=nonstopmode -halt-on-error \
    -jobname="$1" "\\def\\variant{$3}\\input{$2}" > /dev/null
  dvisvgm --no-fonts --bbox=papersize -o "$media/$1.svg" "$1.dvi" 2> /dev/null
}
svg cd_sets cd_sets 0
svg cd_sets_base cd_sets 1
svg cd_sets_incl cd_sets 2
svg cd_sets_adj cd_sets 3
svg cd_sets_adj_red cd_sets 4
svg cd_sets_adj_blue cd_sets 5
svg cd_categories cd_categories 0
svg profunctor_set formulas 1
svg profunctor_rbar formulas 2
svg adjunction_rbar formulas 3
svg nucleus_op formulas 4
svg downarrow formulas 5
svg addition_spec formulas 6
svg peano_structure formulas 7
